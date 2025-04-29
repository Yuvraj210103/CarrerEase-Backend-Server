import { Router } from "express";
import scrapInternshalaRouter from "../modules/scrap_jobs/internshala/scrap.internshala.router";
import scrapNaukriRouter from "../modules/scrap_jobs/naukri/scrap.naukri.router";
import htmlToPdfRouter from "../modules/pdf/pdf.router";
import scrapShineRouter from "../modules/scrap_jobs/shine/scrap.shine.router";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄" });
});

router.use("/scrap/internshala", scrapInternshalaRouter);
router.use("/scrap/naukri", scrapNaukriRouter);
router.use("/scrap/shine", scrapShineRouter);

router.use("/html_to_pdf", htmlToPdfRouter);

export default router;
