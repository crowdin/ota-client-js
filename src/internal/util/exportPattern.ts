interface Language {
    name: string;
    twoLettersCode: string;
    threeLettersCode: string;
    locale: string;
    androidCode: string;
    osxCode: string;
    osxLocale: string;
}

type Mapper<I, O> = (input: I) => O;

const languagePlaceholders: { [placeholder: string]: Mapper<Language, string> } = {
    '%language%': lang => lang.name,
    '%two_letters_code%': lang => lang.twoLettersCode,
    '%three_letters_code%': lang => lang.threeLettersCode,
    '%locale%': lang => lang.locale,
    '%locale_with_underscore%': lang => lang.locale.replace(/-/g, '_'),
    '%android_code%': lang => lang.androidCode,
    '%osx_code%': lang => lang.osxCode,
    '%osx_locale%': lang => lang.osxLocale,
};

//TODO fill this array
const languages: Language[] = [];

export function includesLanguagePlaceholders(str: string): boolean {
    return Object.keys(languagePlaceholders).some(placeholder => str.includes(placeholder));
}

export function replaceLanguagePlaceholders(str: string, languageCode: string): string {
    const language = languages.find(l => l.twoLettersCode === languageCode);
    if (!language) {
        throw new Error(`Unsupported language code : ${languageCode}`);
    }
    let result = str;
    for (const placeholder of Object.keys(languagePlaceholders)) {
        if (result.includes(placeholder)) {
            const replaceValue = languagePlaceholders[placeholder](language);
            result = result.replace(placeholder, replaceValue);
        }
    }
    return result;
}
