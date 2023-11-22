import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_payment` add column `stripe_id` text null')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_payment` drop column `stripe_id`')
}
