import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_shop_setting` add column `remind_booking_interval` integer null')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_shop_setting` drop column `remind_booking_interval`')
}
