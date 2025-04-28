import { Router } from "express";
import scrapInternshalaRouter from "../modules/scrap_jobs/internshala/scrap.internshala.router";
import scrapNaukriRouter from "../modules/scrap_jobs/naukri/scrap.naukri.router";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄" });
});

router.use("/scrap/internshala", scrapInternshalaRouter);
router.use("/scrap/naukri", scrapNaukriRouter);

export default router;
