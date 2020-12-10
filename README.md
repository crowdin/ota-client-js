[<p align='center'><img src='https://support.crowdin.com/assets/logos/crowdin-dark-symbol.png' data-canonical-src='https://support.crowdin.com/assets/logos/crowdin-dark-symbol.png' width='200' height='200' align='center'/></p>](https://crowdin.com)

# Crowdin OTA JavaScript client

Lightweight library for Crowdin Over-The-Air Content Delivery.

Information about Crowdin OTA can be found in [blog post](https://blog.crowdin.com/2019/12/12/over-the-air-content-delivery-for-android-and-ios-apps-available-in-open-beta/).

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
  .then(files => console.log(file))
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
<summary>Javascript</summary>

```javascript
import otaClient from '@crowdin/ota-client';
// or const otaClient = require('./out/index.js').default;

// distribution hash
const hash = '{distribution_hash}';

// initialization of crowdin ota client
const client = new otaClient(hash);

// get list of files in distribution
client.listFiles()
  .then(files => console.log(file))
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

### Client configuration

You also can customize client for your needs.
In constructor as a second (optional) argument you can pass configuration object.

```typescript
import otaClient, { ClientConfig } from'@crowdin/ota-client';

const config: ClientConfig = {
  // provide custom http client, default will axios
  httpClient: customHttpClient,
  // disable caching of manifest file which will lead to additional request for each client method
  disableManifestCache: true,
  // default language code to be used if language was not passed as an input argument of the method
  // this can be also configured later on by using "setCurrentLocale" method
  languageCode: 'uk'
};

// distribution hash
const hash = '{distribution_hash}';

// initialization of crowdin ota client with specific configuration
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
