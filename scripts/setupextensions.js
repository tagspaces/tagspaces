const sh = require('shelljs');
// const path = require('path');

if (!sh.which('git')) {
  sh.echo('Sorry, this script requires git');
  sh.exit(1);
}

if (!sh.which('yarn')) {
  sh.echo('Sorry, this script requires yarn');
  sh.exit(1);
}

const extensionDir = 'extensions';
const extensionBranch = 'master';

const extensionList = [
  // {
  //   package: '@tagspaces/spreadsheet-viewer',
  //   path: 'viewerSpreadSheet',
  //   url: 'https://github.com/tagspaces/viewerSpreadSheet'
  // },
  // {
  //   package: '@tagspaces/document-viewer',
  //   path: 'viewerDocument',
  //   url: 'https://github.com/tagspaces/viewerDocument'
  // },
  // {
  //   package: '@tagspaces/pdf-viewer',
  //   path: 'viewerPDF',
  //   url: 'https://github.com/tagspaces/viewerPDF'
  // },
  // {
  //   package: '@tagspaces/image-viewer',
  //   path: 'viewerImage',
  //   url: 'https://github.com/tagspaces/viewerImage'
  // },
  // {
  //   package: '@tagspaces/html-viewer',
  //   path: 'viewerHTML',
  //   url: 'https://github.com/tagspaces/viewerHTML'
  // },
  // {
  //   package: '@tagspaces/md-viewer',
  //   path: 'viewerMD',
  //   url: 'https://github.com/tagspaces/viewerMD'
  // },
  // {
  //   package: '@tagspaces/url-viewer',
  //   path: 'viewerURL',
  //   url: 'https://github.com/tagspaces/viewerURL'
  // },
  // {
  //   package: '@tagspaces/media-player',
  //   path: 'viewerAudioVideo',
  //   url: 'https://github.com/tagspaces/viewerAudioVideo'
  // },
  // {
  //   package: '@tagspaces/mhtml-viewer',
  //   path: 'viewerMHTML',
  //   url: 'https://github.com/tagspaces/viewerMHTML'
  // },
  // {
  //   package: '@tagspaces/rtf-viewer',
  //   path: 'viewerRTF',
  //   url: 'https://github.com/tagspaces/viewerRTF'
  // },
  // {
  //   package: '@tagspaces/text-viewer',
  //   path: 'viewerText',
  //   url: 'https://github.com/tagspaces/viewerText'
  // },
  // {
  //   package: '@tagspaces/archive-viewer',
  //   path: 'viewerZIP',
  //   url: 'https://github.com/tagspaces/viewerZIP'
  // },
  // {
  //   package: '@tagspaces/ebook-viewer',
  //   path: 'viewerEPUB',
  //   url: 'https://github.com/tagspaces/viewerEPUB'
  // },
  // {
  //   package: '@tagspaces/text-editor',
  //   path: 'editorText',
  //   url: 'https://github.com/tagspaces/editorText'
  // },
  // {
  //   package: '@tagspaces/json-editor',
  //   path: 'editorJSON',
  //   url: 'https://github.com/tagspaces/editorJSON'
  // },
  // {
  //   package: '@tagspaces/html-editor',
  //   path: 'editorHTML',
  //   url: 'https://github.com/tagspaces/editorHTML'
  // },
  // {
  //   package: '@tagspaces/legacy-ext',
  //   path: 'extCommons',
  //   url: 'https://github.com/tagspaces/extCommons'
  // },
  {
    package: '@tagspaces/extensions',
    path: 'extensions',
    url: 'https://github.com/tagspaces/tagspaces-extensions',
  },
];

sh.rm('-rf', '~/.config/yarn/link/@tagspaces');

if (!sh.test('-d', extensionDir)) {
  sh.mkdir(extensionDir);
}

sh.cd(extensionDir);

extensionList.forEach((extension) => {
  if (sh.test('-d', extension.path)) {
    sh.cd(extension.path);
    sh.exec('git checkout ' + extensionBranch);
    sh.exec('git pull');
  } else {
    sh.exec('git clone -b ' + extensionBranch + ' ' + extension.url);
    sh.cd(extension.path);
  }
  sh.exec('yarn unlink ' + extension.package);
  sh.exec('yarn link');
  sh.cd('..');
});

sh.cd('../app');
extensionList.forEach((extension) => {
  sh.exec('yarn link ' + extension.package);
});
sh.cd('..');
