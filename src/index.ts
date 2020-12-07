import { AxiosHttpClient } from './internal/http/axiosClient';
import { includesLanguagePlaceholders, replaceLanguagePlaceholders } from './internal/util/exportPattern';

export interface ClientConfig {
    /**
     * Specify your own http client. Defult uses axios
     */
    httpClient?: HttpClient;
    /**
     * Disable cache of distribution manifest. Default is false
     */
    disableManifestCache?: boolean;
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
    content: string;
}

export default class OtaClient {
    public static readonly BASE_URL = 'https://distributions.crowdin.net';

    private readonly httpClient: HttpClient;

    private manifestHolder?: Promise<Manifest>;
    private cacheManifest = true;

    /**
     * @param distributionHash hash of released Crowdin project distribution
     * @param config client config
     */
    constructor(private distributionHash: string, config?: ClientConfig) {
        this.httpClient = config?.httpClient || new AxiosHttpClient();
        this.cacheManifest = !!config?.disableManifestCache;
    }

    /**
     * Distribution hash
     */
    getHash(): string {
        return this.distributionHash;
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
    async getLanguageTranslations(languageCode: string): Promise<LanguageTranslations[]> {
        const files = await this.listFiles();
        return Promise.all(
            files.map(async file => {
                const content = await this.getFileTranslations(languageCode, file);
                return { content, file } as LanguageTranslations;
            }),
        );
    }

    /**
     * Returns file translations
     *
     * @param languageCode language code
     * @param file file from distribution
     */
    async getFileTranslations(languageCode: string, file: string): Promise<string> {
        let url = `${OtaClient.BASE_URL}/${this.distributionHash}/content`;
        if (includesLanguagePlaceholders(file)) {
            url += replaceLanguagePlaceholders(file, languageCode);
        } else {
            url += `/${languageCode}${file}`;
        }
        return this.httpClient.get(url);
    }

    private get manifest(): Promise<Manifest> {
        if (this.manifestHolder && !this.cacheManifest) {
            return this.manifestHolder;
        } else {
            this.manifestHolder = this.httpClient.get(`${OtaClient.BASE_URL}/${this.distributionHash}/manifest.json`);
            return this.manifestHolder;
        }
    }
}
