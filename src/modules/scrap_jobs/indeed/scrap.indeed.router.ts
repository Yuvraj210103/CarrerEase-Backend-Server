import { Router } from "express";
import * as scrapIndeedController from "./scrap.indeed.controller";

const scrapIndeedRouter = Router();

scrapIndeedRouter.get("/", scrapIndeedController.scrapIndeed);

export default scrapIndeedRouter;
