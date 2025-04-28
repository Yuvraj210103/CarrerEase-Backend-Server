import express, { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import api from "./src/api/index.api";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello, TypeScript Node Express!");
});

app.use("/api/", api);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
