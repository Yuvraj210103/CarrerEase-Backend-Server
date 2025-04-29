import { NextFunction, Request, Response } from "express";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";
import { IJobs } from "../../../interface/job";
import { PuppeteerConfig } from "../../../contsants/PuppeteerConfig";

puppeteer.use(StealthPlugin());
puppeteer.use(
  AnonymizeUAPlugin({
    customFn: (ua) => ua.replace("HeadlessChrome/", "Chrome/"),
  })
);

export const scrapInternshala = async (
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

    page.setDefaultTimeout(PuppeteerConfig.TIMEOUT);

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
    console.log("Opening internshala jobs page...");

    if (filter && filter?.length && filter !== "undefined") {
      console.log(filter, "here filter");
      await page.goto(`https://internshala.com/internships/${filter}`, {
        waitUntil: "networkidle2",
      });
    } else {
      await page.goto("https://internshala.com/internships", {
        waitUntil: "networkidle2",
      });
    }

    // Close the login popup if it appears
    try {
      const loginCloseButton = await page.$("#close_popup"); // Use the correct selector by id
      if (loginCloseButton) {
        await loginCloseButton.click();
        console.log("Login popup closed");
      }
    } catch (error) {
      console.log("No login popup found");
    }

    // Wait for internship elements to load (specific selector for internship listing)
    console.log("Waiting for internship listings to load...");
    await page.waitForSelector(".internship_meta", { visible: true });

    /*  const innerHtmlInternships = await page.$eval(
      "div#internship_list_container",
      (element) => element.innerHTML
    );
    console.log(innerHtmlInternships, "here text content"); */
    // Extract internship details
    const internships = await page.$$eval(
      ".individual_internship",
      (internships) => {
        return internships.map((internship) => {
          const titleElement = internship.querySelector(
            ".job-internship-name a"
          );
          const companyElement = internship.querySelector(".company-name");
          const locationElement = internship.querySelector(
            ".row-1-item.locations a"
          );
          // Adjusted the selector for duration (second row-1-item)
          const duration = internship.querySelectorAll(
            ".detail-row-1 .row-1-item span"
          )[1] // Selecting the second span
            ? internship
                ?.querySelectorAll(".detail-row-1 .row-1-item span")[1]
                ?.textContent?.trim()
            : null;
          const stipendElement = internship.querySelector(".stipend");
          const statusElement = internship.querySelector(
            ".status-success span"
          );
          const url = internship.querySelector(".job-title-href")
            ? internship.querySelector(".job-title-href")?.getAttribute("href")
            : null;

          const job: IJobs = {
            JobTitle: titleElement?.textContent?.trim() || "",
            JobCompany: companyElement?.textContent?.trim() || "",
            JobLocation: locationElement?.textContent?.trim() || "",
            JobDuration: duration?.trim() || "",
            JobSalary: stipendElement?.textContent?.trim() || "",
            JobUrl: `https://internshala.com/${url}`,
            JobPlatform: "Internshala",
            JobStatus: "Open",
            JobScrapedAt: new Date(),
          };

          return job;
        });
      }
    );

    await browser.close();

    console.log("Scrapped internshala jobs successfully");

    res.status(200).json({
      message: "Scrapped internshala jobs successfully",
      data: internships.filter((res) => res.JobTitle && res.JobUrl),
    });
  } catch (error) {
    next(error);
    console.error("Error:", error);
  }
};
