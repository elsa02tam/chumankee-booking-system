import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('t_email_template', table => {
    table.dropNullable('default_content')
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('t_email_template', table => {
    table.setNullable('default_content')
  })
}
