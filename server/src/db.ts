import { toSafeMode, newDB, DBInstance } from "better-sqlite3-schema";
import { existsSync } from "fs";

export const dbFile = existsSync("package.json")
  ? "db.sqlite3"
  : "../db.sqlite3";

export const db: DBInstance = newDB({
  path: dbFile,
  migrate: false,
});

toSafeMode(db);
