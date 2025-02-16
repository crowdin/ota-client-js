import { FetchHttpClient } from './internal/http/fetch';
import { isJsonFile, mergeDeep } from './internal/util/strings';
import { ClientConfig, HttpClient, LanguageStrings, LanguageTranslations, Manifest, Translations } from './model';

/**
 * @category OtaClient
 */
export default class OtaClient {
    /** @internal */
    public static readonly BASE_URL = 'https://distributions.crowdin.net';

    private readonly httpClient: HttpClient;

    private manifestHolder?: Promise<Manifest>;
    private disableManifestCache = false;

    private stringsCache: { [file: string]: Promise<any> } = {};
    private disableStringsCache = false;

    private disableJsonDeepMerge = false;
    private locale?: string;

    /**
     * @param distributionHash Hash of released Crowdin project distribution
     * @param config Client config
     */
    constructor(
        private distributionHash: string,
        config?: ClientConfig,
    ) {
        this.httpClient = config?.httpClient || new FetchHttpClient();
        this.disableManifestCache = !!config?.disableManifestCache;
        this.locale = config?.languageCode;
        this.disableStringsCache = !!config?.disableStringsCache;
        this.disableJsonDeepMerge = !!config?.disableJsonDeepMerge;
    }

    /**
     * Get the distribution hash.
     *
     * @category Helper Methods
     */
    getHash(): string {
        return this.distributionHash;
    }

    /**
     * Define the global language for the client instance.
     * Default language code to be used if language was not passed as an input argument of the method.
     *
     * @category Helper Methods
     * @param languageCode {@link https://support.crowdin.com/developer/language-codes/ Language Code}
     */
    setCurrentLocale(languageCode?: string): void {
        this.locale = languageCode;
    }

    /**
     * Get the current locale of the client instance.
     *
     * @category Helper Methods
     */
    getCurrentLocale(): string | undefined {
        return this.locale;
    }

    /**
     * Get distribution's manifest timestamp.
     *
     * @category Helper Methods
     */
    async getManifestTimestamp(): Promise<number> {
        return (await this.manifest).timestamp;
    }

    /**
     * List distribution's files content.
     *
     * @category Content Management Methods
     *
     * @returns An object mapping {@link https://support.crowdin.com/developer/language-codes/ Language Code} to arrays of strings: `{[languageCode: string]: string[]}`
     */
    async getContent(): Promise<Manifest['content']> {
        return (await this.manifest).content;
    }

    /**
     * List distribution's files content for a specific language.
     *
     * @category Content Management Methods
     *
     * @param languageCode {@link https://support.crowdin.com/developer/language-codes/ Language Code}
     */
    async getLanguageContent(languageCode?: string): Promise<string[]> {
        const language = this.getLanguageCode(languageCode);
        const content = await this.getContent();
        return content[language];
    }

    /**
     * List Crowdin project {@link https://support.crowdin.com/developer/language-codes/ language codes}.
     *
     * @category Helper Methods
     */
    async listLanguages(): Promise<string[]> {
        return Object.keys(await this.getContent());
    }

    /**
     * Get all translations for all languages.
     *
     * @category Content Management Methods
     *
     * @returns All translations per each language code
     */
    async getTranslations(): Promise<Translations> {
        const languages = await this.listLanguages();
        const translations: Translations = {};
        await Promise.all(
            languages.map(async (language) => {
                translations[language] = await this.getLanguageTranslations(language);
            }),
        );
        return translations;
    }

    /**
     * Get translations for a specific language.
     *
     * @category Content Management Methods
     *
     * @param languageCode {@link https://support.crowdin.com/developer/language-codes/ Language Code}
     * @returns Translations for each file in the distribution for a given language (content)
     */
    async getLanguageTranslations(languageCode?: string): Promise<LanguageTranslations[]> {
        const language = this.getLanguageCode(languageCode);
        const content = await this.getContent();
        const files = content[language] || [];
        return Promise.all(
            files.map(async (file) => {
                const content = await this.getFileTranslations(file);
                return { content, file };
            }),
        );
    }

