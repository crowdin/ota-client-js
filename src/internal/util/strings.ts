export function isJsonFile(file: string): boolean {
    const extension = (file ?? '').split('.').pop();
    return extension?.toLocaleLowerCase() === 'json';
}

function isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
}

export function mergeDeep(targetObj: any, sourceObj: any): any {
    const target = targetObj ?? Object.create(null);
    const source = sourceObj ?? {};
    Object.keys(source).forEach((key) => {
        const sourceVal = source[key];
        if (isObject(sourceVal)) {
            const ownVal = Object.prototype.hasOwnProperty.call(target, key) ? target[key] : undefined;
            const subTarget = isObject(ownVal) ? ownVal : Object.create(null);
            Object.defineProperty(target, key, {
                value: mergeDeep(subTarget, sourceVal),
                writable: true,
                enumerable: true,
                configurable: true,
            });
        } else {
            Object.defineProperty(target, key, {
                value: sourceVal,
                writable: true,
                enumerable: true,
                configurable: true,
            });
        }
    });
    return target;
}
