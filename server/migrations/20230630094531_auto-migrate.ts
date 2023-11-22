import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  if (!(await knex.schema.hasTable('t_notice'))) {
    await knex.schema.createTable('t_notice', table => {
      table.increments('id')
      table.text('title').notNullable()
      table.text('content').notNullable()
      table.integer('publish_time').nullable()
      table.timestamps(false, true)
    })
  }
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('t_notice')
}
