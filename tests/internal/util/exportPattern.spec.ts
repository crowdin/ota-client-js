import { APIData, CustomLanguageRaw } from '../../../src';
import { includesLanguagePlaceholders, replaceLanguagePlaceholders } from '../../../src/internal/util/exportPattern';

describe('Export Pattern Util', () => {
    it('should detect language placehodlers', () => {
        const string1 = '/test/%locale%/%three_letters_code%/file.csv';
        const string2 = '/folder1/folder2/file.txt';
        expect(includesLanguagePlaceholders(string1)).toBe(true);
        expect(includesLanguagePlaceholders(string2)).toBe(false);
    });

    const languages: APIData = {
        data: [
            {
                data: {
                    id: 'uk',
                    name: 'Ukrainian',
                    editorCode: 'uk',
                    twoLettersCode: 'uk',
                    threeLettersCode: 'ukr',
                    locale: 'uk-UA',
                    androidCode: 'uk-rUA',
                    osxCode: 'uk.lproj',
                    osxLocale: 'uk',
                    pluralCategoryNames: ['one', 'few', 'many', 'other'],
                    pluralRules:
                        '((n%10==1 && n%100!=11) ? 0 : ((n%10 >= 2 && n%10 <=4 && (n%100 < 12 || n%100 > 14)) ? 1 : ((n%10 == 0 || (n%10 >= 5 && n%10 <=9)) || (n%100 >= 11 && n%100 <= 14)) ? 2 : 3))',
                    pluralExamples: [
                        '1, 21, 31, 41, 51, 61, 71, 81...',
                        '2-4, 22-24, 32-34, 42-44, 52-54, 62...',
                        '0, 5-19, 100, 1000, 10000...',
                        '0.0-0.9, 1.1-1.6, 10.0, 100.0...',
                    ],
                    textDirection: 'ltr',
                    dialectOf: null,
                },
            },
            {
                data: {
                    id: 'es-ES',
                    name: 'Spanish',
                    editorCode: 'es',
                    twoLettersCode: 'es',
                    threeLettersCode: 'spa',
                    locale: 'es-ES',
                    androidCode: 'es-rES',
                    osxCode: 'es.lproj',
                    osxLocale: 'es',
                    pluralCategoryNames: ['one', 'other'],
                    pluralRules: '(n != 1)',
                    pluralExamples: ['1', '0, 2-999; 1.2, 2.07...'],
                    textDirection: 'ltr',
                    dialectOf: null,
                },
            },
            {
                data: {
                    id: 'en',
                    name: 'English',
                    editorCode: 'en',
                    twoLettersCode: 'en',
                    threeLettersCode: 'eng',
                    locale: 'en-US',
                    androidCode: 'en-rUS',
                    osxCode: 'en.lproj',
                    osxLocale: 'en',
                    pluralCategoryNames: ['one', 'other'],
                    pluralRules: '(n != 1)',
                    pluralExamples: ['1', '0, 2-999; 1.2, 2.07...'],
                    textDirection: 'ltr',
                    dialectOf: null,
                },
            },
            {
                data: {
                    id: 'de',
                    name: 'German',
                    editorCode: 'de',
                    twoLettersCode: 'de',
                    threeLettersCode: 'deu',
                    locale: 'de-DE',
                    androidCode: 'de-rDE',
                    osxCode: 'de.lproj',
                    osxLocale: 'de',
                    pluralCategoryNames: ['one', 'other'],
                    pluralRules: '(n != 1)',
                    pluralExamples: ['1', '0, 2-999; 1.2, 2.07...'],
                    textDirection: 'ltr',
                    dialectOf: null,
                },
            },
            {
                data: {
                    id: 'es-US',
                    name: 'Spanish, United States',
                    editorCode: 'esus',
                    twoLettersCode: 'es',
                    threeLettersCode: 'spa',
                    locale: 'es-US',
                    androidCode: 'es-rUS',
                    osxCode: 'es-US.lproj',
                    osxLocale: 'es_US',
                    pluralCategoryNames: ['one', 'other'],
                    pluralRules: '(n != 1)',
                    pluralExamples: ['1', '0, 2-999; 1.2, 2.07...'],
                    textDirection: 'ltr',
                    dialectOf: 'es-ES',
                },
            },
            {
                data: {
                    id: 'en-GB',
                    name: 'English, United Kingdom',
                    editorCode: 'engb',
                    twoLettersCode: 'en',
                    threeLettersCode: 'eng',
                    locale: 'en-GB',
                    androidCode: 'en-rGB',
                    osxCode: 'en-GB.lproj',
                    osxLocale: 'en_GB',
                    pluralCategoryNames: ['one', 'other'],
                    pluralRules: '(n != 1)',
                    pluralExamples: ['1', '0, 2-999; 1.2, 2.07...'],
                    textDirection: 'ltr',
                    dialectOf: 'en',
                },
            },
            {
                data: {
                    id: 'pt-PT',
                    name: 'Portuguese',
                    editorCode: 'pt',
                    twoLettersCode: 'pt',
                    threeLettersCode: 'por',
                    locale: 'pt-PT',
                    androidCode: 'pt-rPT',
                    osxCode: 'pt.lproj',
                    osxLocale: 'pt',
                    pluralCategoryNames: ['one', 'other'],
                    pluralRules: '(n != 1)',
                    pluralExamples: ['1', '0, 2-999; 1.2, 2.07...'],
                    textDirection: 'ltr',
                    dialectOf: null,
                },
            },
        ],
    };

    it('should replace language placeholders', () => {
        const str1 = '/folder/%locale%/%three_letters_code%/file1.csv';
        const str2 = '/%language%/%two_letters_code%/file2.csv';
        const str3 = '/%locale_with_underscore%/%android_code%/file3.csv';
        const str4 = '/%osx_code%/%osx_locale%/file4.csv';
        const str5 = '/%language%/%two_letters_code%/%locale%/file5.csv';
        const str6 = '/%language%/%locale_with_underscore%/%two_letters_code%/%locale%/file6.csv';
        const str7 = '/%language%/%locale_with_underscore%/%locale%/file7.csv';
        const languageMapping = {
            /*eslint-disable-next-line @typescript-eslint/camelcase*/
            locale_with_underscore: 'ua_UA',
            locale: 'ua',
        };
        const customLanguage: CustomLanguageRaw = {
            name: 'Test Language',
            /*eslint-disable-next-line @typescript-eslint/camelcase*/
            two_letters_code: 'tl',
            /*eslint-disable-next-line @typescript-eslint/camelcase*/
            three_letters_code: 'tlg',
            locale: 'tl-G',
            /*eslint-disable-next-line @typescript-eslint/camelcase*/
            locale_with_underscore: 'tl_Gr',
            /*eslint-disable-next-line @typescript-eslint/camelcase*/
            android_code: 'tl-rGr',
            /*eslint-disable-next-line @typescript-eslint/camelcase*/
            osx_code: 'tlg.lproj',
            /*eslint-disable-next-line @typescript-eslint/camelcase*/
            osx_locale: 'tlg',
        };
        expect(replaceLanguagePlaceholders(str1, 'uk', languages)).toBe('/folder/uk-UA/ukr/file1.csv');
        expect(replaceLanguagePlaceholders(str2, 'es', languages)).toBe('/Spanish/es/file2.csv');
        expect(replaceLanguagePlaceholders(str3, 'en', languages)).toBe('/en_US/en-rUS/file3.csv');
        expect(replaceLanguagePlaceholders(str4, 'de', languages)).toBe('/de.lproj/de/file4.csv');
        expect(replaceLanguagePlaceholders(str5, 'es-US', languages)).toBe(
            '/Spanish, United States/es/es-US/file5.csv',
        );
        expect(replaceLanguagePlaceholders(str6, 'en-GB', languages)).toBe(
            '/English, United Kingdom/en_GB/en/en-GB/file6.csv',
        );
        expect(replaceLanguagePlaceholders(str7, 'uk', languages, languageMapping)).toBe(
            '/Ukrainian/ua_UA/ua/file7.csv',
        );
        expect(replaceLanguagePlaceholders(str3, 'tl', languages, undefined, customLanguage)).toBe(
            '/tl_Gr/tl-rGr/file3.csv',
        );
    });

    it('should throw error for invalid language code', () => {
        expect(() => replaceLanguagePlaceholders('test', 'invalidLang', languages)).toThrowError();
        expect(() => replaceLanguagePlaceholders('test', 'pt-PT', languages)).not.toThrowError();
    });
});
