require("dotenv").config();
const CronJob = require("cron").CronJob;
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
const Discord = require("discord.js");
const webhookClient = new Discord.WebhookClient(
  process.env.DISCORD_ID,
  process.env.DISCORD_TOKEN
);

const scrape = (url) => {
  console.log("checking www.nvidia.com");
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
      console.log(`running, ${time.getHours()}:${time.getMinutes()}`);
      console.table(dataObj["showTitle"]);
      console.table(dataObj["available"]);

      let message = dataObj["available"].toLowerCase();

      const embed = await new Discord.MessageEmbed()
        .setTitle("NVIDIA GeForce RTX 3080")
        .setDescription(message)
        .setColor("#0099ff");

      await webhookClient.send("Just checked.", {
        username: "site9",
        avatarURL: "https://duckduckgo.com/i/46055555.png",
        embeds: [embed],
      });
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

const job = new CronJob({
  cronTime: "0 */5 * * * *",
  onTick: async function () {
    await console.log("***You will see this message every 5 minutes ***\n");
    await scrape(url);
  },
  start: true,
  runOnInit: false,
});

job.start();
