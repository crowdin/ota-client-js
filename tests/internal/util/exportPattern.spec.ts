import { CustomLanguage } from '../../../src';
import { includesLanguagePlaceholders, replaceLanguagePlaceholders } from '../../../src/internal/util/exportPattern';

describe('Export Pattern Util', () => {
    it('should detect language placehodlers', () => {
        const string1 = '/test/%locale%/%three_letters_code%/file.csv';
        const string2 = '/folder1/folder2/file.txt';
        expect(includesLanguagePlaceholders(string1)).toBe(true);
        expect(includesLanguagePlaceholders(string2)).toBe(false);
    });

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
        const customLanguage: CustomLanguage = {
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
        expect(replaceLanguagePlaceholders(str1, 'uk')).toBe('/folder/uk-UA/ukr/file1.csv');
        expect(replaceLanguagePlaceholders(str2, 'es')).toBe('/Spanish/es/file2.csv');
        expect(replaceLanguagePlaceholders(str3, 'en')).toBe('/en_US/en-rUS/file3.csv');
        expect(replaceLanguagePlaceholders(str4, 'de')).toBe('/de.lproj/de/file4.csv');
        expect(replaceLanguagePlaceholders(str5, 'es-US')).toBe('/Spanish, United States/es/es-US/file5.csv');
        expect(replaceLanguagePlaceholders(str6, 'en-GB')).toBe('/English, United Kingdom/en_GB/en/en-GB/file6.csv');
        expect(replaceLanguagePlaceholders(str7, 'uk', languageMapping)).toBe('/Ukrainian/ua_UA/ua/file7.csv');
        expect(replaceLanguagePlaceholders(str3, 'tl', undefined, customLanguage)).toBe('/tl_Gr/tl-rGr/file3.csv');
    });

    it('should throw error for invalid language code', () => {
        expect(() => replaceLanguagePlaceholders('test', 'invalidLang')).toThrowError();
        expect(() => replaceLanguagePlaceholders('test', 'pt-PT')).not.toThrowError();
    });
});
