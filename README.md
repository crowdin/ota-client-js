[<p align='center'><img src='https://support.crowdin.com/assets/logos/crowdin-dark-symbol.png' data-canonical-src='https://support.crowdin.com/assets/logos/crowdin-dark-symbol.png' width='200' height='200' align='center'/></p>](https://crowdin.com)

# Crowdin OTA JavaScript client

Lightweight library for Crowdin Over-The-Air Content Delivery.

Information about Crowdin OTA can be found in [blog post](https://blog.crowdin.com/2019/12/12/over-the-air-content-delivery-for-android-and-ios-apps-available-in-open-beta/).

//TODO badges

## Build Status

//TODO CI/CD

## Table of Contents
* [Installation](#installation)
* [Quick Start](#quick-start)
* [Contribution](#contribution)
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
client.getFileTranslations(languageCode, file)
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
client.getFileTranslations(languageCode, file)
  .then(translations => console.log(translations))
  .catch(error => console.error(error));
```

</details>

You can generate distribution hash for project by using Distributions API through [REST API](https://support.crowdin.com/api/v2/) or [JavaScript client](https://github.com/crowdin/crowdin-api-client-js). You first need to create distribution (at this point you will get the hash) and then release it.

### Client configuration

You also can customize client for your needs.
In constructor as a second (optional) argument you can pass configuration object.

```typescript
import otaClient, { ClientConfig } from'@crowdin/ota-client';

const config: ClientConfig = {
  // provide custom http client, default will axios
  httpClient: customHttpClient
  // disable caching of manifest file which will lead to additional request for each client method
  disableManifestCache: true
};

// distribution hash
const hash = '{distribution_hash}';

// initialization of crowdin ota client with specific configuration
const client = new otaClient(hash);
```

## Contribution
We are happy to accept contributions to the Crowdin OTA JavaScript client. To contribute please do the following:
1. Fork the repository on GitHub.
2. Decide which code you want to submit. Commit your changes and push to the new branch.
3. Ensure that your code adheres to standard conventions, as used in the rest of the library.
4. Ensure that there are unit tests for your code.
5. Submit a pull request with your patch on Github.

## Seeking Assistance
If you find any problems or would like to suggest a feature, please feel free to file an issue on Github at [Issues Page](https://github.com/crowdin/ota-client-js/issues).

If you've found an error in these samples, please [contact](https://crowdin.com/contacts) our Support Team.

## License
<pre>
Copyright © 2020 Crowdin

The Crowdin OTA JavaScript client is licensed under the MIT License. 
See the LICENSE.md file distributed with this work for additional 
information regarding copyright ownership.

Except as contained in the LICENSE file, the name(s) of the above copyright
holders shall not be used in advertising or otherwise to promote the sale,
use or other dealings in this Software without prior written authorization.
</pre>
