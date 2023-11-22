import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_email_template` drop column `name`')
  await knex.raw('alter table `t_email_template` add column `name_en` text null')
  await knex.raw('alter table `t_email_template` add column `name_zh` text null')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_email_template` drop column `name_zh`')
  await knex.raw('alter table `t_email_template` drop column `name_en`')
  await knex.raw('alter table `t_email_template` add column `name` text not null')
}
