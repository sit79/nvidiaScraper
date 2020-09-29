const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const scrape = (url) => {
  console.clear();
  console.info(`scrape_demo: scraping ${url}`);
  return new Promise(async (resolve, reject) => {
    let browser = null;
    let dataObj = {};
    try {
      browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
      });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
      await page.waitForSelector(".cta-button");
      dataObj["showTitle"] = await page.title();
      dataObj["available"] = await page.evaluate(() => {
        let button = document.querySelector(".cta-button").innerText;
        return button;
      });
      console.table(dataObj["showTitle"]);
      console.table(dataObj["available"]);
      return resolve(dataObj);
    } catch (e) {
      return reject(e);
    } finally {
      browser.close();
    }
  });
};

const url =
  "https://www.nvidia.com/de-de/geforce/graphics-cards/30-series/rtx-3080/?nvid=nv-int-gfhm-33950";

scrape(url);
