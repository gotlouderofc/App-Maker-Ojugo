import fs from 'fs';
import path from 'path';
import https from 'https';

const templatesDir = path.join(process.cwd(), 'public', 'templates');

if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Actual indexed tag and release file names
const apkUrls = [
  'https://github.com/mgks/Android-WebView-App/releases/download/v3.1.2/app-release.apk',
  'https://github.com/mgks/Android-WebView-App/releases/download/v3.0.1/app-release.apk',
  'https://github.com/mgks/Android-WebView-App/releases/download/v3.0/app-release.apk'
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Status ${response.statusCode}`));
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

async function tryDownload(urls, filename) {
  const dest = path.join(templatesDir, filename);
  console.log(`Checking tags for ${filename}...`);
  for (const url of urls) {
    console.log(`Trying URL: ${url}`);
    try {
      await downloadFile(url, dest);
      const sizeBytes = fs.statSync(dest).size;
      if (sizeBytes > 20000) {
        console.log(`✓ Successfully downloaded ${filename} (${Math.round(sizeBytes / 1024)} KB)`);
        return true;
      } else {
        console.log(`Downloaded file is too small (${sizeBytes} bytes). Cleaning up...`);
        fs.unlinkSync(dest);
      }
    } catch (err) {
      console.log(`✗ Fail: ${err.message}`);
    }
  }
  return false;
}

async function main() {
  const success = await tryDownload(apkUrls, 'android-webview-template.apk');
  const destApk = path.join(templatesDir, 'android-webview-template.apk');
  const destAab = path.join(templatesDir, 'android-webview-template.aab');
  
  if (success) {
    console.log('✓ Successfully configured real APK template.');
    console.log('Duplicating template into AAB layout target...');
    fs.copyFileSync(destApk, destAab);
  } else {
    console.log('✗ All downloads failed. Creating standard fallback binary stubs...');
    const stub = Buffer.from('PK\x03\x04\x14\x00\x08\x00\x08\x00\x00\x00\x00\x00classes.dexAndroidManifest.xml', 'binary');
    fs.writeFileSync(destApk, stub);
    fs.writeFileSync(destAab, stub);
  }
  console.log('Download script execution completed.');
}

main();
