import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  if (!(await knex.schema.hasTable('t_user_plan'))) {
    await knex.schema.createTable('t_user_plan', table => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('t_user.id')
      table.integer('plan_id').unsigned().notNullable().references('t_plan.id')
      table.integer('expire_time').notNullable()
      table.timestamps(false, true)
    })
  }
  await knex.raw('alter table `t_service_booking` drop column `plan_id`')
  await knex.raw('alter table `t_service_booking` add column `user_plan_id` integer null references `t_user_plan`(`id`)')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `t_service_booking` drop column `user_plan_id`')
  await knex.raw('alter table `t_service_booking` add column `plan_id` integer null references `t_plan`(`id`)')
  await knex.schema.dropTableIfExists('t_user_plan')
}
