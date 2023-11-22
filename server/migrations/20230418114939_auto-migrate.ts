import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_service_booking` drop column `submit_time`')
  await knex.raw('alter table `t_service_booking` add column `booking_submit_time` integer null')
  await knex.raw('alter table `t_service_booking` add column `booking_accept_time` integer null')
  await knex.raw('alter table `t_service_booking` add column `booking_reject_time` integer null')
  await knex.raw('alter table `t_service_booking` add column `booking_cancel_time` integer null')
  await knex.raw('alter table `t_service_booking` add column `paid_deposit_time` integer null')
  await knex.raw('alter table `t_service_booking` add column `paid_fully_time` integer null')
  await knex.raw('alter table `t_service_booking` add column `arrive_time` integer null')
  await knex.raw('alter table `t_service_booking` add column `leave_time` integer null')
  await knex.raw('alter table `t_service_booking` add column `refund_submit_time` integer null')
  await knex.raw('alter table `t_service_booking` add column `refund_accept_time` integer null')
  await knex.raw('alter table `t_service_booking` add column `refund_reject_time` integer null')
  await knex.raw('alter table `t_service_booking` add column `refund_finish_time` integer null')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_service_booking` drop column `refund_finish_time`')
  await knex.raw('alter table `t_service_booking` drop column `refund_reject_time`')
  await knex.raw('alter table `t_service_booking` drop column `refund_accept_time`')
  await knex.raw('alter table `t_service_booking` drop column `refund_submit_time`')
  await knex.raw('alter table `t_service_booking` drop column `leave_time`')
  await knex.raw('alter table `t_service_booking` drop column `arrive_time`')
  await knex.raw('alter table `t_service_booking` drop column `paid_fully_time`')
  await knex.raw('alter table `t_service_booking` drop column `paid_deposit_time`')
  await knex.raw('alter table `t_service_booking` drop column `booking_cancel_time`')
  await knex.raw('alter table `t_service_booking` drop column `booking_reject_time`')
  await knex.raw('alter table `t_service_booking` drop column `booking_accept_time`')
  await knex.raw('alter table `t_service_booking` drop column `booking_submit_time`')
  await knex.raw('alter table `t_service_booking` add column `submit_time` integer not null')
}
