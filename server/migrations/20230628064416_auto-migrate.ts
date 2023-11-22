import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_user` add column `color` text null')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_user` drop column `color`')
}
