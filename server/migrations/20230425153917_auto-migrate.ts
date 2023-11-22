import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("t_shopping_order");
}

export async function down(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("t_shopping_order"))) {
    await knex.schema.createTable("t_shopping_order", (table) => {
      table.increments("id");
      table.integer("user_id").unsigned().notNullable().references("t_user.id");
      table
        .integer("product_id")
        .unsigned()
        .notNullable()
        .references("t_product.id");
      table
        .integer("promo_code_id")
        .unsigned()
        .notNullable()
        .references("t_coupon.id");
      table.integer("checkout_time").nullable();
      table.integer("full_pay_time").nullable();
      table.integer("full_pay_amount").nullable();
      table.integer("full_pay_deadline").nullable();
      table.integer("deposit_time").nullable();
      table.integer("deposit_amount").nullable();
      table.integer("deposit_deadline").nullable();
      table.timestamps(false, true);
    });
  }
}
