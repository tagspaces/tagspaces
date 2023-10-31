const fs = require('fs');
const path = require('path');

const testdir = './testdata-tmp/file-structure/supported-filestypes';

for (let i = 1; i <= 2000; i++) {
  const fileName = `file${i}.txt`;
  const fileContent = `This is file number ${i}`;
  const filePath = path.join(testdir, fileName);
  fs.writeFile(filePath, fileContent, (err) => {
    if (err) throw err;
    console.log(`File ${fileName} has been created.`);
  });
}
