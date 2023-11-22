import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('delete from `t_special_rest`')
  await knex.raw('delete from `t_coupon_detail`')
  await knex.raw('delete from `t_coupon`')

  await knex.raw('alter table `t_special_rest` drop column `to_datetime`')
  await knex.raw('alter table `t_special_rest` drop column `from_datetime`')
  await knex.raw('alter table `t_special_rest` add column `from_time` integer not null')
  await knex.raw('alter table `t_special_rest` add column `to_time` integer not null')
  await knex.raw('alter table `t_coupon` drop column `expired_datetime`')
  await knex.raw('alter table `t_coupon` add column `expired_time` integer not null')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_coupon` drop column `expired_time`')
  await knex.raw('alter table `t_coupon` add column `expired_datetime` datetime not null')
  await knex.raw('alter table `t_special_rest` drop column `to_time`')
  await knex.raw('alter table `t_special_rest` drop column `from_time`')
  await knex.raw('alter table `t_special_rest` add column `from_datetime` datetime not null')
  await knex.raw('alter table `t_special_rest` add column `to_datetime` datetime not null')
}
