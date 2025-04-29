import { NextFunction, Request, Response } from "express";
import { IJobs } from "../../../interface/job";
import { PuppeteerConfig } from "../../../contsants/PuppeteerConfig";
import { openBrowser } from "../../../utils/misc";

export const scrapShine = async (
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
    console.log("Opening shine jobs page...");

    if (filter && filter?.length && filter !== "undefined") {
      console.log(filter, "here filter");
      await page.goto(`https://www.shine.com/${filter}`, {
        waitUntil: "networkidle2",
      });
    } else {
      await page.goto("https://www.shine.com/job-search/jobs", {
        waitUntil: "networkidle2",
      });
    }

    // Wait for internship elements to load (specific selector for internship listing)
    console.log("Waiting for jobs listings to load...");

    await page.waitForSelector(".jobCardNova_bigCard__W2xn3", {
      visible: true,
    });

    // Extract internship details
    const jobs = await page.$$eval(
      ".jobCardNova_bigCard__W2xn3",
      (jobCards) => {
        return jobCards.map((jobCard) => {
          const titleElement = jobCard.querySelector(
            ".jobCardNova_bigCardTopTitleHeading__Rj2sC a"
          );
          const companyElement = jobCard.querySelector(
            ".jobCardNova_bigCardTopTitleName__M_W_m"
          );
          const experienceElement = jobCard.querySelector(
            ".jobCardNova_bigCardCenterListExp__KTSEc"
          );
          const locationElement = jobCard.querySelector(
            ".jobCardNova_bigCardCenterListLoc__usiPB"
          );
          const skillsElement = jobCard.querySelectorAll(
            ".jobCardNova_skillsLists__7YifX li"
          );
          const postedDateElement = jobCard.querySelector(
            ".jobApplyBtnNova_days__yODJj"
          );
          const urlMetaElement = jobCard.querySelector('meta[itemprop="url"]');

          const skills = Array.from(skillsElement || []).map((li) =>
            li.textContent?.trim()
          );

          const job: IJobs = {
            JobTitle: titleElement?.textContent?.trim() || "",
            JobDescription: skills.join(", "), // Shine doesn't have a full description on listing
            JobCompany: companyElement?.textContent?.trim() || "",
            JobDuration: experienceElement?.textContent?.trim() || "", // Experience
            JobSalary: "", // Not shown on listing page
            JobLocation: locationElement?.textContent?.trim() || "",
            JobUrl: urlMetaElement?.getAttribute("content") || "",
            JobPlatform: "Shine",
            JobPostedAt: postedDateElement?.textContent?.trim() || "",
            JobStatus: "Open",
            JobScrapedAt: new Date(),
          };

          return job;
        });
      }
    );

    await browser.close();

    console.log("Scrapped shine jobs successfully");

    res.status(200).json({
      message: "Scrapped shine jobs successfully",
      data: jobs.filter((res) => res.JobTitle && res.JobUrl),
    });
  } catch (error) {
    next(error);
    console.error("Error:", error);
  }
};
