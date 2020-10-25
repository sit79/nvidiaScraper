#!/usr/bin/env node

require("dotenv").config();
const CronJob = require("cron").CronJob;
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
const Discord = require("discord.js");
const webhookClientRobot = new Discord.WebhookClient(
  process.env.ROBOT_DISCORD_ID,
  process.env.ROBOT_DISCORD_TOKEN
);
const webhookClientStefbot = new Discord.WebhookClient(
  process.env.STEFBOT_DISCORD_ID,
  process.env.STEFBOT_DISCORD_TOKEN
);
const webhookClientHeartbeat = new Discord.WebhookClient(
  process.env.HEARTBEAT_DISCORD_ID,
  process.env.HEARTBEAT_DISCORD_TOKEN
);

let message = "I am starting up...";
const embed = new Discord.MessageEmbed()
  .setTitle("NVIDIA GeForce RTX 3080 NBB scraper is starting...")
  // .addField("Inline field title", "Some value here", true)
  // .setFooter("Some footer text here", "https://i.imgur.com/wSTFkRM.png")
  .setTimestamp()
  .setDescription(message)
  .setColor("#ffa500");

webhookClientHeartbeat.send("", {
  username: "Heartbeat Checker",
  avatarURL: "https://duckduckgo.com/i/46055555.png",
  embeds: [embed],
});

const scrape = (url) => {
  console.log("checking www.notebooksbilliger.de");
  return new Promise(async (resolve, reject) => {
    let browser = null;
    let dataObj = {};
    try {
      browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
      });

      let message = '';

      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForSelector(".soldOut").catch(() => message = '');
      if(message === ''){
        dataObj["showTitle"] = await page.title();
        dataObj["available"] = await page.evaluate(() => {
          let button = document.querySelector(".soldOut").innerText;
          return button;
        });
        let time = new Date();
        console.log(`running, ${time.getHours()}:${time.getMinutes()}`);
        console.table(dataObj["showTitle"]);
        console.table(dataObj["available"]);

        message = dataObj["available"].toLowerCase();
      }

      if (message === "dieses produkt ist leider ausverkauft.") {
        const embed = await new Discord.MessageEmbed()
          .setTitle("NVIDIA GeForce RTX 3080")
          .addField('URL', url, true)
          .addField('Store', 'Notebooksbilliger.de', true)
          .addField('Brand', 'Nvidia', true)
          .addField('Model', '3080 Founders Edition', true)
          .setDescription(message)
          .setTimestamp()
          .setColor("#ff0000");

        await webhookClientStefbot.send("Just checked.", {
          username: "stefbot",
          avatarURL: "https://duckduckgo.com/i/46055555.png",
          embeds: [embed],
        });
      } else {
        message =
          "https://www.notebooksbilliger.de/nvidia+geforce+rtx+3080+founders+edition+683301";
        const embed = await new Discord.MessageEmbed()
            .setTitle("NVIDIA GeForce RTX 3080")
            .addField('URL', url, true)
            .addField('Store', 'Notebooksbilliger.de', true)
            .addField('Brand', 'Nvidia', true)
            .addField('Model', '3080 Founders Edition', true)
            .setDescription(message)
            .setTimestamp()
          .setColor("#7cfc00");

        await webhookClientRobot.send("<@&760440519708639242> Just checked.", {
          username: "robot",
          avatarURL: "https://duckduckgo.com/i/46055555.png",
          embeds: [embed],
        });
      }

      return resolve(dataObj);
    } catch (e) {
      return reject(e);
    } finally {
      browser.close();
    }
  });
};

const url =
  // "https://www.nvidia.com/de-de/geforce/graphics-cards/30-series/rtx-3080/?nvid=nv-int-gfhm-33950";
  "https://www.notebooksbilliger.de/nvidia+geforce+rtx+3080+founders+edition+683301";

const job = new CronJob({
  cronTime: "0 */1 * * * *",
  onTick: async function () {
    await console.log("***You will see this message every 1 minutes ***\n");
    await scrape(url);
  },
  start: true,
  runOnInit: true,
});

const jobHeartbeat = new CronJob({
  cronTime: "0 */15 * * * *",
  onTick: async function () {
    message = "I am up and running :)";
    const embed = await new Discord.MessageEmbed()
      .setTitle("NVIDIA GeForce RTX 3080 NBB scraper is healthy")
      .setTimestamp()
      .setDescription(message)
      .setColor("#0099ff");
    await webhookClientHeartbeat.send("", {
      username: "Heartbeat Checker",
      avatarURL: "https://duckduckgo.com/i/46055555.png",
      embeds: [embed],
    });
  },
  start: true,
  runOnInit: true,
});

job.start();
jobHeartbeat.start();
