import { NextFunction, Request, Response } from "express";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";
import { IJobs } from "../../../interface/job";

puppeteer.use(StealthPlugin());
puppeteer.use(
  AnonymizeUAPlugin({
    customFn: (ua) => ua.replace("HeadlessChrome/", "Chrome/"),
  })
);

export const scrapNaukri = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Launch the browser
    const filter = req.query.filter;
    const browser = await puppeteer.launch({
      headless: true,
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

    const page = await browser.newPage();

    // Fix navigator.webdriver
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });
      Object.defineProperty(navigator, "platform", { get: () => "Win32" });
      Object.defineProperty(navigator, "vendor", { get: () => "Google Inc." });
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    );

    // Open a new page
    console.log("Opening naukri jobs page...");

    if (filter && filter?.length && filter !== "undefined") {
      console.log(filter, "here");
      await page.goto(`https://www.naukri.com/${filter}`, {
        waitUntil: "networkidle2",
      });
    } else {
      await page.goto("https://www.naukri.com/jobs-in-india", {
        waitUntil: "networkidle2",
      });
    }

    // Wait for internship elements to load (specific selector for internship listing)
    console.log("Waiting for naukri listings to load...");
    /* await page.waitForSelector(".styles_middle-section-container__iteRZ", {
      visible: true,
    });

    const innerHtmlInternships = await page.$eval(
      "div.cust-srp-jobtuple-wrapper-tuple",
      (element) => element.innerHTML
    );
    console.log(innerHtmlInternships, "here text content"); */

    // Extract job details
    await page.waitForSelector(".srp-jobtuple-wrapper", { visible: true });

    // Extract job details
    const jobs = await page.$$eval(".cust-job-tuple", (jobCards) => {
      return jobCards.map((jobCard) => {
        const titleElement = jobCard.querySelector("h2 a.title");
        const companyElement = jobCard.querySelector(".row2 .comp-name");
        const experienceElement = jobCard.querySelector(
          ".row3 .exp-wrap span[title]"
        );
        const salaryElement = jobCard.querySelector(
          ".row3 .sal-wrap span[title]"
        );
        const locationElement = jobCard.querySelector(
          ".row3 .loc-wrap span[title]"
        );
        const descriptionElement = jobCard.querySelector(".row4 .job-desc");
        const postedDateElement = jobCard.querySelector(".row6 .job-post-day");

        const job: IJobs = {
          JobTitle: titleElement?.textContent?.trim() || "",
          JobDescription: descriptionElement?.textContent?.trim() || "",
          JobCompany: companyElement?.textContent?.trim() || "",
          JobDuration: experienceElement?.textContent?.trim() || "", // Experience years
          JobSalary: salaryElement?.textContent?.trim() || "",
          JobLocation: locationElement?.textContent?.trim() || "",
          JobUrl: titleElement?.getAttribute("href") || "",
          JobPlatform: "Naukri",
          JobPostedAt: postedDateElement?.textContent?.trim() || "",
          JobStatus: "Open",
          JobScrapedAt: new Date(),
        };

        return job;
      });
    });

    await browser.close();

    res.status(200).json({
      message: "Scraped Naukri jobs successfully",
      data: jobs.filter((res) => res.JobTitle && res.JobUrl),
    });
  } catch (error) {
    next(error);
    console.error("Error:", error);
  }
};
