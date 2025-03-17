const AdmZip = require('adm-zip');
const path = require('path');

// Use the first command-line argument as the output path, or fallback to a default
const outputZipPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '../builds/tagspaces-web.zip');

const sourceFolder = path.join(__dirname, '../web'); // Folder to zip

try {
  const zip = new AdmZip();
  zip.addLocalFolder(sourceFolder, 'web'); // Add the entire folder
  zip.writeZip(outputZipPath); // Write the zip archive
  console.log(`Successfully created zip: ${outputZipPath}`);
} catch (error) {
  console.error('Error creating zip file:', error);
  process.exit(1);
}
