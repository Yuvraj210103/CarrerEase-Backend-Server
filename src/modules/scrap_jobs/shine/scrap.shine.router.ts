import { Router } from "express";
import * as scrapShineController from "./scrap.shine.controller";

const scrapShineRouter = Router();

scrapShineRouter.get("/", scrapShineController.scrapShine);

export default scrapShineRouter;
