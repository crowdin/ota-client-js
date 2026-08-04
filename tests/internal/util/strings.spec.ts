import { isJsonFile, mergeDeep } from '../../../src/internal/util/strings';

describe('Strings Util', () => {
    it('should detect json file', () => {
        const file1 = '/folder1/folder2/file.txt';
        const file2 = '/fol.der3/folder4/file.json';
        expect(isJsonFile(file1)).toBe(false);
        expect(isJsonFile(file2)).toBe(true);
    });

    it('should not pollute Object.prototype via __proto__ key', () => {
        const source = JSON.parse('{"__proto__":{"isAdmin":true}}');
        const target: any = Object.create(null);
        mergeDeep(target, source);
        expect(({} as any).isAdmin).toBeUndefined();
        expect(Object.prototype.hasOwnProperty.call({}, 'isAdmin')).toBe(false);
        // __proto__ is stored as a safe own property, not as a prototype mutation
        expect(Object.prototype.hasOwnProperty.call(target, '__proto__')).toBe(true);
    });

    it('should not pollute via nested __proto__ key', () => {
        const source = JSON.parse('{"a":{"__proto__":{"injected":"x"}}}');
        const target: any = Object.create(null);
        mergeDeep(target, source);
        expect(({} as any).injected).toBeUndefined();
    });

    it('should allow __proto__, constructor, prototype as legitimate translation keys', () => {
        const source: any = JSON.parse('{"__proto__":"value1","constructor":"value2","prototype":"value3"}');
        const target: any = Object.create(null);
        mergeDeep(target, source);
        expect(Object.prototype.hasOwnProperty.call(target, '__proto__')).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(target, 'constructor')).toBe(true);
        expect(Object.prototype.hasOwnProperty.call(target, 'prototype')).toBe(true);
        expect(Object.getPrototypeOf({})).toBe(Object.prototype);
        expect((Object.prototype as any).value1).toBeUndefined();
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
