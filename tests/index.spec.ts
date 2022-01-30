import * as nock from 'nock';
import OtaClient, { Manifest } from '../src/index';

describe('OTA client', () => {
    const now = Date.now();
    let scope: nock.Scope;
    const languageCode = 'uk';
    const hash = 'testHash';
    const hashForStrings = 'jsonTestHash';
    const client: OtaClient = new OtaClient(hash);
    const clientWithJsonFiles: OtaClient = new OtaClient(hashForStrings, { languageCode });
    const fileContent = '"apple","яблуко","","",""';
    const filePath = '/folder1/file1.csv';
    const customLanguageLocale = 'ua';
    const manifest: Manifest = {
        files: [filePath],
        languages: [languageCode],
        timestamp: now,
        /* eslint-disable @typescript-eslint/camelcase */
        language_mapping: {
            uk: {
                locale: customLanguageLocale,
            },
        },
        custom_languages: [],
        /* eslint-enable @typescript-eslint/camelcase */
    };
    const jsonFilePath1 = '/folder/file1.json';
    const jsonFilePath2 = '/folder/file2.json';
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
    const manifestWithJsonFiles: Manifest = {
        files: [jsonFilePath1, jsonFilePath2],
        languages: [languageCode],
        timestamp: now,
        /* eslint-disable @typescript-eslint/camelcase */
        language_mapping: [],
        custom_languages: [],
        /* eslint-enable @typescript-eslint/camelcase */
    };

    beforeAll(() => {
        scope = nock(OtaClient.BASE_URL)
            .get(`/${hash}/manifest.json`)
            .reply(200, manifest)
            .get(`/${hash}/content/${languageCode}${filePath}?timestamp=${now}`)
            .times(3)
            .reply(200, fileContent)
            .get(`/${hashForStrings}/manifest.json`)
            .reply(200, manifestWithJsonFiles)
            .get(`/${hashForStrings}/content/${languageCode}${jsonFilePath1}?timestamp=${now}`)
            .reply(200, jsonFileContent1)
            .get(`/${hashForStrings}/content/${languageCode}${jsonFilePath2}?timestamp=${now}`)
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

    it('should return list of files from manifest', async () => {
        const files = await client.listFiles();
        expect(files).toEqual(manifest.files);
    });

    it('should return list of languages from manifest', async () => {
        const languages = await client.listLanguages();
        expect(languages).toEqual(manifest.languages);
    });

    it('should return language mappings', async () => {
        const mappings = (await client.getLanguageMappings()) || {};
        expect(mappings).toBeDefined();
        expect(mappings[languageCode]).toBeDefined();
        expect(mappings[languageCode].locale).toEqual(customLanguageLocale);
    });

    it('should return file translations', async () => {
        const translations = await client.getFileTranslations(filePath, languageCode);
        expect(translations).toBe(fileContent);
    });

    it('should return language translations', async () => {
        const translations = await client.getLanguageTranslations(languageCode);
        expect(translations.length).toBe(1);
        expect(translations[0].file).toBe(filePath);
        expect(translations[0].content).toBe(fileContent);
    });

    it('should return all translations', async () => {
        const translations = await client.getTranslations();
        expect(translations[languageCode].length).toBe(1);
        expect(translations[languageCode][0].file).toBe(filePath);
        expect(translations[languageCode][0].content).toBe(fileContent);
    });

    it('should not get translations for language if language was not specified', async () => {
        const newClient = new OtaClient(hash);
        expect(async () => await newClient.getLanguageTranslations()).rejects.toThrowError();
    });

    it('should return translation strings for all languages', async () => {
        const strings = await clientWithJsonFiles.getStrings();
        expect(strings[languageCode]).toBeDefined();
        expect(strings[languageCode].application.title).toBe(jsonFileContent1.application.title);
        expect(strings[languageCode].application.description).toBe(jsonFileContent2.application.description);
    });

    it('should return translation strings for specific language', async () => {
        const strings = await clientWithJsonFiles.getStringsByLocale();
        expect(strings.application.title).toBe(jsonFileContent1.application.title);
        expect(strings.application.description).toBe(jsonFileContent2.application.description);
    });

    it('should return translation string by key', async () => {
        const title = await clientWithJsonFiles.getStringByKey(['application', 'title']);
        expect(title).toBe(jsonFileContent1.application.title);
    });
});
