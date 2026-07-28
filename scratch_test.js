const puppeteer = require('puppeteer');
const path = require('path');
const { pathToFileURL } = require('url');

async function test() {
  const APP_INDEX_PATH = path.resolve(__dirname, 'frontend', 'public', 'worksheets', 'levels_main.html');
  const APP_URL = pathToFileURL(APP_INDEX_PATH).href;
  console.log('Testing URL:', APP_URL);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
    page.on('console', (msg) => console.log('CONSOLE:', msg.text()));

    console.log('Navigating...');
    await page.goto(APP_URL, { waitUntil: 'load', timeout: 10000 });
    console.log('Navigation successful!');
  } catch (err) {
    console.error('ERROR during navigation:', err.message);
  } finally {
    await browser.close();
  }
}

test();
