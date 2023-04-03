export function isJsonFile(file: string): boolean {
    const extension = (file ?? '').split('.').pop();
    return extension?.toLocaleLowerCase() === 'json';
}

function isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
}

export function mergeDeep(targetObj: any, sourceObj: any): any {
    const target = targetObj ?? {};
    const source = sourceObj ?? {};
    Object.keys(source).forEach((key) => {
        if (isObject(source[key])) {
            if (!(key in target)) {
                target[key] = source[key];
            } else {
                target[key] = mergeDeep(target[key], source[key]);
            }
        } else {
            target[key] = source[key];
        }
    });
    return target;
}
