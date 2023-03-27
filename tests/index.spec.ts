import * as nock from 'nock';
import OtaClient from '../src/index';
import { Manifest } from '../src/model';

describe('OTA client', () => {
    const now = Date.now();
    let scope: nock.Scope;
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
        /* eslint-disable @typescript-eslint/camelcase */
        language_mapping: [] as never[],
        custom_languages: [] as never[],
        /* eslint-enable @typescript-eslint/camelcase */
    };

    beforeAll(() => {
        scope = nock(OtaClient.BASE_URL)
            .get(`/${hash}/manifest.json`)
            .reply(200, manifest)
            .get(`/${hash}${filePath}?timestamp=${now}`)
            .times(3)
            .reply(200, fileContent)
            .get(`/${hash}${jsonFilePath1}?timestamp=${now}`)
            .times(3)
            .reply(200, jsonFileContent1)
            .get(`/${hash}${jsonFilePath2}?timestamp=${now}`)
            .times(3)
            .reply(200, jsonFileContent2);
    });

    afterAll(() => {
        scope.done();
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
        expect(translations.find(e => e.file === filePath)?.content).toBe(fileContent);
    });

    it('should return all translations', async () => {
        const translations = await client.getTranslations();
        expect(translations[languageCode].length).toBe(3);
        expect(translations[languageCode].find(e => e.file === filePath)?.content).toBe(fileContent);
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