    /**
     * Get translations for a specific file.
     *
     * @category Content Management Methods
     *
     * @param file file content path
     * @returns Translations for a specific file (content)
     */
    async getFileTranslations(file: string): Promise<string | any | null> {
        const content = await this.getContent();
        const fileExists = Object.values(content).some((files) => files.includes(file));
        if (!fileExists) {
            throw new Error(`File ${file} does not exists in manifest content`);
        }
        const timestamp = await this.getManifestTimestamp();
        const url = `${OtaClient.BASE_URL}/${this.distributionHash}${file}?timestamp=${timestamp}`;
        return this.httpClient.get<string | any>(url).catch(() => null);
    }

    /**
     * Get all translation strings for all languages.
     *
     * @category Strings Management Methods
     *
     * @returns Translation strings from json-based files for all languages
     */
    async getStrings(): Promise<LanguageStrings> {
        const content = await this.getJsonFiles();
        const res: LanguageStrings = {};
        await Promise.all(
            Object.entries(content).map(async ([lang, files]) => {
                res[lang] = await this.getStringsByFilesAndLocale(files);
            }),
        );
        return res;
    }

    /**
     * Get translation strings for a specific language.
     *
     * @category Strings Management Methods
     *
     * @param languageCode {@link https://support.crowdin.com/developer/language-codes/ Language Code}
     * @returns Translation strings from json-based files for a given language
     */
    async getStringsByLocale(languageCode?: string): Promise<any> {
        const language = this.getLanguageCode(languageCode);
        const content = await this.getJsonFiles();
        return this.getStringsByFilesAndLocale(content[language] || []);
    }

    /**
     * Get translation string for a specific key.
     *
     * @category Strings Management Methods
     *
     * @param key path to the translation string in json file
     * @param languageCode {@link https://support.crowdin.com/developer/language-codes/ Language Code}
     * @returns Translation string for language for given key
     */
    async getStringByKey(key: string[] | string, languageCode?: string): Promise<string | any> {
        const strings = await this.getStringsByLocale(languageCode);
        const path = Array.isArray(key) ? key : [key];
        const firstKey = path.shift();
        if (!firstKey) {
            return undefined;
        }
        let res = strings[firstKey];
        for (const keyPart of path) {
            res = res?.[keyPart];
        }
        return res;
    }

    /**
     * Clear the translation strings cache.
     *
     * @category Helper Methods
     */
    clearStringsCache(): void {
        this.stringsCache = {};
    }

    private async getStringsByFilesAndLocale(files: string[]): Promise<any> {
        let strings = {};
        for (const filePath of files) {
            let content;
            if (this.disableStringsCache) {
                content = await this.getFileTranslations(filePath);
            } else {
                if (!this.stringsCache[filePath]) {
                    this.stringsCache[filePath] = this.getFileTranslations(filePath);
                }
                content = await this.stringsCache[filePath];
            }
            if (this.disableJsonDeepMerge) {
                strings = { ...strings, ...content };
            } else {
                mergeDeep(strings, content);
            }
        }
        return strings;
    }

    private get manifest(): Promise<Manifest> {
        if (this.manifestHolder && !this.disableManifestCache) {
            return this.manifestHolder;
        } else {
            this.manifestHolder = this.httpClient.get(`${OtaClient.BASE_URL}/${this.distributionHash}/manifest.json`);
            return this.manifestHolder;
        }
    }

    private getLanguageCode(lang?: string): string {
        const languageCode = lang || this.getCurrentLocale();
        if (languageCode) {
            return languageCode;
        } else {
            throw new Error(
                'Language code should be either provided through input arguments or by "setCurrentLocale" method',
            );
        }
    }

    private async getJsonFiles(): Promise<Manifest['content']> {
        const content = await this.getContent();
        const res: Manifest['content'] = {};
        Object.entries(content).forEach(([lang, files]) => (res[lang] = files.filter(isJsonFile)));
        return res;
    }
}
