import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('t_service_booking', table => {
    table.dropNullable('booking_submit_time')
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('t_service_booking', table => {
    table.setNullable('booking_submit_time')
  })
}
