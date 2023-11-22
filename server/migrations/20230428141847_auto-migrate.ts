import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw("alter table `t_coupon` drop column `coupon_discount`");
  await knex.raw("alter table `t_coupon` drop column `coupon_type`");
  await knex.raw("delete from `t_order_part`");
  await knex.raw("delete from `t_shopping_order`");
  await knex.raw("delete from `t_coupon_service`");
  await knex.raw("delete from `t_coupon`");
  await knex.raw(
    "alter table `t_coupon` add column `discount_amount` integer not null"
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw("alter table `t_coupon` drop column `discount_amount`");
  await knex.raw(
    "alter table `t_coupon` add column `coupon_type` integer not null"
  );
  await knex.raw(
    "alter table `t_coupon` add column `coupon_discount` integer not null"
  );
}
