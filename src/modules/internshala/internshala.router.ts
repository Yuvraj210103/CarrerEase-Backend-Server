import { Router } from "express";
import * as internshalaController from "./internshala.controller";

const internShalaRouter = Router();

internShalaRouter.post("/", internshalaController.applyJobsOnInternshala);

export default internShalaRouter;
