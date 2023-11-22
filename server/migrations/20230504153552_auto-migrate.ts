import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_service_booking` add column `full_pay_amount` integer null')
  await knex.raw('alter table `t_service_booking` add column `deposit_amount` integer null')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_service_booking` drop column `deposit_amount`')
  await knex.raw('alter table `t_service_booking` drop column `full_pay_amount`')
}
