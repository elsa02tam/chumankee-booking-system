import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("t_rest");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("t_rest", (table) => {
    table.increments("id");
    table.text("remark").notNullable();
    table.integer("week_day").notNullable();
    table.time("from_time").notNullable();
    table.time("to_time").notNullable();
    table.timestamps(false, true);
  });
}
