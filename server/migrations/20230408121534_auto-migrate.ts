import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw("alter table `t_user` drop column `phone`");
  await knex.raw(
    "alter table `t_shop_setting` add column `rest_remark` text not null"
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw("alter table `t_shop_setting` drop column `rest_remark`");
  await knex.raw("alter table `t_user` add column `phone` integer not null");
}
