import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  if (!(await knex.schema.hasTable('t_remind_booking'))) {
    await knex.schema.createTable('t_remind_booking', table => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('t_user.id')
      table.integer('notice_time').notNullable()
      table.timestamps(false, true)
    })
  }
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('t_remind_booking')
}
