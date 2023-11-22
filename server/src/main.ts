import { seed } from "./seed";
import express from "express";
import { print } from "listening-on";
import { app } from "./app";
import { env } from "./env";
import path from "path";
import debug from "debug";
import { autoSendRemindBookingEmails } from "./email";

let log404 = debug("404");
log404.enabled = true;

if (env.NODE_ENV === "development") {
  seed();
}

if (env.REMIND_BOOKING_EMAIL == "active") {
  autoSendRemindBookingEmails();
}

app.listen(env.PORT, () => {
  print(env.PORT);
});

app.use(express.static("www"));
app.use((req, res, next) => {
  if (req.method === "GET") {
    let accept = req.headers.accept;
    log404(req.method, req.url, { accept });
    if (accept?.includes("html")) {
      res.sendFile(path.resolve("www/index.html"));
      return;
    }
    if (accept?.includes("image")) {
      let r = Math.random().toString(36).slice(2);
      res.redirect(`https://picsum.photos/seed/${r}/200/200`);
      return;
    }
    next();
  }
  next();
});
