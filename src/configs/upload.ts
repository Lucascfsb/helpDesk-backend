import path from "path";
import crypto from "crypto";
import multer from "multer";

const TMP_FOLDER = path.resolve(__dirname, "..", "..", "tmp");
const UPLOADS_FOLDER = path.resolve(TMP_FOLDER, "uploads");

export const UPLOAD_CONFIG = {
  TMP_FOLDER,
  UPLOADS_FOLDER,
  MULTER: {
    storage: multer.diskStorage({
      destination: TMP_FOLDER,
      filename(_req, file, callback) {
        const fileHash = crypto.randomBytes(10).toString("hex");
        const fileName = `${fileHash}-${file.originalname}`;
        return callback(null, fileName);
      },
    }),
  },
};
