import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw("delete from `t_service_booking`");
  await knex.raw("alter table `t_service_booking` drop column `to_datetime`");
  await knex.raw("alter table `t_service_booking` drop column `from_datetime`");
  await knex.raw(
    "alter table `t_service_booking` drop column `booking_status`"
  );
  await knex.raw(
    "alter table `t_service_booking` add column `from_time` integer not null"
  );
  await knex.raw(
    "alter table `t_service_booking` add column `to_time` integer not null"
  );
  await knex.raw(
    "alter table `t_service_booking` add column `submit_time` integer not null"
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw("alter table `t_service_booking` drop column `submit_time`");
  await knex.raw("alter table `t_service_booking` drop column `to_time`");
  await knex.raw("alter table `t_service_booking` drop column `from_time`");
  await knex.raw(
    "alter table `t_service_booking` add column `booking_status` integer not null"
  );
  await knex.raw(
    "alter table `t_service_booking` add column `from_datetime` datetime not null"
  );
  await knex.raw(
    "alter table `t_service_booking` add column `to_datetime` datetime not null"
  );
}
