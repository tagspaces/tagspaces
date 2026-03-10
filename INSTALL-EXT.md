# Install third party extensions in the web version
The documentation uses the tagspacesarithmetic-player as an example

Download [zip](https://github.com/sytolk/mental-arithmetic/releases) and extract extension in folder `web/modules/third-party/extensions`   

If extracted extension folder is `@tagspacesarithmetic-player_1.0.0` extension path will be: `web/modules/third-party/extensions/@tagspacesarithmetic-player_1.0.0`

Add this configuration to `web/extconfig.js`
 
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
note: to update extensions list you have to delete web browser application data 
