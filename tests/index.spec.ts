import * as nock from 'nock';
import OtaClient, { Manifest } from '../src/index';

describe('OTA client', () => {
    let scope: nock.Scope;
    const hash = 'testHash';
    const client: OtaClient = new OtaClient(hash);
    const languageCode = 'uk';
    const fileContent = '"apple","яблуко","","",""';
    const filePath = '/folder1/file1.csv';
    const manifest: Manifest = {
        files: [filePath],
        languages: [languageCode],
        timestamp: Date.now(),
    };

    beforeAll(() => {
        scope = nock(OtaClient.BASE_URL)
            .get(`/${hash}/manifest.json`)
            .reply(200, manifest)
            .get(`/${hash}/content/${languageCode}${filePath}`)
            .times(3)
            .reply(200, fileContent);
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

    it('should return list of files from manifest', async () => {
        const files = await client.listFiles();
        expect(files).toEqual(manifest.files);
    });

    it('should return list of languages from manifest', async () => {
        const languages = await client.listLanguages();
        expect(languages).toEqual(manifest.languages);
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
});
