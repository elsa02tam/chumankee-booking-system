import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_shop_setting` drop column `allowCancelBookingTime`')
  await knex.raw('alter table `t_shop_setting` add column `allow_cancel_booking_time` integer null')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_shop_setting` drop column `allow_cancel_booking_time`')
  await knex.raw('alter table `t_shop_setting` add column `allowCancelBookingTime` integer null')
}
