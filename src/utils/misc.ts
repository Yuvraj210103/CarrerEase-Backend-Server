import { Page } from "puppeteer";

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function slowType(page: Page, selector: string, text: string) {
  for (const char of text) {
    await page.type(selector, char);
    await sleep(Math.random() * 300); // Random delay
  }
}
