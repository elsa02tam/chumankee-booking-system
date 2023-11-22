import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_event` add column `quota` integer null')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_event` drop column `quota`')
}
