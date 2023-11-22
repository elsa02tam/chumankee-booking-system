import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_coupon` add column `quota` integer null')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_coupon` drop column `quota`')
}
