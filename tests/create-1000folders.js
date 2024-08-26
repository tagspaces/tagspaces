const fs = require('fs-extra');
const path = require('path');

const testdir =
  './testdata-tmp/file-structure/supported-filestypes/empty_folder';

try {
  fs.emptyDirSync(testdir);
} catch (err) {
  console.error(err);
}

for (let i = 1; i <= 200; i++) {
  const fileName = `file${i}.txt`;
  const dirName = `dir${i}`;
  const dirPath = path.resolve(testdir, dirName);
  const tsDirPath = path.resolve(testdir, dirName, '.ts');
  try {
    fs.mkdirSync(dirPath);
    fs.mkdirSync(tsDirPath);
    const fileContent = `This is file number ${i}`;
    const filePath = path.resolve(testdir, dirName, fileName);
    fs.writeFileSync(filePath, fileContent);
    const dest = path.resolve(testdir, dirName, `link${i}`);
    fs.symlinkSync(dirPath, dest, 'junction');
    const fileToCopy = 'sample.bmp';

    const srcFile = path.resolve(testdir, '..', fileToCopy);
    fs.copyFileSync(srcFile, path.join(dirPath, 'sample.bmp'));
    fs.copyFileSync(srcFile, path.join(tsDirPath, 'sample.bmp.jpg'));
    const meta =
      '{"appName":"TagSpaces","appVersion":"5.7.6","description":"","lastUpdated":1708418098702,"tags":[{"title":"medium","color":"#ffad46","textcolor":"#ffffff","type":"sidecar"}],"id":"14b0704b80b64b629c0c2f9a2b19fc7a"}';
    fs.writeFileSync(path.join(tsDirPath, 'sample.bmp.json'), meta);
  } catch (err) {
    console.error(err);
  }
}
