import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('t_payment', table => {
    table.setNullable('filename')
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('t_payment', table => {
    table.dropNullable('filename')
  })
}
