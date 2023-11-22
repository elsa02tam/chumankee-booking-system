import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_coupon` add column `is_any_product` boolean null')
  await knex.raw('alter table `t_coupon` add column `is_any_service` boolean null')
  await knex.raw('alter table `t_coupon` add column `is_vip_only` boolean null')

  if (!(await knex.schema.hasTable('t_coupon_product'))) {
    await knex.schema.createTable('t_coupon_product', table => {
      table.increments('id')
      table.integer('coupon_id').unsigned().notNullable().references('t_coupon.id')
      table.integer('product_id').unsigned().notNullable().references('t_product.id')
      table.timestamps(false, true)
    })
  }
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('t_coupon_product')
  await knex.raw('alter table `t_coupon` drop column `is_vip_only`')
  await knex.raw('alter table `t_coupon` drop column `is_any_service`')
  await knex.raw('alter table `t_coupon` drop column `is_any_product`')
}
