import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  if (!(await knex.schema.hasTable('t_addon_product'))) {
    await knex.schema.createTable('t_addon_product', table => {
      table.increments('id')
      table.integer('from_product_id').unsigned().notNullable().references('t_product.id')
      table.integer('to_product_id').unsigned().notNullable().references('t_product.id')
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('t_addon_order'))) {
    await knex.schema.createTable('t_addon_order', table => {
      table.increments('id')
      table.integer('product_id').unsigned().notNullable().references('t_product.id')
      table.integer('shopping_order_id').unsigned().notNullable().references('t_shopping_order.id')
      table.timestamps(false, true)
    })
  }
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('t_addon_order')
  await knex.schema.dropTableIfExists('t_addon_product')
}
