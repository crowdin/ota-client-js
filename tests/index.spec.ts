import * as nock from 'nock';
import OtaClient, { Manifest } from '../src/index';
import { Language } from '../src/internal/util/exportPattern';

describe('OTA client', () => {
    const now = Date.now();
    let scope: nock.Scope;
    const languageCode = 'uk';
    const languageLocale = 'uk-UA';
    const languageObject: Language = {
        id: 'uk',
        name: 'Ukrainian',
        editorCode: 'uk',
        twoLettersCode: 'uk',
        threeLettersCode: 'ukr',
        locale: 'uk-UA',
        androidCode: 'uk-rUA',
        osxCode: 'uk.lproj',
        osxLocale: 'uk',
        pluralCategoryNames: ['one', 'few', 'many', 'other'],
        pluralRules:
            '((n%10==1 && n%100!=11) ? 0 : ((n%10 >= 2 && n%10 <=4 && (n%100 < 12 || n%100 > 14)) ? 1 : ((n%10 == 0 || (n%10 >= 5 && n%10 <=9)) || (n%100 >= 11 && n%100 <= 14)) ? 2 : 3))',
        pluralExamples: [
            '1, 21, 31, 41, 51, 61, 71, 81...',
            '2-4, 22-24, 32-34, 42-44, 52-54, 62...',
            '0, 5-19, 100, 1000, 10000...',
            '0.0-0.9, 1.1-1.6, 10.0, 100.0...',
        ],
        textDirection: 'ltr',
        dialectOf: null,
    };
    const hash = 'testHash';
    const hashForStrings = 'jsonTestHash';
    const hashForPlaceholders = 'jsonTestHashForPlaceholders';
    const client = new OtaClient(hash);
    const clientWithJsonFiles = new OtaClient(hashForStrings, { languageCode });
    const clientWithPlaceholders = new OtaClient(hashForPlaceholders);
    const fileContent = '"apple","яблуко","","",""';
    const filePath = '/folder1/file1.csv';
    const filePathWithPlaceholder = '/folder1/%locale%/file1.csv';
    const filePathReplacedPlaceholder = '/folder1/uk-UA/file1.csv';
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
        custom_languages: [] as never[],
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
        language_mapping: [] as never[],
        custom_languages: [] as never[],
        /* eslint-enable @typescript-eslint/camelcase */
    };
    const manifestWithPlaceholders: Manifest = {
        files: [filePathWithPlaceholder],
        languages: [languageCode],
        timestamp: now,
        /* eslint-disable @typescript-eslint/camelcase */
        language_mapping: [] as never[],
        custom_languages: [] as never[],
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
            .reply(200, jsonFileContent2)
            .get(`/${hashForPlaceholders}/manifest.json`)
            .reply(200, manifestWithPlaceholders);
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

    it('should return an object with the language ids and an array of files with their formats correctly replaced', async () => {
        const replacedFiles = await clientWithPlaceholders.getReplacedFiles();
        expect(replacedFiles.uk.length).toEqual(manifest.files.length);
        expect(replacedFiles.uk).toEqual([filePathReplacedPlaceholder]);
    });

    it('should return list of languages from manifest', async () => {
        const languages = await client.listLanguages();
        expect(languages).toEqual(manifest.languages);
    });

    it('should return list of languages in the given format', async () => {
        const languages = await clientWithPlaceholders.getReplacedLanguages('%locale%');
        expect(languages.length).toEqual(manifest.languages.length);
        expect(languages).toEqual([languageLocale]);
    });

    it('should return an array of language objects', async () => {
        const languageObjects = await client.getLanguageObjects();
        expect(languageObjects.length).toEqual(manifest.languages.length);
        expect(languageObjects).toEqual([languageObject]);
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
