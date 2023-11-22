import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  if (!(await knex.schema.hasTable('t_addon_booking'))) {
    await knex.schema.createTable('t_addon_booking', table => {
      table.increments('id')
      table.integer('service_id').unsigned().notNullable().references('t_service.id')
      table.integer('booking_id').unsigned().notNullable().references('t_service_booking.id')
      table.timestamps(false, true)
    })
  }
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('t_addon_booking')
}
