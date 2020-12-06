import { includesLanguagePlaceholders } from '../../../src/internal/util/exportPattern';

describe('Export Pattern Util', () => {
    it('should detect language placehodlers', () => {
        const string1 = '/test/%locale%/%three_letters_code%/file.csv';
        const string2 = '/folder1/folder2/file.txt';
        expect(includesLanguagePlaceholders(string1)).toBe(true);
        expect(includesLanguagePlaceholders(string2)).toBe(false);
    });
});
