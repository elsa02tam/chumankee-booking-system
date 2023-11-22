import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_service` add column `is_vip` boolean null')
  await knex.raw('alter table `t_product` add column `is_vip` boolean null')
  await knex.raw('alter table `t_payment` add column `method` text null')

  if (!(await knex.schema.hasTable('t_addon_service'))) {
    await knex.schema.createTable('t_addon_service', table => {
      table.increments('id')
      table.integer('from_service_id').unsigned().notNullable().references('t_service.id')
      table.integer('to_service_id').unsigned().notNullable().references('t_service.id')
      table.timestamps(false, true)
    })
  }
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('t_addon_service')
  await knex.raw('alter table `t_payment` drop column `method`')
  await knex.raw('alter table `t_product` drop column `is_vip`')
  await knex.raw('alter table `t_service` drop column `is_vip`')
}
