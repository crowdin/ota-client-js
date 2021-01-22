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
        expect(replaceLanguagePlaceholders(str1, 'uk')).toBe('/folder/uk-UA/ukr/file1.csv');
        expect(replaceLanguagePlaceholders(str2, 'es')).toBe('/Spanish/es/file2.csv');
        expect(replaceLanguagePlaceholders(str3, 'en')).toBe('/en_US/en-rUS/file3.csv');
        expect(replaceLanguagePlaceholders(str4, 'de')).toBe('/de.lproj/de/file4.csv');
        expect(replaceLanguagePlaceholders(str5, 'es-US')).toBe('/Spanish, United States/es/es-US/file5.csv');
        expect(replaceLanguagePlaceholders(str6, 'en-GB')).toBe('/English, United Kingdom/en_GB/en/en-GB/file6.csv');
    });

    it('should throw error for invalid language code', () => {
        expect(() => replaceLanguagePlaceholders('test', 'invalidLang')).toThrowError();
        expect(() => replaceLanguagePlaceholders('test', 'pt-PT')).not.toThrowError();
    });
});
