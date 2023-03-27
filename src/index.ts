import { AxiosHttpClient } from './internal/http/axiosClient';
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
     * @param distributionHash hash of released Crowdin project distribution
     * @param config client config
     */
    constructor(private distributionHash: string, config?: ClientConfig) {
        this.httpClient = config?.httpClient || new AxiosHttpClient();
        this.disableManifestCache = !!config?.disableManifestCache;
        this.locale = config?.languageCode;
        this.disableStringsCache = !!config?.disableStringsCache;
        this.disableJsonDeepMerge = !!config?.disableJsonDeepMerge;
    }

    /**
     * Distribution hash
     */
    getHash(): string {
        return this.distributionHash;
    }

    /**
     * Default language code to be used if language was not passed as an input argument of the method
     *
     * @param languageCode laguage code
     */
    setCurrentLocale(languageCode?: string): void {
        this.locale = languageCode;
    }

    /**
     * Get language code
     */
    getCurrentLocale(): string | undefined {
        return this.locale;
    }

    /**
     * Get manifest timestamp of distribution
     */
    async getManifestTimestamp(): Promise<number> {
        return (await this.manifest).timestamp;
    }

    /**
     * List of files in distribution
     */
    async getContent(): Promise<Manifest['content']> {
        return (await this.manifest).content;
    }

    /**
     * List of project language codes
     */
    async listLanguages(): Promise<string[]> {
        return Object.keys(await this.getContent());
    }

    /**
     * Returns all translations per each language code
     */
    async getTranslations(): Promise<Translations> {
        const languages = await this.listLanguages();
        const translations: Translations = {};
        await Promise.all(
            languages.map(async language => {
                translations[language] = await this.getLanguageTranslations(language);
            }),
        );
        return translations;
    }

    /**
     * Returns translations per each file in disribution for specific language
     *
     * @param languageCode language code
     */
    async getLanguageTranslations(languageCode?: string): Promise<LanguageTranslations[]> {
        const language = this.getLanguageCode(languageCode);
        const content = await this.getContent();
        const files = content[language] || [];
        return Promise.all(
            files.map(async file => {
                const content = await this.getFileTranslations(file);
                return { content, file };
            }),
        );
    }

    /**
     * Returns file translations
     *
     * @param file file content path
     * @param languageCode language code
     */
    async getFileTranslations(file: string): Promise<string | any | null> {
        const timestamp = await this.getManifestTimestamp();
        const url = `${OtaClient.BASE_URL}/${this.distributionHash}${file}?timestamp=${timestamp}`;
        return this.httpClient.get<string | any>(url).catch(() => null);
    }

    /**
     * Returns translation strings from json-based files for all languages
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
     * Returns translation strings from json-based files for specific language
     *
     * @param languageCode language code
     */
    async getStringsByLocale(languageCode?: string): Promise<any> {
        const language = this.getLanguageCode(languageCode);
        const content = await this.getJsonFiles();
        return this.getStringsByFilesAndLocale(content[language] || []);
    }

    /**
     * Returns translation string for language for specific key
     *
     * @param key path to the translation string in json file
     * @param languageCode language code
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
     * Clear cache of translation strings
     */
    clearStringsCache(): void {
        this.stringsCache = {};
    }

    private async getStringsByFilesAndLocale(files: string[]): Promise<any> {
        let strings = {};
        for (const filePath of files) {
            let content;
            if (!!this.stringsCache[filePath]) {
                content = await this.stringsCache[filePath];
            } else {
                if (!this.disableStringsCache) {
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
