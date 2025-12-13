import type { Request, Response } from "express";

import express from "express";
import morgan from "morgan";
import { exit } from "process";

import errorHandler from "./middlewares/errorMidleware";

import authController from "@/controllers/authController";

import { BASE_ROUTE } from "@/constants/routes";

import Initialiser from "@/lib/initialiser";

const initialiser = new Initialiser();

initialiser
  .init()
  .then(() => {
    const app = express();

    app.use(express.json());
    app.use(morgan("tiny"));

    app.get(BASE_ROUTE, (req: Request, res: Response) => {
      res.status(200).json({
        message: "Server is running"
      });
      return;
    });

    app.use(authController);

    app.use((req: Request, res: Response) => {
      res.status(404).json({
        message: "API not found"
      });
      return;
    });

    app.use(errorHandler);

    app.listen(5000, () => {
      console.log("🟢 Server started successfully on port 5000");
    });
  })
  .catch(() => {
    console.log("🔴 Stopping the server due to an error during initialisation");
    exit(1);
  });
