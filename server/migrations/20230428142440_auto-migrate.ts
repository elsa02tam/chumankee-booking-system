import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_service_booking` add column `promo_code_id` integer null references `t_coupon`(`id`)')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_service_booking` drop column `promo_code_id`')
}
