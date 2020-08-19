import AppConfig from '../../app/config';

const {
  baseName,
  extractFileExtension,
  getMetaDirectoryPath,
  getMetaFileLocationForFile
} = require('../../app/utils/paths');

const testDirPathUnix = '/home/user';
const dirSeparatorUnix = '/';
const testDirPathWin = 'c:\\Users\\testuser';
const dirSeparatorWin = '\\';
const fileName = 'filename';
const txtFileExtension = 'txt';

const txtFilePathUnix =
  testDirPathUnix + dirSeparatorUnix + fileName + '.' + txtFileExtension;

const txtFilePathWin =
  testDirPathWin + dirSeparatorWin + fileName + '.' + txtFileExtension;

test('extract baseName', () => {
  expect(baseName(txtFilePathUnix, dirSeparatorUnix)).toBe(
    fileName + '.' + txtFileExtension
  );

  expect(baseName(txtFilePathWin, dirSeparatorWin)).toBe(
    fileName + '.' + txtFileExtension
  );
});

test('extractFileExtension', () => {
  expect(extractFileExtension(txtFilePathUnix, dirSeparatorUnix)).toBe(
    txtFileExtension
  );

  expect(extractFileExtension(txtFilePathWin, dirSeparatorWin)).toBe(
    txtFileExtension
  );

  expect(
    extractFileExtension('../remote.php/webdav/somefilename', dirSeparatorUnix)
  ).toBe('');

  expect(
    extractFileExtension(
      '../remote.php/webdav/[20120125 89.4kg 19.5% 2.6kg]',
      dirSeparatorUnix
    )
  ).toBe('');
});

test('getMetaDirectoryPath', () => {
  expect(getMetaDirectoryPath(testDirPathUnix, dirSeparatorUnix)).toBe(
    testDirPathUnix + dirSeparatorUnix + AppConfig.metaFolder
  );

  expect(getMetaDirectoryPath(testDirPathWin, dirSeparatorWin)).toBe(
    testDirPathWin + dirSeparatorWin + AppConfig.metaFolder
  );
});

test('getMetaFileLocationForFile', () => {
  expect(getMetaFileLocationForFile(txtFilePathUnix, dirSeparatorUnix)).toBe(
    testDirPathUnix +
      dirSeparatorUnix +
      AppConfig.metaFolder +
      dirSeparatorUnix +
      fileName +
      '.' +
      txtFileExtension +
      AppConfig.metaFileExt
  );

  expect(getMetaFileLocationForFile(txtFilePathWin, dirSeparatorWin)).toBe(
    testDirPathWin +
      dirSeparatorWin +
      AppConfig.metaFolder +
      dirSeparatorWin +
      fileName +
      '.' +
      txtFileExtension +
      AppConfig.metaFileExt
  );

  expect(
    getMetaFileLocationForFile('c:\\users\\tester\\file.jpg', dirSeparatorWin)
  ).toBe('c:\\users\\tester\\.ts\\file.jpg.json');

  expect(
    getMetaFileLocationForFile('/users/tester/file.jpg', dirSeparatorUnix)
  ).toBe('/users/tester/.ts/file.jpg.json');
});
