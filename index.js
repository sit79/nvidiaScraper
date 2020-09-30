const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
const cron = require("node-cron");

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
      let time = new Date();
      console.log(`running, ${time.getHours()} : ${time.getMinutes()}`);
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

cron.schedule("5 * * * *", function () {
  // crontab running every five minutes
  // for syntax refer to: https://www.npmjs.com/package/node-cron
  scrape(url);
});
