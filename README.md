[<p align='center'><img src='https://support.crowdin.com/assets/logos/crowdin-dark-symbol.png' data-canonical-src='https://support.crowdin.com/assets/logos/crowdin-dark-symbol.png' width='200' height='200' align='center'/></p>](https://crowdin.com)

# Crowdin OTA JavaScript client

Lightweight library for Crowdin Over-The-Air Content Delivery. The best way to deliver translations to your site Over-The-Air :dizzy:

Information about Crowdin OTA can be found in the [Knowledge Base article](https://support.crowdin.com/content-delivery/). Also, visit the [Wiki](https://github.com/crowdin/ota-client-js/wiki) to read more about the advanced usage of OTA Client.

## Status

[![npm](https://img.shields.io/npm/v/@crowdin/ota-client?logo=npm&cacheSeconds=1800)](https://www.npmjs.com/package/@crowdin/ota-client)
[![npm](https://img.shields.io/npm/dt/@crowdin/ota-client?cacheSeconds=1800)](https://www.npmjs.com/package/@crowdin/ota-client)
[![codecov](https://codecov.io/gh/crowdin/ota-client-js/branch/main/graph/badge.svg)](https://codecov.io/gh/crowdin/ota-client-js)
[![GitHub issues](https://img.shields.io/github/issues/crowdin/ota-client-js?cacheSeconds=3600)](https://github.com/crowdin/ota-client-js/issues)
[![License](https://img.shields.io/github/license/crowdin/ota-client-js?cacheSeconds=3600)](https://github.com/crowdin/ota-client-js/blob/main/LICENSE)

## Build Status

| Azure CI (Linux) | Azure CI (Windows) | Azure CI (MacOS) |
|--------------------|------------------|------------------|
|[![Build Status](https://dev.azure.com/crowdin/ota-client-js/_apis/build/status/Ubuntu?branchName=main)](https://dev.azure.com/crowdin/ota-client-js/_build/latest?definitionId=29&branchName=main)|[![Build Status](https://dev.azure.com/crowdin/ota-client-js/_apis/build/status/Windows?branchName=main)](https://dev.azure.com/crowdin/ota-client-js/_build/latest?definitionId=31&branchName=main)|[![Build Status](https://dev.azure.com/crowdin/ota-client-js/_apis/build/status/MacOS?branchName=main)](https://dev.azure.com/crowdin/ota-client-js/_build/latest?definitionId=30&branchName=main)
|[![Azure DevOps tests (branch)](https://img.shields.io/azure-devops/tests/crowdin/ota-client-js/29/main?cacheSeconds=1800)](https://dev.azure.com/crowdin/ota-client-js/_build/latest?definitionId=29&branchName=main)|[![Azure DevOps tests (branch)](https://img.shields.io/azure-devops/tests/crowdin/ota-client-js/31/main?cacheSeconds=1800)](https://dev.azure.com/crowdin/ota-client-js/_build/latest?definitionId=31&branchName=main)|[![Azure DevOps tests (branch)](https://img.shields.io/azure-devops/tests/crowdin/ota-client-js/30/main?cacheSeconds=1800)](https://dev.azure.com/crowdin/ota-client-js/_build/latest?definitionId=30&branchName=main)

## Table of Contents
* [Installation](#installation)
* [Quick Start](#quick-start)
* [Contributing](#contributing)
* [Seeking Assistance](#seeking-assistance)
* [License](#license)

## Installation

### npm
  `npm i @crowdin/ota-client`

### yarn
  `yarn add @crowdin/ota-client`

## Quick Start

<details>
<summary>Typescript</summary>

```typescript
import otaClient from '@crowdin/ota-client';

// distribution hash
const hash = '{distribution_hash}';

// initialization of crowdin ota client
const client = new otaClient(hash);

// get list of files in distribution
client.listFiles()
  .then(file => console.log(file))
  .catch(error => console.error(error));

// one of target languages in Crowdin project (could be retrieved via client.listLanguages)
const languageCode = 'uk';
// one of files from client.listFiles
const file = 'file';
// get file translations
client.getFileTranslations(file, languageCode)
  .then(translations => console.log(translations))
  .catch(error => console.error(error));
```

</details>

<details>
<summary>Javascript ES6 modules</summary>

```javascript
import otaClient from '@crowdin/ota-client';
// or const otaClient = require('./out/index.js').default;

// distribution hash
const hash = '{distribution_hash}';

// initialization of crowdin ota client
const client = new otaClient(hash);

// get list of files in distribution
client.listFiles()
  .then(file => console.log(file))
  .catch(error => console.error(error));

// one of target languages in Crowdin project (could be retrieved via client.listLanguages)
const languageCode = 'uk';
// one of files from client.listFiles
const file = 'file';
// get file translations
client.getFileTranslations(file, languageCode)
  .then(translations => console.log(translations))
  .catch(error => console.error(error));
```

</details>

<details>
<summary>Javascript CommonJS</summary>

```javascript
const otaClient = require('@crowdin/ota-client').default;

// distribution hash
const hash = '{distribution_hash}';

// initialization of crowdin ota client
const client = new otaClient(hash);

// get list of files in distribution
client.listFiles()
  .then(file => console.log(file))
  .catch(error => console.error(error));

// one of target languages in Crowdin project (could be retrieved via client.listLanguages)
const languageCode = 'uk';
// one of files from client.listFiles
const file = 'file';
// get file translations
client.getFileTranslations(file, languageCode)
  .then(translations => console.log(translations))
  .catch(error => console.error(error));
```

</details>

You can create a new distribution in your Crowdin project settings (*Content Delivery* tab) or using Distributions API through [REST API](https://support.crowdin.com/api/v2/). After that you will receive a *Distribution hash*.

### Client methods

Client contains methods to retrieve translation strings from files as a plain text and from JSON files as an objects.
Also there are several helper methods.

| Method name                  | Description | Input arguments |
|------------------------------|-------------|-----------------|
| Methods for plain text       |
| `getTranslations`            | Returns translations for all languages | |
| `getLanguageTranslations`    | Returns translations for specific language | `languageCode` (optional, otherwise use `setCurrentLocale`) |
| `getFileTranslations`        | Returns translations for specific language and file | `file` (e.g. one from `listFiles`), `languageCode` (optional, otherwise use `setCurrentLocale`) |
| Methods for JSON-based files |
| `getStrings`                 | Returns translations for all languages | `file` (optional, e.g. json file from `listFiles`) |
| `getStringsByLocale`         | Returns translations for specific language | `file` (optional, e.g. json file from `listFiles`), `languageCode` (optional, otherwise use `setCurrentLocale`) |
| `getStringByKey`             | Returns translation for language for specific key | `key`, `file` (optional, e.g. json file from `listFiles`), `languageCode` (optional, otherwise use `setCurrentLocale`) |
| Helper methods |
| `getHash`                    | Returns distribution hash | |
| `setCurrentLocale`           | Define global language for client instance | `languageCode` |
| `getCurrentLocale`           | Get global language for client instance | |
| `getManifestTimestamp`       | Get manifest timestamp of distribution | |
| `listFiles`                  | List of files in distribution | |
| `listLanguages`              | List of project language codes | |
| `clearStringsCache`          | Clear cache of translation strings | |
| `getLanguageMappings`        | Get project language mapping | |
| `getCustomLanguages`         | Get project custom languages | |

Example of loading strings from JSON files

```typescript
import otaClient from'@crowdin/ota-client';

const hash = '{distribution_hash}';

const client = new otaClient(hash);

// will return all translation strings for all languages from all json files 
client.getStrings()
  .then(res => {
    //get needed translation by language + key
    console.log(res.uk.application.title);
  })
  .catch(error => console.error(error));

// or get concrete translation by key
client.getStringByKey(['application', 'title'], '/folder/file.json', 'uk')
  .then(title => console.log(title))
  .catch(error => console.error(error));

// or define global language and do not pass it everywhere
client.setCurrentLocale('uk');
client.getStringByKey(['application', 'title'], '/folder/file.json')
  .then(title => console.log(title))
  .catch(error => console.error(error));

```

### Client configuration

You also can customize client for your needs.
In constructor as a second (optional) argument you can pass configuration object.

| Config option              | Description               | Example |
|----------------------------|---------------------------|---------|
| `hash`                     | Distribution Hash         |`7a0c1ee2622bc85a4030297uo3b` |
| `httpClient`               | Custom HTTP client |[Axios (default)](https://github.com/crowdin/ota-client-js/blob/main/src/internal/http/axiosClient.ts) |
| `disableManifestCache`     | Disable caching of manifest file which will lead to additional request for each client method  |`true` |
| `languageCode`             | Default language code to be used if language was not passed as an input argument of the method (also possible via `setCurrentLocale` method) |`uk` |
| `disableStringsCache`      | Disable caching of translation strings which is used for JSON-based client methods |`true` |
| `disableJsonDeepMerge`     | Disable deep merge of json-based files for string-based methods and use shallow merge |`true` |

```typescript
import otaClient, { ClientConfig } from'@crowdin/ota-client';

const config: ClientConfig = {
  httpClient: customHttpClient,
  disableManifestCache: true,
  languageCode: 'uk',
  disableStringsCache: true,
  disableJsonDeepMerge: true
};

const hash = '7a0c1ee2622bc85a4030297uo3b';

const client = new otaClient(hash, config);
```

## Contributing
If you want to contribute please read the [Contributing](/CONTRIBUTING.md) guidelines.

## Seeking Assistance
If you find any problems or would like to suggest a feature, please feel free to file an issue on Github at [Issues Page](https://github.com/crowdin/ota-client-js/issues).

If you've found an error in these samples, please [Contact Customer Success Service](https://crowdin.com/contacts).

## License
<pre>
The Crowdin OTA JavaScript client is licensed under the MIT License. 
See the LICENSE.md file distributed with this work for additional 
information regarding copyright ownership.

Except as contained in the LICENSE file, the name(s) of the above copyright
holders shall not be used in advertising or otherwise to promote the sale,
use or other dealings in this Software without prior written authorization.
</pre>
