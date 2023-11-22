import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('t_email_template', table => {
    table.setNullable('content')
  })
  await knex.raw('alter table `t_email_template` add column `default_content` text null')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_email_template` drop column `default_content`')
  await knex.schema.alterTable('t_email_template', table => {
    table.dropNullable('content')
  })
}
