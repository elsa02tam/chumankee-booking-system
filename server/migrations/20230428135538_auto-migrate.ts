import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_payment` add column `order_id` integer null references `t_shopping_order`(`id`)')
  await knex.raw('alter table `t_payment` add column `booking_id` integer null references `t_service_booking`(`id`)')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_payment` drop column `booking_id`')
  await knex.raw('alter table `t_payment` drop column `order_id`')
}
