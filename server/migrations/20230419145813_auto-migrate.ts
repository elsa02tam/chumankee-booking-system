import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  if (!(await knex.schema.hasTable('t_plan'))) {
    await knex.schema.createTable('t_plan', table => {
      table.increments('id')
      table.integer('service_id').unsigned().nullable().references('t_service.id')
      table.integer('service_type_id').unsigned().nullable().references('t_service_type.id')
      table.integer('weekly_quota').nullable()
      table.integer('quota').nullable()
      table.integer('expire_month').nullable()
      table.text('desc').notNullable()
      table.text('title').notNullable()
      table.timestamps(false, true)
    })
  }
  await knex.raw('alter table `t_service_booking` add column `plan_id` integer null references `t_plan`(`id`)')

  if (!(await knex.schema.hasTable('t_plan'))) {
    await knex.schema.createTable('t_plan', table => {
      table.increments('id')
      table.integer('service_id').unsigned().nullable().references('t_service.id')
      table.integer('service_type_id').unsigned().nullable().references('t_service_type.id')
      table.integer('weekly_quota').nullable()
      table.integer('quota').nullable()
      table.integer('expire_month').nullable()
      table.text('desc').notNullable()
      table.text('title').notNullable()
      table.timestamps(false, true)
    })
  }
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('t_plan')
  await knex.raw('alter table `t_service_booking` drop column `plan_id`')
  await knex.schema.dropTableIfExists('t_plan')
}
