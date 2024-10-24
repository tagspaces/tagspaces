/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
import { InitOptions } from 'i18next';
import enUs from '../locales/en_US/core.json';
import en from '../locales/en/core.json';

let defaultLanguage: any = enUs;
if (
  typeof process !== 'undefined' &&
  process.env &&
  process.env.NODE_ENV &&
  process.env.NODE_ENV === 'development'
) {
  defaultLanguage = en;
}

async function loadLocales(options, url: string, payload, callback) {
  try {
    // const [lng] = url.split('/');
    const locale = await import('../locales/' + url + '/core.json');
    callback(null, { status: 200, data: locale });
  } catch (e) {
    console.log(`Unable to load locale at ${url}\n`, e);
    callback(null, { status: 200, data: defaultLanguage });
  }

  /*switch (url) {
    case 'ar': {
      import('../locales/ar/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'bg': {
      import('../locales/bg/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'ca': {
      import('../locales/ca/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'cs': {
      import('../locales/cs/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'da_DK': {
      import('../locales/da_DK/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'de_DE': {
      import('../locales/de_DE/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'el': {
      import('../locales/el/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'eo': {
      import('../locales/eo/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'es': {
      import('../locales/es/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'fa': {
      import('../locales/fa/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'fr': {
      import('../locales/fr/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'hu': {
      import('../locales/hu/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'hy': {
      import('../locales/hy/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'id_ID': {
      import('../locales/id_ID/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'it': {
      import('../locales/it/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'ja': {
      import('../locales/ja/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'ko': {
      import('../locales/ko/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'mt': {
      import('../locales/mt/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'nl_NL': {
      import('../locales/nl_NL/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'pl': {
      import('../locales/pl/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'pt_BR': {
      import('../locales/pt_BR/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'pt_PT': {
      import('../locales/pt_PT/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'ru': {
      import('../locales/ru/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'sk_SK': {
      import('../locales/sk_SK/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'sv': {
      import('../locales/sv/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'tr': {
      import('../locales/tr/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'uk': {
      import('../locales/uk/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'vi': {
      import('../locales/vi/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'zh_CN': {
      import('../locales/zh_CN/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'zh_TW': {
      import('../locales/zh_TW/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'zh_HK': {
      import('../locales/zh_HK/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'nb': {
      import('../locales/nb/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'fr_CA': {
      import('../locales/fr_CA/core.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    default: {
      callback(undefined, { status: '200', data: defaultLanguage });
      break;
    }
  }*/
}

//function i18nInit() {
/*if (i18n.isInitialized) {
    return i18n;
  }*/
// @ts-ignore
const options: InitOptions = {
  debug: false,
  returnNull: false,
  fallbackLng: 'en',
  // load: 'all', // ['en', 'de'], // we only provide en, de -> no region specific locals like en-US, de-DE
  ns: ['core'],
  defaultNS: 'core',
  // attributes: ['t', 'i18n'],
  keySeparator: false,
  backend: {
    loadPath: '{{lng}}',
    // parse: data => data, // comment to have working i18n switch
    request: loadLocales, // comment to have working i18n switch
  }, // as HttpBackendOptions
  // getAsync: true,
  // debug: true,
  /* interpolation: {
    escapeValue: false, // not needed for react!!
    formatSeparator: ',',
    format: (value, format) => {
      if (format === 'uppercase') return value.toUpperCase();
      return value;
    }
  } */
};

export default options;
