import OtaClient from '../src/index';
import { Manifest } from '../src/model';

describe('OTA client', () => {
    const now = Date.now();
    const languageCode = 'uk';
    const hash = 'testHash';
    const client = new OtaClient(hash);

    const fileContent = '"apple","яблуко","","",""';
    const filePath = '/content/uk/folder1/file1.csv';
    const jsonFilePath1 = '/content/uk/folder/file1.json';
    const jsonFilePath2 = '/content/uk/folder/file2.json';
    const jsonFileContent1 = {
        application: {
            title: 'Тестова назва',
        },
    };
    const jsonFileContent2 = {
        application: {
            description: 'Тестовий опис',
        },
    };

    const manifest: Manifest = {
        files: [filePath],
        languages: [languageCode],
        timestamp: now,
        content: {
            uk: [filePath, jsonFilePath1, jsonFilePath2],
        },
        mapping: ['/mapping/en/folder1/file1.csv', '/mapping/en/folder/file1.json', '/mapping/en/folder/file2.json'],
        language_mapping: [] as never[],
        custom_languages: [] as never[],
    };

    beforeAll(() => {
        global.fetch = jest.fn((url) => {
            switch (url) {
                case `${OtaClient.BASE_URL}/${hash}/manifest.json`:
                    return Promise.resolve({
                        headers: new Headers({ 'Content-Type': 'application/json' }),
                        json: () => Promise.resolve(manifest),
                    });
                case `${OtaClient.BASE_URL}/${hash}${filePath}?timestamp=${now}`:
                    return Promise.resolve({
                        headers: new Headers({ 'Content-Type': 'text/plain' }),
                        text: () => Promise.resolve(fileContent),
                    });
                case `${OtaClient.BASE_URL}/${hash}${jsonFilePath1}?timestamp=${now}`:
                    return Promise.resolve({
                        headers: new Headers({ 'Content-Type': 'application/json' }),
                        json: () => Promise.resolve(jsonFileContent1),
                    });
                case `${OtaClient.BASE_URL}/${hash}${jsonFilePath2}?timestamp=${now}`:
                    return Promise.resolve({
                        headers: new Headers({ 'Content-Type': 'application/json' }),
                        json: () => Promise.resolve(jsonFileContent2),
                    });
                default:
                    throw new Error('Unknown request');
            }
        }) as jest.Mock;
    });

    it('should return correct hash', () => {
        expect(client.getHash()).toBe(hash);
    });

    it('should store correct language code', () => {
        expect(client.getCurrentLocale()).toBeUndefined();
        client.setCurrentLocale(languageCode);
        expect(client.getCurrentLocale()).toBe(languageCode);
    });

    it('should return manifest timestamp', async () => {
        const timestamp = await client.getManifestTimestamp();
        expect(timestamp).toEqual(manifest.timestamp);
        expect(timestamp).toEqual(now);
    });

    it('should return content from manifest', async () => {
        const content = await client.getContent();
        expect(content).toEqual(manifest.content);
    });

    it('should return list of languages from manifest', async () => {
        const languages = await client.listLanguages();
        expect(languages).toEqual(manifest.languages);
    });

    it('should return file translations', async () => {
        const translations = await client.getFileTranslations(filePath);
        expect(translations).toBe(fileContent);
    });

    it('should return language translations', async () => {
        const translations = await client.getLanguageTranslations(languageCode);
        expect(translations.length).toBe(3);
        expect(translations.find((e) => e.file === filePath)?.content).toBe(fileContent);
    });

    it('should return all translations', async () => {
        const translations = await client.getTranslations();
        expect(translations[languageCode].length).toBe(3);
        expect(translations[languageCode].find((e) => e.file === filePath)?.content).toBe(fileContent);
    });

    it('should not get translations for language if language was not specified', async () => {
        const newClient = new OtaClient(hash);
        expect(async () => await newClient.getLanguageTranslations()).rejects.toThrowError();
    });

    it('should return translation strings for all languages', async () => {
        const strings = await client.getStrings();
        expect(strings[languageCode]).toBeDefined();
        expect(strings[languageCode].application.title).toBe(jsonFileContent1.application.title);
        expect(strings[languageCode].application.description).toBe(jsonFileContent2.application.description);
    });

    it('should return translation strings for specific language', async () => {
        const strings = await client.getStringsByLocale(languageCode);
        expect(strings.application.title).toBe(jsonFileContent1.application.title);
        expect(strings.application.description).toBe(jsonFileContent2.application.description);
    });

    it('should return translation string by key', async () => {
        const title = await client.getStringByKey(['application', 'title'], languageCode);
        expect(title).toBe(jsonFileContent1.application.title);
    });
});
