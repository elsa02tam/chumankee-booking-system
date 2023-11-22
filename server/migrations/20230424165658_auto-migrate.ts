import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_service` add column `price` integer null')
  await knex.raw('alter table `t_plan` add column `price` integer null')
  await knex.raw('alter table `t_user_plan` add column `payment_time` integer null')

  if (!(await knex.schema.hasTable('t_product_type'))) {
    await knex.schema.createTable('t_product_type', table => {
      table.increments('id')
      table.text('type').notNullable().unique()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('t_product'))) {
    await knex.schema.createTable('t_product', table => {
      table.increments('id')
      table.integer('type_id').unsigned().notNullable().references('t_product_type.id')
      table.text('name').notNullable()
      table.text('desc').notNullable()
      table.text('pic').notNullable()
      table.integer('price').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('t_shopping_order'))) {
    await knex.schema.createTable('t_shopping_order', table => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('t_user.id')
      table.integer('product_id').unsigned().notNullable().references('t_product.id')
      table.integer('promo_code_id').unsigned().notNullable().references('t_coupon.id')
      table.integer('checkout_time').nullable()
      table.integer('full_pay_time').nullable()
      table.integer('full_pay_amount').nullable()
      table.integer('full_pay_deadline').nullable()
      table.integer('deposit_time').nullable()
      table.integer('deposit_amount').nullable()
      table.integer('deposit_deadline').nullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('t_payment'))) {
    await knex.schema.createTable('t_payment', table => {
      table.increments('id')
      table.text('remark').notNullable()
      table.timestamps(false, true)
    })
  }
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('t_payment')
  await knex.schema.dropTableIfExists('t_shopping_order')
  await knex.schema.dropTableIfExists('t_product')
  await knex.schema.dropTableIfExists('t_product_type')
  await knex.raw('alter table `t_user_plan` drop column `payment_time`')
  await knex.raw('alter table `t_plan` drop column `price`')
  await knex.raw('alter table `t_service` drop column `price`')
}
