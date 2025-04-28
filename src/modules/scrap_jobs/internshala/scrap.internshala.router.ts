import { Router } from "express";
import * as scrapInternshalaController from "./scrap.internshala.controller";

const scrapInternshalaRouter = Router();

scrapInternshalaRouter.post("/", scrapInternshalaController.scrapInternshala);

export default scrapInternshalaRouter;
