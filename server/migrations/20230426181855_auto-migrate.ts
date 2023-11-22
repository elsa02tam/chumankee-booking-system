import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('delete from `t_payment`')
  await knex.raw('alter table `t_payment` add column `submit_time` integer not null')
  await knex.raw('alter table `t_payment` add column `filename` text not null')
  await knex.raw('alter table `t_payment` add column `accept_time` integer null')
  await knex.raw('alter table `t_payment` add column `reject_time` integer null')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_payment` drop column `reject_time`')
  await knex.raw('alter table `t_payment` drop column `accept_time`')
  await knex.raw('alter table `t_payment` drop column `filename`')
  await knex.raw('alter table `t_payment` drop column `submit_time`')
}
