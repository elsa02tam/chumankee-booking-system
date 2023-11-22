import { config } from "dotenv";
import populateEnv from "populate-env";

config();

export let env = {
  NODE_ENV: "development",
  ORIGIN: "http://localhost:8704",
  PORT: 8704,
  JWT_SECRET: "ChuManKeeJWT3ecret87048704",
  FRONTEND_ORIGIN: "http://chumankee.xyz",
  COMPANY_NAME: "Chu Man Kee Limited",
  COMPANY_PHONE: "852-96957888",
  COMPANY_ADDRESS:
    "G/F, SIN HUA MANSION, NO.103-105 MA TAU WAI ROAD, HUNG HOM, KL",
  EMAIL_HOST: "smtp-mail.outlook.com",
  EMAIL_ADDRESS: "classdiapp@outlook.com",
  EMAIL_PASSWORD: "infohk20",
  REMIND_BOOKING_EMAIL: "active", // set to be "active", "skip"
  SKIP_EMAIL: "false", // set to be "false", or "skip"
  STRIPE_API_KEY:
    "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",
};

populateEnv(env, { mode: "halt" });
