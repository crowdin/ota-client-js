import { CustomLanguageRaw, LanguageMapping } from '../..';

export interface Language {
    id: string;
    name: string;
    editorCode: string;
    twoLettersCode: string;
    threeLettersCode: string;
    locale: string;
    localeWithUnderscore?: string;
    androidCode: string;
    osxCode: string;
    osxLocale: string;
    pluralCategoryNames: string[];
    pluralRules: string;
    pluralExamples: string[];
    textDirection: 'ltr' | 'rtl';
    dialectOf: string | null;
}

export interface CustomLanguage {
    name: string;
    twoLettersCode: string;
    threeLettersCode: string;
    locale: string;
    localeWithUnderscore?: string;
    androidCode: string;
    osxCode: string;
    osxLocale: string;
}

type Mapper<I, O> = (input: I) => O;

export type LanguagePlaceholders =
    | '%language%'
    | '%language%'
    | '%two_letters_code%'
    | '%three_letters_code%'
    | '%locale%'
    | '%locale_with_underscore%'
    | '%android_code%'
    | '%osx_code%'
    | '%osx_locale%';

export const languagePlaceholders: Record<LanguagePlaceholders, Mapper<CustomLanguage, string>> = {
    '%language%': lang => lang.name,
    '%two_letters_code%': lang => lang.twoLettersCode,
    '%three_letters_code%': lang => lang.threeLettersCode,
    '%locale%': lang => lang.locale,
    '%locale_with_underscore%': lang => lang.localeWithUnderscore ?? lang.locale.replace(/-/g, '_'),
    '%android_code%': lang => lang.androidCode,
    '%osx_code%': lang => lang.osxCode,
    '%osx_locale%': lang => lang.osxLocale,
};

export function includesLanguagePlaceholders(str: string): boolean {
    return Object.keys(languagePlaceholders).some(placeholder => str.includes(placeholder));
}

export function findLanguageObject(
    languageCode: string,
    languages: Language[],
    customLanguage?: CustomLanguageRaw,
): CustomLanguage {
    let language: CustomLanguage | undefined;
    if (customLanguage) {
        language = {
            name: customLanguage.name,
            twoLettersCode: customLanguage.two_letters_code,
            threeLettersCode: customLanguage.three_letters_code,
            locale: customLanguage.locale,
            localeWithUnderscore: customLanguage.locale_with_underscore,
            androidCode: customLanguage.android_code,
            osxCode: customLanguage.osx_code,
            osxLocale: customLanguage.osx_code,
        };
    } else {
        language = languages.find(l => l.osxLocale === languageCode || l.locale === languageCode);
    }
    if (!language) {
        throw new Error(`Unsupported language code: ${languageCode}`);
    }
    return language;
}

export function replaceLanguagePlaceholders(
    str: string,
    languageCode: string,
    languages: Language[],
    languageMapping?: LanguageMapping,
    customLanguage?: CustomLanguageRaw,
): string {
    const language = findLanguageObject(languageCode, languages, customLanguage);
    let result = str;
    for (const placeholder of Object.keys(languagePlaceholders)) {
        if (result.includes(placeholder)) {
            const cleanPlaceholder = placeholder.slice(1, -1);
            const replaceValue =
                languageMapping && languageMapping[cleanPlaceholder]
                    ? languageMapping[cleanPlaceholder]
                    : languagePlaceholders[placeholder as LanguagePlaceholders](language);
            result = result.replace(placeholder, replaceValue);
        }
    }
    return result;
}
