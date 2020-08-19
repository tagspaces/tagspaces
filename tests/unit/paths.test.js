import AppConfig from '../../app/config';

const {
  baseName,
  extractFileExtension,
  getMetaDirectoryPath,
  getMetaFileLocationForFile
} = require('../../app/utils/paths');

const testDirPath = '/home/user';
const dirSeparator = '/';
const fileName = 'filename';
const txtFileExtension = 'txt';

const txtFilePath =
  testDirPath + dirSeparator + fileName + '.' + txtFileExtension;

test('extract baseName', () => {
  expect(baseName(txtFilePath, dirSeparator)).toBe(
    fileName + '.' + txtFileExtension
  );
});

test('extractFileExtension', () => {
  expect(extractFileExtension(txtFilePath, dirSeparator)).toBe(
    txtFileExtension
  );
});

test('getMetaDirectoryPath', () => {
  expect(getMetaDirectoryPath(testDirPath, dirSeparator)).toBe(
    testDirPath + dirSeparator + AppConfig.metaFolder
  );
});

test('getMetaFileLocationForFile', () => {
  expect(getMetaFileLocationForFile(txtFilePath, dirSeparator)).toBe(
    testDirPath +
      dirSeparator +
      AppConfig.metaFolder +
      dirSeparator +
      fileName +
      '.' +
      txtFileExtension +
      AppConfig.metaFileExt
  );
});
