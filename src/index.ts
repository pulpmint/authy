import type { Request, Response } from "express";

import express from "express";
import morgan from "morgan";

import { BASE_ROUTE } from "@/constants/routes";

const app = express();

app.use(express.json());
app.use(morgan("tiny"));

app.get(BASE_ROUTE, (req: Request, res: Response) => {
  res.status(200).json({
    msg: "Server is running"
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    msg: "API not found"
  });
});

app.listen(5000, () => {
  console.log("🟢 Server started successfully on port 5000");
});
