import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_user` add column `delete_time` integer null')
  await knex.raw('alter table `t_user` add column `original_email` text null')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_user` drop column `original_email`')
  await knex.raw('alter table `t_user` drop column `delete_time`')
}
