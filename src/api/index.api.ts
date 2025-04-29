import { Router } from "express";
import scrapInternshalaRouter from "../modules/scrap_jobs/internshala/scrap.internshala.router";
import scrapNaukriRouter from "../modules/scrap_jobs/naukri/scrap.naukri.router";
import htmlToPdfRouter from "../modules/pdf/pdf.router";
import scrapIndeedRouter from "../modules/scrap_jobs/indeed/scrap.indeed.router";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄" });
});

router.use("/scrap/internshala", scrapInternshalaRouter);
router.use("/scrap/naukri", scrapNaukriRouter);
router.use("/scrap/indeed", scrapIndeedRouter);

router.use("/html_to_pdf", htmlToPdfRouter);

export default router;
