import cors from "cors";
import express from "express";
import crypto from "crypto";
import Formidable from "formidable";
import { mkdirSync } from "fs";
import { core } from "./core";

export let app = express();

app.use(cors());

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(core.apiPrefix, core.router);

let uploadDir = "uploads";
mkdirSync(uploadDir, { recursive: true });

app.post(core.apiPrefix + "/upload", (req, res, next) => {
  //   console.log("receiving upload...");
  let form = Formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 200 * 1024,
    allowEmptyFiles: false,
    multiples: true,
    maxFiles: 10,
    maxTotalFileSize: 200 * 1024 * 10,
    maxFields: 10,
    maxFieldsSize: 200 * 1024 * 10,
    filter(part) {
      console.log("filter", part);
      return part.name === "file";
    },
    filename: (name, ext, part) =>
      crypto.randomUUID() + "." + part.mimetype?.split("/").pop(),
  });
  form.parse(req, (err, fields, files) => {
    // console.log("finished upload", { err, fields, files });
    if (err) {
      next(err);
      return;
    }
    let file = files.file;
    let fileList = Array.isArray(file) ? file : file ? [file] : [];
    let filenames = fileList.map((file) => file.newFilename);
    res.json({ filenames });
  });
});
app.use(core.apiPrefix + "/uploads", express.static(uploadDir));
