const https = require('https');
const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, 'assets', 'fonts');

if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fonts = [
  {
    url: 'https://raw.githubusercontent.com/googlefonts/Montserrat/main/fonts/ttf/Montserrat-Regular.ttf',
    filename: 'Montserrat-Regular.ttf'
  },
  {
    url: 'https://raw.githubusercontent.com/googlefonts/Montserrat/main/fonts/ttf/Montserrat-Bold.ttf',
    filename: 'Montserrat-Bold.ttf'
  },
  {
    url: 'https://raw.githubusercontent.com/nicholastk/lovelo-font/main/Lovelo-Black.ttf',
    filename: 'Lovelo-Black.ttf'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        file.close();
        fs.unlink(dest, () => {});
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const font of fonts) {
    const dest = path.join(fontsDir, font.filename);
    try {
      console.log(`Downloading ${font.filename}...`);
      await downloadFile(font.url, dest);
      console.log(`✓ ${font.filename}`);
    } catch (err) {
      console.log(`✗ Failed: ${font.filename} - ${err.message}`);
    }
  }
  console.log('Done!');
}

main();
