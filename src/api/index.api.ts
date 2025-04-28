import { Router } from "express";
import scrapInternshalaRouter from "../modules/scrap_jobs/internshala/scrap.internshala.router";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄" });
});

router.use("/scrap/internshala", scrapInternshalaRouter);

export default router;
