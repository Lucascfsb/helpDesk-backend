import express from "express";
import { routes } from "./routes";
import fs from "fs";
import { errorHandling } from "./middlewares/errorHandling";
import { UPLOAD_CONFIG } from "@/configs/upload";

const app = express();

app.use(express.json());

if (!fs.existsSync(UPLOAD_CONFIG.TMP_FOLDER)) {
  fs.mkdirSync(UPLOAD_CONFIG.TMP_FOLDER, { recursive: true });
}

if (!fs.existsSync(UPLOAD_CONFIG.UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOAD_CONFIG.UPLOADS_FOLDER, { recursive: true });
}

app.use("/files", express.static(UPLOAD_CONFIG.UPLOADS_FOLDER));
app.use(routes);
app.use(errorHandling);

export { app };
