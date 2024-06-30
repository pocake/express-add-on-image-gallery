const fs = require('fs').promises;
const path = require('path');

async function generateImageArrays(baseDir) {
  const result = {};

  async function readDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await readDirectory(fullPath);
      } else if (entry.isFile() && path.extname(entry.name) === '.png') {
        const assetType = path.basename(path.dirname(fullPath));
        const title = path.basename(entry.name, '.png');
        const imageUrl = `./images/${assetType}/${entry.name}`;
        if (!result[assetType]) {
          result[assetType] = [];
        }
        result[assetType].push({ imageUrl, title, assetType });
      }
    }
  }

  await readDirectory(baseDir);
  return result;
}

const baseDir = path.resolve(__dirname, '../images/');
const assetDir = path.resolve(__dirname, './imageData/');

generateImageArrays(baseDir)
  .then(imagesByType => {
    const writePromises = Object.keys(imagesByType).map(assetType => {
      const outputContent = `export const ${assetType} = ${JSON.stringify(imagesByType[assetType], null, 2).replace(/"/g, '\'')}};\nexport default ${assetType};`;
      const outputPath = path.join(assetDir, `${assetType}.js`);
      return fs.writeFile(outputPath, outputContent, 'utf8');
    });
    return Promise.all(writePromises);
  })
  .then(() => {
    console.log('All image data files have been saved.');
  })
  .catch(error => {
    console.error('Error:', error);
  });
