import type { Knex } from "knex";
import { dbFile } from "./src/db";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "better-sqlite3",
    useNullAsDefault: true,
    connection: {
      filename: dbFile,
    },
  },
};

module.exports = config;
