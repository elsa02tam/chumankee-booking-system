import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw("alter table t_coupon_detail rename to t_coupon_service");
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw("alter table t_coupon_service rename to t_coupon_detail");
}
