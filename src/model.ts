/**
 * This module contains the types used in the Crowdin OTA Client.
 *
 * @module Types
 */

export interface ClientConfig {
    /**
     * Specify your own http client. Default uses fetch
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
     * Disable Crowdin languages cache. Default is false
     */
    disableLanguagesCache?: boolean;
    /**
     * Disable deep merge and use shallow merge to merge translation strings from json file
     */
    disableJsonDeepMerge?: boolean;
    /**
     * The name of your Crowdin Enterprise organization
     * If provided, this will fetch languages from the Enterprise API instead of the Crowdin API v2. The name must be a valid Enterprise organization name.
     */
    enterpriseOrganizationDomain?: string;
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
    // these next two arrays will always be empty if they are arrays, the never type just avoids an eslint error
    language_mapping: LanguageMappings | never[];
    custom_languages: CustomLanguages | never[];
    content: {
        [languageCode: string]: string[];
    };
    mapping: string[];
}

export interface LanguageMappings {
    [languageCode: string]: LanguageMapping;
}

export interface CustomLanguages {
    [languageCode: string]: CustomLanguageRaw;
}

export interface LanguageMapping {
    [placeholder: string]: string;
}

export interface Translations {
    [languageCode: string]: LanguageTranslations[];
}

export interface LanguageTranslations {
    file: string;
    content: string | any | null;
}

export interface LanguageFiles {
    [languageCode: string]: string[];
}

export interface LanguageStrings {
    [languageCode: string]: any;
}

export interface CustomLanguageRaw {
    name: string;
    two_letters_code: string;
    three_letters_code: string;
    locale: string;
    locale_with_underscore: string;
    android_code: string;
    osx_code: string;
    osx_locale: string;
}
