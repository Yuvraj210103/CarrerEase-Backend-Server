import { NextFunction, Request, Response } from "express";
import { IJobs } from "../../../interface/job";
import { PuppeteerConfig } from "../../../contsants/PuppeteerConfig";
import { openBrowser } from "../../../utils/misc";

export const scrapIndeed = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Launch the browser
    const filter = req.query.filter;
    const browser = await openBrowser();

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
    console.log("Opening indeed jobs page...");

    if (filter && filter?.length && filter !== "undefined") {
      console.log(filter, "here filter");
      await page.goto(`https://in.indeed.com/${filter}`, {
        waitUntil: "networkidle2",
      });
    } else {
      await page.goto("https://in.indeed.com/jobs", {
        waitUntil: "networkidle2",
      });
    }

    // Wait for internship elements to load (specific selector for internship listing)
    console.log("Waiting for jobs listings to load...");

    await page.waitForSelector(".css-1ac2h1w eu4oa1w0", { visible: true });

    const innerHtmlInternships = await page.$eval(
      "li#css-1ac2h1w eu4oa1w0",
      (element) => element.innerHTML
    );
    console.log(innerHtmlInternships, "here text content");

    return;
    // Extract internship details
    const jobs = await page.$$eval("li.css-1ac2h1w eu4oa1w0", (jobCards) => {
      return jobCards
        .filter((jobCard) => !jobCard.querySelector("[id^='mosaic']")) // Skip mosaic (non-job) entries
        .map((jobCard) => {
          const titleElement = jobCard.querySelector("h2.jobTitle span");
          const companyElement = jobCard.querySelector(".companyName");
          const locationElement = jobCard.querySelector(".companyLocation");
          const salaryElement = jobCard.querySelector(".salary-snippet");
          const descriptionElement = jobCard.querySelector(".job-snippet");
          const postedDateElement = jobCard.querySelector(".date");
          const linkElement = jobCard.querySelector("h2.jobTitle a");

          const job: IJobs = {
            JobTitle: titleElement?.textContent?.trim() || "",
            JobDescription:
              descriptionElement?.textContent?.trim().replace(/\n/g, " ") || "",
            JobCompany: companyElement?.textContent?.trim() || "",
            JobDuration: "", // Indeed usually doesn't show experience required directly
            JobSalary: salaryElement?.textContent?.trim() || "Not disclosed",
            JobLocation: locationElement?.textContent?.trim() || "",
            JobUrl: linkElement?.getAttribute("href")
              ? `https://in.indeed.com${linkElement.getAttribute("href")}`
              : "",
            JobPlatform: "Indeed",
            JobPostedAt: postedDateElement?.textContent?.trim() || "",
            JobStatus: "Open",
            JobScrapedAt: new Date(),
          };

          return job;
        });
    });

    await browser.close();

    console.log("Scrapped indeed jobs successfully");

    res.status(200).json({
      message: "Scrapped indeed jobs successfully",
      data: jobs.filter((res) => res.JobTitle && res.JobUrl),
    });
  } catch (error) {
    next(error);
    console.error("Error:", error);
  }
};
