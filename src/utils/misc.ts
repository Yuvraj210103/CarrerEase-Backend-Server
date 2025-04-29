import { Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function slowType(page: Page, selector: string, text: string) {
  for (const char of text) {
    await page.type(selector, char);
    await sleep(Math.random() * 300); // Random delay
  }
}

puppeteer.use(StealthPlugin());
puppeteer.use(
  AnonymizeUAPlugin({
    customFn: (ua) => ua.replace("HeadlessChrome/", "Chrome/"),
  })
);

export const openBrowser = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      "--start-maximized",
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars", // <- remove 'controlled by automated test software' banner
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });

  return browser;
};
