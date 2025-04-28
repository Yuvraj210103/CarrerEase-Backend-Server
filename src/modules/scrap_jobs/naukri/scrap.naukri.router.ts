import { Router } from "express";
import * as scrapNaukriController from "./scrap.naukri.controller";

const scrapNaukriRouter = Router();

scrapNaukriRouter.get("/", scrapNaukriController.scrapNaukri);

export default scrapNaukriRouter;
