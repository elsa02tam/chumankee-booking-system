import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  if (!(await knex.schema.hasTable('t_email_template'))) {
    await knex.schema.createTable('t_email_template', table => {
      table.increments('id')
      table.text('name').notNullable()
      table.text('content').notNullable()
      table.text('variables').notNullable()
      table.timestamps(false, true)
    })
  }
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('t_email_template')
}
