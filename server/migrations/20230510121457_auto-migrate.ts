import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('t_service', table => {
    table.dropNullable('price')
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('t_service', table => {
    table.setNullable('price')
  })
}
