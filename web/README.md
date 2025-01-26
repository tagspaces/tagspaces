### Install third party extensions in web

download [zip](https://github.com/sytolk/mental-arithmetic/releases) and extract extension in folder `web/modules/third-party/extensions`   

if extracted extension folder is `@tagspacesarithmetic-player_1.0.0` 

extension path will be: `web/modules/third-party/extensions/@tagspacesarithmetic-player_1.0.0`

add this configuration to `web/extconfig.js`
 
```javascript
window.ExtExtensionsFound = [
  {
    extensionId: '@tagspaces/arithmetic-player',
    extensionName: 'Mental Arithmetic',
    extensionTypes: ['viewer'],
    extensionEnabled: true,
    version: '1.0.0',
  },
];
window.ExtSupportedFileTypes = [
  {
    type: 'math',
    color: '#5cb85c',
    viewer: 'third-party/extensions/@tagspacesarithmetic-player_1.0.0/build',
  },
];
```
note: to update extensions list it's need to delete web browser application data 
