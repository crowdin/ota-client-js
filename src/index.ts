import { AxiosHttpClient } from './internal/http/axiosClient';
import { includesLanguagePlaceholders, replaceLanguagePlaceholders } from './internal/util/exportPattern';
import { isJsonFile, mergeDeep } from './internal/util/strings';

export interface ClientConfig {
    /**
     * Specify your own http client. Defult uses axios
     */
    httpClient?: HttpClient;
    /**
     * Disable cache of distribution manifest. Default is false
     */
    disableManifestCache?: boolean;
    /**
     * Default language code to be used if language was not passed as an input argument of the method
     */
    languageCode?: string;
    /**
     * Disable translation strings cache. Default is false
     */
    disableStringsCache?: boolean;
    /**
     * Disable deep merge and use shallow merge to merge translation strings from json file
     */
    disableJsonDeepMerge?: boolean;
}

export interface HttpClient {
    /**
     * Executes HTTP GET request
     *
     * @param url http url
     */
    get<T>(url: string): Promise<T>;
}

export interface Manifest {
    files: string[];
    languages: string[];
    timestamp: number;
}

export interface Translations {
    [languageCode: string]: LanguageTranslations[];
}

export interface LanguageTranslations {
    file: string;
    content: string | any;
}

export interface LanguageStrings {
    [languageCode: string]: any;
}

export default class OtaClient {
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
     * List manifest timestamp of distribution
     */
    async getManifestTimestamp(): Promise<number> {
        return (await this.manifest).timestamp;
    }

    /**
     * List of files in distribution
     */
    async listFiles(): Promise<string[]> {
        return (await this.manifest).files;
    }

    /**
     * List of project language codes
     */
    async listLanguages(): Promise<string[]> {
        return (await this.manifest).languages;
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
        const files = await this.listFiles();
        return Promise.all(
            files.map(async file => {
                const content = await this.getFileTranslations(file, language);
                return { content, file } as LanguageTranslations;
            }),
        );
    }

    /**
     * Returns file translations
     *
     * @param file file from distribution
     * @param languageCode language code
     */
    async getFileTranslations(file: string, languageCode?: string): Promise<string | any> {
        let url = `${OtaClient.BASE_URL}/${this.distributionHash}/content`;
        const language = this.getLanguageCode(languageCode);
        if (includesLanguagePlaceholders(file)) {
            url += replaceLanguagePlaceholders(file, language);
        } else {
            url += `/${language}${file}`;
        }
        return this.httpClient.get(url);
    }

    /**
     * Returns translation strings from json-based files for all languages
     *
     * @param file filter strings by specific file (leave undefined to get from all json files)
     */
    async getStrings(file?: string): Promise<LanguageStrings> {
        const files = await this.getJsonFiles(file);
        const languages = await this.listLanguages();
        const res: LanguageStrings = {};
        await Promise.all(
            languages.map(async language => {
                res[language] = await this.getStringsByFilesAndLocale(files, language);
            }),
        );
        return res;
    }

    /**
     * Returns translation strings from json-based files for specific language
     *
     * @param file filter strings by specific file (leave undefined to get from all json files)
     * @param languageCode language code
     */
    async getStringsByLocale(file?: string, languageCode?: string): Promise<any> {
        const language = this.getLanguageCode(languageCode);
        const files = await this.getJsonFiles(file);
        return this.getStringsByFilesAndLocale(files, language);
    }

    /**
     * Returns translation string for language for specific key
     *
     * @param key path to the translation string in json file
     * @param file filter strings by specific file (leave undefined to get from all json files)
     * @param languageCode language code
     */
    async getStringByKey(key: string[] | string, file?: string, languageCode?: string): Promise<string | any> {
        const strings = await this.getStringsByLocale(file, languageCode);
        const path = Array.isArray(key) ? key : [key];
        const firstKey = path.shift();
        if (!firstKey) {
            return undefined;
        }
        let res = strings[firstKey];
        for (const keyPart of path) {
            res = res && res[keyPart];
        }
        return res;
    }

    /**
     * Clear cache of translation strings
     */
    cleatStringsCache(): void {
        this.stringsCache = {};
    }

    private async getStringsByFilesAndLocale(files: string[], language: string): Promise<any> {
        let strings = {};
        for (const filePath of files) {
            let content;
            if (this.stringsCache[filePath]) {
                content = await this.stringsCache[filePath];
            } else {
                if (!this.disableStringsCache) {
                    this.stringsCache[filePath] = this.getFileTranslations(filePath, language);
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

    private async getJsonFiles(file?: string): Promise<string[]> {
        return (await this.listFiles()).filter(f => !file || file === f).filter(isJsonFile);
    }
}
