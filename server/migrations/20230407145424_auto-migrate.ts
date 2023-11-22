import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("t_user"))) {
    await knex.schema.createTable("t_user", (table) => {
      table.increments("id");
      table.text("username").notNullable().unique();
      table.text("password_hash").notNullable();
      table.text("email").notNullable().unique();
      table
        .enum("role", ["super_admin", "admin", "service_provider", "consumer"])
        .notNullable();
      table.boolean("is_vip").notNullable();
      table.integer("phone").notNullable();
      table.text("pic").nullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("t_service_type"))) {
    await knex.schema.createTable("t_service_type", (table) => {
      table.increments("id");
      table.text("name").notNullable().unique();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("t_service"))) {
    await knex.schema.createTable("t_service", (table) => {
      table.increments("id");
      table
        .integer("type_id")
        .unsigned()
        .notNullable()
        .references("t_service_type.id");
      table.text("name").notNullable();
      table.integer("quota").notNullable();
      table.text("pic").nullable();
      table.integer("duration").notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("t_provider_working_hr"))) {
    await knex.schema.createTable("t_provider_working_hr", (table) => {
      table.increments("id");
      table
        .integer("provider_id")
        .unsigned()
        .notNullable()
        .references("t_user.id");
      table.integer("week_day").notNullable();
      table.time("from_time").notNullable();
      table.time("to_time").notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("t_service_provider"))) {
    await knex.schema.createTable("t_service_provider", (table) => {
      table.increments("id");
      table
        .integer("provider_id")
        .unsigned()
        .notNullable()
        .references("t_user.id");
      table
        .integer("service_id")
        .unsigned()
        .notNullable()
        .references("t_service.id");
      table.integer("booking_max").notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("t_shop_working_hr"))) {
    await knex.schema.createTable("t_shop_working_hr", (table) => {
      table.increments("id");
      table.integer("week_day").notNullable();
      table.time("from_time").nullable();
      table.time("to_time").nullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("t_rest"))) {
    await knex.schema.createTable("t_rest", (table) => {
      table.increments("id");
      table.text("remark").notNullable();
      table.integer("week_day").notNullable();
      table.time("from_time").notNullable();
      table.time("to_time").notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("t_special_rest"))) {
    await knex.schema.createTable("t_special_rest", (table) => {
      table.increments("id");
      table.text("remark").notNullable();
      table.datetime("from_datetime").notNullable();
      table.datetime("to_datetime").notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("t_service_booking"))) {
    await knex.schema.createTable("t_service_booking", (table) => {
      table.increments("id");
      table.integer("user_id").unsigned().notNullable().references("t_user.id");
      table
        .integer("service_id")
        .unsigned()
        .notNullable()
        .references("t_service.id");
      table
        .integer("provider_id")
        .unsigned()
        .notNullable()
        .references("t_user.id");
      table.integer("booking_status").notNullable();
      table.datetime("from_datetime").notNullable();
      table.datetime("to_datetime").notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("t_event"))) {
    await knex.schema.createTable("t_event", (table) => {
      table.increments("id");
      table.text("name").notNullable();
      table.text("remark").notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("t_shop_setting"))) {
    await knex.schema.createTable("t_shop_setting", (table) => {
      table.increments("id");
      table.integer("ppl_max").notNullable();
      table.integer("break_unit").notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("t_coupon"))) {
    await knex.schema.createTable("t_coupon", (table) => {
      table.increments("id");
      table.text("coupon_code").notNullable();
      table.integer("coupon_type").notNullable();
      table.integer("coupon_discount").notNullable();
      table.datetime("expired_datetime").notNullable();
      table.timestamps(false, true);
    });
  }

  if (!(await knex.schema.hasTable("t_coupon_detail"))) {
    await knex.schema.createTable("t_coupon_detail", (table) => {
      table.increments("id");
      table
        .integer("coupon_id")
        .unsigned()
        .notNullable()
        .references("t_coupon.id");
      table
        .integer("service_id")
        .unsigned()
        .notNullable()
        .references("t_service.id");
      table.timestamps(false, true);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("t_coupon_detail");
  await knex.schema.dropTableIfExists("t_coupon");
  await knex.schema.dropTableIfExists("t_shop_setting");
  await knex.schema.dropTableIfExists("t_event");
  await knex.schema.dropTableIfExists("t_service_booking");
  await knex.schema.dropTableIfExists("t_special_rest");
  await knex.schema.dropTableIfExists("t_rest");
  await knex.schema.dropTableIfExists("t_shop_working_hr");
  await knex.schema.dropTableIfExists("t_service_provider");
  await knex.schema.dropTableIfExists("t_provider_working_hr");
  await knex.schema.dropTableIfExists("t_service");
  await knex.schema.dropTableIfExists("t_service_type");
  await knex.schema.dropTableIfExists("t_user");
}
