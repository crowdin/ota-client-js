import { isJsonFile, mergeDeep } from '../../../src/internal/util/strings';

describe('Strings Util', () => {
    it('should detect json file', () => {
        const file1 = '/folder1/folder2/file.txt';
        const file2 = '/fol.der3/folder4/file.json';
        expect(isJsonFile(file1)).toBe(false);
        expect(isJsonFile(file2)).toBe(true);
    });

    it('shoud deep merge two objects', () => {
        const target: any = {
            field1: {
                value1: 'Test1',
            },
            field2: {
                value2: 'Test2',
            },
        };
        const source = {
            field1: {
                value3: 'Test3',
            },
            field3: {
                value4: 'Test4',
            },
        };
        mergeDeep(target, source);
        expect(target.field1.value1).toBe('Test1');
        expect(target.field2.value2).toBe('Test2');
        expect(target.field1.value3).toBe(source.field1.value3);
        expect(target.field3.value4).toBe(source.field3.value4);
    });
});
