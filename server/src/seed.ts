import { push } from "@beenotung/tslib";
import { DAY } from "@beenotung/tslib/time";
import { db } from "./db";
import { env } from "./env";
import { strToTime } from "./format";
import { hashPasswordSync } from "./hash";
import { proxy } from "./proxy";

function main() {
  console.log("seed start");

  // reset the database
  proxy.t_notice.length = 0; //TODO
  proxy.t_remind_booking.length = 0; // TODO
  proxy.t_payment.length = 0; //finished
  proxy.t_order_part.length = 0; //finished
  proxy.t_addon_order.length = 0; //finished
  proxy.t_shopping_order.length = 0; //finished
  proxy.t_coupon_product.length = 0; //finished
  proxy.t_addon_product.length = 0; //finished
  proxy.t_product.length = 0; //finished
  proxy.t_product_type.length = 0; //finished
  proxy.t_provider_working_hr.length = 0; //finished
  proxy.t_coupon_service.length = 0; //finished
  proxy.t_addon_service.length = 0; //finished
  proxy.t_addon_booking.length = 0; //finished
  proxy.t_service_booking.length = 0; //finished
  proxy.t_coupon.length = 0; //finished
  proxy.t_shop_setting.length = 0; //finished
  proxy.t_event.length = 0; //finished
  proxy.t_special_rest.length = 0; //finished
  proxy.t_shop_working_hr.length = 0; //finished
  proxy.t_service_provider.length = 0; //finished
  proxy.t_user_plan.length = 0; //finished
  proxy.t_plan.length = 0; //finished
  proxy.t_service.length = 0; //finished
  proxy.t_service_type.length = 0; //finished
  proxy.t_user.length = 0; //finished

  db.run("delete from sqlite_sequence");

  // sample t_shop_setting
  proxy.t_shop_setting[1] = {
    ppl_max: 1,
    break_unit: 1,
    rest_remark: "Mon-Fri 12nn-1pm lunch break",
    remind_booking_interval: 60 * DAY,
    allow_cancel_booking_time: 2 * DAY,
  };

  // sample t_user
  let super_admin = proxy.t_user.push({
    username: "super_admin",
    password_hash: hashPasswordSync("super_admin_Pa33word"),
    email: "super_staff@mailinator.com",
    role: "super_admin",
    is_vip: false,
    phone: "90000000",
    pic: null,
    delete_time: null,
    original_email: null,
    color: "#6495ED",
  });
  let admin1 = proxy.t_user.push({
    username: "JackS0nville21",
    password_hash: hashPasswordSync("Pa33word"),
    email: "staff1@mailinator.com",
    role: "admin",
    is_vip: false,
    phone: "90000001",
    pic: null,
    delete_time: null,
    original_email: null,
    color: "#CCCCFF",
  });
  let admin2 = proxy.t_user.push({
    username: "C4rolynSpr1ngs",
    password_hash: hashPasswordSync("Pa33word"),
    email: "staff2@mailinator.com",
    role: "admin",
    is_vip: false,
    phone: "90000002",
    pic: null,
    delete_time: null,
    original_email: null,
    color: "#DE3163",
  });
  let admin3 = proxy.t_user.push({
    username: "M1chaelBlu3Sky",
    password_hash: hashPasswordSync("Pa33word"),
    email: "staff3@mailinator.com",
    role: "admin",
    is_vip: false,
    phone: "90000003",
    pic: null,
    delete_time: null,
    original_email: null,
    color: "#DE3163",
  });
  let email_admin = proxy.t_user.push({
    username: "elsatam",
    password_hash: hashPasswordSync("Pa33word"),
    email: "elsa1994elsatam@gmail.com",
    role: "admin",
    is_vip: false,
    phone: "90000004",
    pic: null,
    delete_time: null,
    original_email: null,
    color: "#9FE2BF",
  });

  let staff1 = proxy.t_user.push({
    username: "Samanth4Sm1th",
    password_hash: hashPasswordSync("Pa33word"),
    email: "consultant1@mailinator.com",
    role: "service_provider",
    is_vip: false,
    phone: "90000007",
    pic: "service_provider_girl_1.jpg",
    delete_time: null,
    original_email: null,
    color: "#FF7F50",
  });
  let staff2 = proxy.t_user.push({
    username: "D3v1nGr33nMeadow",
    password_hash: hashPasswordSync("Pa33word"),
    email: "consultant2@mailinator.com",
    role: "service_provider",
    is_vip: false,
    phone: "90000008",
    pic: "service_provider_girl_2.jpg",
    delete_time: null,
    original_email: null,
    color: "#a5b3b6",
  });
  let staff3 = proxy.t_user.push({
    username: "J0nathanW1nterP4rk",
    password_hash: hashPasswordSync("administrationSupport2"),
    email: "support2@mailinator.cm",
    role: "service_provider",
    is_vip: false,
    phone: "90000010",
    pic: "service_provider_girl_3.jpg",
    delete_time: null,
    original_email: null,
    color: "#734439",
  });
  let consumer = proxy.t_user.push({
    username: "V1ctor14nRose",
    password_hash: hashPasswordSync("Pa33word"),
    email: "consumer@mailinator.com",
    role: "consumer",
    is_vip: false,
    phone: "90000611",
    pic: null,
    delete_time: null,
    original_email: null,
    color: null,
  });
  let consumer2 = proxy.t_user.push({
    username: "Oliv3rS1lverL4ke",
    password_hash: hashPasswordSync("Pa33word"),
    email: "Ada@mailinator.com",
    role: "consumer",
    is_vip: false,
    phone: "90000612",
    pic: null,
    delete_time: null,
    original_email: null,
    color: null,
  });
  let vip = proxy.t_user.push({
    username: "Am3liaSunsh1neVall3y",
    password_hash: hashPasswordSync("Pa33word"),
    email: "vip@mailinator.com",
    role: "consumer",
    is_vip: true,
    phone: "90000613",
    pic: null,
    delete_time: null,
    original_email: null,
    color: null,
  });
  let vip2 = proxy.t_user.push({
    username: "Nath4n13lD4rkl0rd",
    password_hash: hashPasswordSync("Pa33word"),
    email: "vip_Alice@mailinator.com",
    role: "consumer",
    is_vip: true,
    phone: "90000614",
    pic: null,
    delete_time: null,
    original_email: null,
    color: null,
  });
  let old_customer = proxy.t_user.push({
    username: "mike456",
    password_hash: hashPasswordSync("Pa33word"),
    email: "customer_eddie@mailinator.com",
    role: "consumer",
    is_vip: true,
    phone: "90000615",
    pic: null,
    delete_time: null,
    original_email: null,
    color: null,
  });

  // service provider sample data
  proxy.t_provider_working_hr.push({
    provider_id: staff1,
    week_day: 0,
    from_time: "12:00:00",
    to_time: "22:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff1,
    week_day: 1,
    from_time: "12:00:00",
    to_time: "22:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff1,
    week_day: 2,
    from_time: "12:00:00",
    to_time: "22:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff1,
    week_day: 3,
    from_time: "12:00:00",
    to_time: "22:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff1,
    week_day: 4,
    from_time: "12:00:00",
    to_time: "22:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff1,
    week_day: 5,
    from_time: "12:00:00",
    to_time: "22:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff1,
    week_day: 6,
    from_time: "12:00:00",
    to_time: "22:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff2,
    week_day: 0,
    from_time: "12:00:00",
    to_time: "22:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff2,
    week_day: 1,
    from_time: "12:00:00",
    to_time: "18:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff2,
    week_day: 2,
    from_time: "12:00:00",
    to_time: "17:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff2,
    week_day: 3,
    from_time: "12:00:00",
    to_time: "18:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff2,
    week_day: 4,
    from_time: "12:00:00",
    to_time: "17:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff2,
    week_day: 5,
    from_time: "12:00:00",
    to_time: "18:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff2,
    week_day: 6,
    from_time: "12:00:00",
    to_time: "17:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff3,
    week_day: 0,
    from_time: "12:00:00",
    to_time: "18:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff3,
    week_day: 1,
    from_time: "12:00:00",
    to_time: "18:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff3,
    week_day: 2,
    from_time: "18:00:00",
    to_time: "22:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff3,
    week_day: 3,
    from_time: "18:00:00",
    to_time: "22:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff3,
    week_day: 4,
    from_time: "18:00:00",
    to_time: "22:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff3,
    week_day: 5,
    from_time: "18:00:00",
    to_time: "22:00:00",
  });
  proxy.t_provider_working_hr.push({
    provider_id: staff3,
    week_day: 6,
    from_time: "18:00:00",
    to_time: "22:00:00",
  });

  // sample t_service_type
  let clean_service_type_id = proxy.t_service_type.push({
    name: "Cleaning Service",
  });
  let general_service_type_id = proxy.t_service_type.push({
    name: "General Service",
  });
  let cook_service_type_id = proxy.t_service_type.push({
    name: "Cooking Service",
  });

  // sample t_service
  let clean_service_1_id = proxy.t_service.push({
    type_id: clean_service_type_id,
    name: "Table Cleaning",
    quota: 1,
    pic: "clean-service.jpg",
    duration: 45,
    price: 300,
    is_vip: false,
  });
  let clean_service_2_id = proxy.t_service.push({
    type_id: clean_service_type_id,
    name: "Wash Dishes",
    quota: 1,
    pic: "clean-service.jpg",
    duration: 60,
    price: 450,
    is_vip: false,
  });

  let order_service_id = proxy.t_service.push({
    type_id: general_service_type_id,
    name: "Food Ordering",
    quota: 2,
    pic: "order-service.jpg",
    duration: 120,
    price: 50,
    is_vip: false,
  });
  let serving_service_id = proxy.t_service.push({
    type_id: general_service_type_id,
    name: "Serving",
    quota: 2,
    pic: "restaurant-2.jpg",
    duration: 120,
    price: 1300,
    is_vip: false,
  });

  let checkout_service_id = proxy.t_service.push({
    type_id: general_service_type_id,
    name: "Checkout",
    quota: 5,
    pic: "restaurant-1.jpg",
    duration: 45,
    price: 600,
    is_vip: false,
  });
  let cooking_service_1_id = proxy.t_service.push({
    type_id: cook_service_type_id,
    name: "Chinese Food Cooking",
    quota: 5,
    pic: "cook-service.jpg",
    duration: 45,
    price: 800,
    is_vip: false,
  });
  let cooking_service_2_id = proxy.t_service.push({
    type_id: cook_service_type_id,
    name: "Western Food Cooking",
    quota: 3,
    pic: "cook-service.jpg",
    duration: 60,
    price: 1400,
    is_vip: true,
  });

  // sample t_service_provider
  // sample data of which provider providing which services
  proxy.t_service_provider.push({
    provider_id: staff1,
    service_id: clean_service_1_id,
    booking_max: 2,
  });
  proxy.t_service_provider.push({
    provider_id: staff1,
    service_id: clean_service_2_id,
    booking_max: 5,
  });
  proxy.t_service_provider.push({
    provider_id: staff1,
    service_id: order_service_id,
    booking_max: 3,
  });
  proxy.t_service_provider.push({
    provider_id: staff1,
    service_id: cooking_service_1_id,
    booking_max: 1,
  });
  proxy.t_service_provider.push({
    provider_id: staff1,
    service_id: cooking_service_2_id,
    booking_max: 2,
  });
  proxy.t_service_provider.push({
    provider_id: staff1,
    service_id: serving_service_id,
    booking_max: 2,
  });
  proxy.t_service_provider.push({
    provider_id: staff1,
    service_id: checkout_service_id,
    booking_max: 2,
  });
  proxy.t_service_provider.push({
    provider_id: staff2,
    service_id: clean_service_1_id,
    booking_max: 2,
  });
  proxy.t_service_provider.push({
    provider_id: staff2,
    service_id: clean_service_2_id,
    booking_max: 5,
  });
  proxy.t_service_provider.push({
    provider_id: staff2,
    service_id: order_service_id,
    booking_max: 3,
  });
  proxy.t_service_provider.push({
    provider_id: staff2,
    service_id: cooking_service_1_id,
    booking_max: 1,
  });
  proxy.t_service_provider.push({
    provider_id: staff2,
    service_id: cooking_service_2_id,
    booking_max: 2,
  });
  proxy.t_service_provider.push({
    provider_id: staff2,
    service_id: serving_service_id,
    booking_max: 2,
  });
  proxy.t_service_provider.push({
    provider_id: staff2,
    service_id: checkout_service_id,
    booking_max: 2,
  });
  proxy.t_service_provider.push({
    provider_id: staff3,
    service_id: clean_service_1_id,
    booking_max: 2,
  });
  proxy.t_service_provider.push({
    provider_id: staff3,
    service_id: clean_service_2_id,
    booking_max: 5,
  });
  proxy.t_service_provider.push({
    provider_id: staff3,
    service_id: order_service_id,
    booking_max: 3,
  });
  proxy.t_service_provider.push({
    provider_id: staff3,
    service_id: cooking_service_1_id,
    booking_max: 1,
  });
  proxy.t_service_provider.push({
    provider_id: staff3,
    service_id: cooking_service_2_id,
    booking_max: 2,
  });
  proxy.t_service_provider.push({
    provider_id: staff3,
    service_id: serving_service_id,
    booking_max: 2,
  });
  proxy.t_service_provider.push({
    provider_id: staff3,
    service_id: checkout_service_id,
    booking_max: 2,
  });

  // sample t_shop_working_hr
  proxy.t_shop_working_hr.push({
    week_day: 0,
    from_time: "12:00:00",
    to_time: "23:00:00",
  });
  proxy.t_shop_working_hr.push({
    week_day: 1,
    from_time: "12:00:00",
    to_time: "23:00:00",
  });
  proxy.t_shop_working_hr.push({
    week_day: 2,
    from_time: "12:00:00",
    to_time: "23:00:00",
  });
  proxy.t_shop_working_hr.push({
    week_day: 3,
    from_time: "12:00:00",
    to_time: "23:00:00",
  });
  proxy.t_shop_working_hr.push({
    week_day: 4,
    from_time: "12:00:00",
    to_time: "23:00:00",
  });
  proxy.t_shop_working_hr.push({
    week_day: 5,
    from_time: "12:00:00",
    to_time: "23:00:00",
  });
  proxy.t_shop_working_hr.push({
    week_day: 6,
    from_time: "12:00:00",
    to_time: "23:00:00",
  });

  // sample t_special_rest
  proxy.t_special_rest.push({
    remark: "餐廳休息日",
    from_time: strToTime("2023-09-08 15:30:00"),
    to_time: strToTime("2023-09-08 23:00:00"),
  });
  proxy.t_special_rest.push({
    remark: "季節性休假",
    from_time: strToTime("2023-09-08 09:30:00"),
    to_time: strToTime("2023-09-08 18:30:00"),
  });
  proxy.t_special_rest.push({
    remark: "Regular Special Rest",
    from_time: strToTime("2023-09-10 08:30:00"),
    to_time: strToTime("2023-09-11 18:30:00"),
  });

  // TODO testing slot
  proxy.t_service_booking.push({
    user_id: old_customer,
    service_id: clean_service_1_id,
    provider_id: staff1,
    promo_code_id: null,
    from_time: strToTime("2023-05-11 17:30:00"),
    to_time: strToTime("2023-05-11 18:00:00"),
    booking_submit_time: strToTime("2023-05-03 10:00:00"),
    booking_accept_time: strToTime("2023-05-03 13:02:05"),
    booking_reject_time: null,
    booking_cancel_time: null,
    paid_deposit_time: strToTime("2023-05-03 10:01:00"),
    paid_fully_time: strToTime("2023-05-03 10:02:00"),
    deposit_amount: 200,
    full_pay_amount: 100,
    full_pay_deadline: strToTime("2023-05-06 13:00:00"),
    deposit_deadline: strToTime("2023-05-05 13:00:00"),
    arrive_time: strToTime("2023-05-11 17:30:00"),
    leave_time: strToTime("2023-05-11 18:00:00"),
    refund_submit_time: null,
    refund_accept_time: null,
    refund_reject_time: null,
    refund_finish_time: null,
    user_plan_id: null,
    remark: null,
  });
  proxy.t_service_booking.push({
    user_id: consumer,
    service_id: cooking_service_1_id,
    provider_id: staff1,
    promo_code_id: null,
    from_time: strToTime("2023-07-23 19:30:00"),
    to_time: strToTime("2023-07-23 20:30:00"),
    booking_submit_time: strToTime("2023-06-20 10:00:00"),
    booking_accept_time: strToTime("2023-06-22 13:00:00"),
    booking_reject_time: null,
    booking_cancel_time: null,
    paid_deposit_time: null,
    paid_fully_time: null,
    deposit_amount: 200,
    full_pay_amount: 0,
    full_pay_deadline: null,
    deposit_deadline: strToTime("2023-06-22 13:00:00"),
    arrive_time: null,
    leave_time: null,
    refund_submit_time: null,
    refund_accept_time: null,
    refund_reject_time: null,
    refund_finish_time: null,
    user_plan_id: null,
    remark: null,
  });
  proxy.t_service_booking.push({
    user_id: consumer,
    service_id: cooking_service_1_id,
    provider_id: staff1,
    promo_code_id: null,
    from_time: strToTime("2023-07-02 19:30:00"),
    to_time: strToTime("2023-07-02 20:30:00"),
    booking_submit_time: strToTime("2023-06-20 10:00:00"),
    booking_accept_time: strToTime("2023-06-22 13:00:00"),
    booking_reject_time: null,
    booking_cancel_time: null,
    paid_deposit_time: strToTime("2023-06-22 13:00:00"),
    paid_fully_time: strToTime("2023-06-25 13:00:00"),
    deposit_amount: 200,
    full_pay_amount: 100,
    full_pay_deadline: strToTime("2023-06-25 13:00:00"),
    deposit_deadline: strToTime("2023-06-22 13:00:00"),
    arrive_time: strToTime("2023-07-02 19:30:00"),
    leave_time: strToTime("2023-07-02 20:30:00"),
    refund_submit_time: null,
    refund_accept_time: null,
    refund_reject_time: null,
    refund_finish_time: null,
    user_plan_id: null,
    remark: null,
  });
  proxy.t_service_booking.push({
    user_id: consumer,
    service_id: order_service_id,
    provider_id: staff1,
    promo_code_id: null,
    from_time: strToTime("2023-07-29 12:00:00"),
    to_time: strToTime("2023-07-29 16:00:00"),
    booking_submit_time: strToTime("2023-06-25 10:00:00"),
    booking_accept_time: null,
    booking_reject_time: strToTime("2023-06-26 13:00:00"),
    booking_cancel_time: null,
    paid_deposit_time: null,
    paid_fully_time: null,
    deposit_amount: 100,
    full_pay_amount: 0,
    full_pay_deadline: null,
    deposit_deadline: strToTime("2023-06-22 13:00:00"),
    arrive_time: null,
    leave_time: null,
    refund_submit_time: null,
    refund_accept_time: null,
    refund_reject_time: null,
    refund_finish_time: null,
    user_plan_id: null,
    remark: "client wrongly submitted the time",
  });
  proxy.t_service_booking.push({
    user_id: consumer,
    service_id: clean_service_2_id,
    provider_id: staff1,
    promo_code_id: null,
    from_time: strToTime("2023-07-29 12:00:00"),
    to_time: strToTime("2023-07-29 16:00:00"),
    booking_submit_time: strToTime("2023-05-25 10:00:00"),
    booking_accept_time: null,
    booking_reject_time: strToTime("2023-05-26 13:00:00"),
    booking_cancel_time: null,
    paid_deposit_time: null,
    paid_fully_time: null,
    deposit_amount: 100,
    full_pay_amount: 0,
    full_pay_deadline: null,
    deposit_deadline: strToTime("2023-05-22 13:00:00"),
    arrive_time: null,
    leave_time: null,
    refund_submit_time: null,
    refund_accept_time: null,
    refund_reject_time: null,
    refund_finish_time: null,
    user_plan_id: null,
    remark: "client wrongly submitted the booking item",
  });
  proxy.t_service_booking.push({
    user_id: consumer2,
    service_id: cooking_service_1_id,
    provider_id: staff1,
    promo_code_id: null,
    from_time: strToTime("2023-07-23 12:00:00"),
    to_time: strToTime("2023-07-23 16:00:00"),
    booking_submit_time: strToTime("2023-05-20 10:00:00"),
    booking_accept_time: strToTime("2023-05-20 13:00:00"),
    booking_reject_time: null,
    booking_cancel_time: null,
    paid_deposit_time: null,
    paid_fully_time: strToTime("2023-05-25 10:00:00"),
    deposit_amount: 0,
    full_pay_amount: 0,
    full_pay_deadline: null,
    deposit_deadline: null,
    arrive_time: null,
    leave_time: null,
    refund_submit_time: null,
    refund_accept_time: null,
    refund_reject_time: null,
    refund_finish_time: null,
    user_plan_id: null,
    remark: null,
  });
  proxy.t_service_booking.push({
    user_id: consumer2,
    service_id: cooking_service_1_id,
    provider_id: staff1,
    promo_code_id: null,
    from_time: strToTime("2023-07-29 12:00:00"),
    to_time: strToTime("2023-07-29 16:00:00"),
    booking_submit_time: strToTime("2023-07-25 10:00:00"),
    booking_accept_time: null,
    booking_reject_time: null,
    booking_cancel_time: null,
    paid_deposit_time: null,
    paid_fully_time: null,
    deposit_amount: 0,
    full_pay_amount: 0,
    arrive_time: null,
    full_pay_deadline: null,
    deposit_deadline: null,
    leave_time: null,
    refund_submit_time: null,
    refund_accept_time: null,
    refund_reject_time: null,
    refund_finish_time: null,
    user_plan_id: null,
    remark: null,
  });

  // sample t_event
  proxy.t_event.push({
    name: "海鮮美食節",
    remark: "2023-08-30",
    quota: 10,
    cancel_time: null,
  });
  proxy.t_event.push({
    name: "廚師特輯",
    remark: "2023-07-30",
    quota: 60,
    cancel_time: null,
  });
  proxy.t_event.push({
    name: "漢堡比賽",
    remark: "2023-08-15",
    quota: 30,
    cancel_time: null,
  });

  // sample t_coupon
  let shopping_coupon1 = proxy.t_coupon.push({
    coupon_code: "food-1",
    discount_amount: 99,
    expired_time: strToTime("2023-07-08 04:30:00"),
    is_any_product: true,
    is_any_service: false,
    is_vip_only: false,
    quota: 10,
  });
  proxy.t_coupon.push({
    coupon_code: "food-2",
    discount_amount: 89,
    expired_time: strToTime("2023-07-08 04:30:00"),
    is_any_product: true,
    is_any_service: false,
    is_vip_only: false,
    quota: 10,
  });
  let checkout_service_coupon_id = proxy.t_coupon.push({
    coupon_code: "coupon70",
    discount_amount: 70,
    expired_time: strToTime("2023-07-10 04:30:00"),
    is_any_product: false,
    is_any_service: false,
    is_vip_only: false,
    quota: 10,
  });
  let all_service_coupon_id = proxy.t_coupon.push({
    coupon_code: "coupon200",
    discount_amount: 200,
    expired_time: strToTime("2024-12-01 04:30:00"),
    is_any_product: false,
    is_any_service: false,
    is_vip_only: false,
    quota: 10,
  });
  let vip_coupon_id = proxy.t_coupon.push({
    coupon_code: "Special VIP",
    discount_amount: 100,
    expired_time: strToTime("2024-12-01 04:30:00"),
    is_any_product: false,
    is_any_service: false,
    is_vip_only: true,
    quota: 10,
  });

  // sample t_coupon_detail
  proxy.t_coupon_service.push({
    coupon_id: checkout_service_coupon_id,
    service_id: checkout_service_id,
  });
  proxy.t_coupon_service.push({
    coupon_id: all_service_coupon_id,
    service_id: cooking_service_2_id,
  });
  proxy.t_coupon_service.push({
    coupon_id: all_service_coupon_id,
    service_id: order_service_id,
  });

  // sample t_service_booking
  let booking1_id = proxy.t_service_booking.push({
    user_id: vip,
    service_id: clean_service_1_id,
    provider_id: staff1,
    promo_code_id: checkout_service_coupon_id,
    from_time: strToTime("2023-05-20 14:00:00"),
    to_time: strToTime("2023-05-20 15:00:00"),
    booking_submit_time: strToTime("2023-05-18 13:00:00"),
    booking_accept_time: null,
    booking_reject_time: null,
    booking_cancel_time: null,
    paid_deposit_time: null,
    paid_fully_time: null,
    deposit_amount: 0,
    full_pay_amount: 0,
    full_pay_deadline: null,
    deposit_deadline: null,
    arrive_time: null,
    leave_time: null,
    refund_submit_time: null,
    refund_accept_time: null,
    refund_reject_time: null,
    refund_finish_time: null,
    user_plan_id: null,
    remark: null,
  });
  let booking2_id = proxy.t_service_booking.push({
    user_id: consumer,
    service_id: checkout_service_id,
    provider_id: staff1,
    promo_code_id: all_service_coupon_id,
    from_time: strToTime("2023-05-23 14:00:00"),
    to_time: strToTime("2023-05-23 15:00:00"),
    booking_submit_time: strToTime("2023-05-20 13:00:00"),
    booking_accept_time: null,
    booking_reject_time: null,
    booking_cancel_time: strToTime("2023-05-20 13:00:00"),
    paid_deposit_time: null,
    paid_fully_time: null,
    deposit_amount: 0,
    full_pay_amount: 0,
    full_pay_deadline: null,
    deposit_deadline: null,
    arrive_time: null,
    leave_time: null,
    refund_submit_time: null,
    refund_accept_time: null,
    refund_reject_time: null,
    refund_finish_time: null,
    user_plan_id: null,
    remark: null,
  });
  proxy.t_service_booking.push({
    user_id: vip2,
    service_id: clean_service_1_id,
    provider_id: staff1,
    promo_code_id: null,
    from_time: strToTime("2023-05-20 14:00:00"),
    to_time: strToTime("2023-05-20 15:00:00"),
    booking_submit_time: strToTime("2023-05-18 13:00:00"),
    booking_accept_time: strToTime("2023-05-18 13:00:00"),
    booking_reject_time: null,
    booking_cancel_time: null,
    paid_deposit_time: null,
    paid_fully_time: strToTime("2023-05-20 13:00:00"),
    deposit_amount: 0,
    full_pay_amount: 0,
    full_pay_deadline: null,
    deposit_deadline: null,
    arrive_time: null,
    leave_time: null,
    refund_submit_time: strToTime("2023-05-30 10:00:00"),
    refund_accept_time: null,
    refund_reject_time: null,
    refund_finish_time: null,
    user_plan_id: null,
    remark: null,
  });
  proxy.t_service_booking.push({
    user_id: vip,
    service_id: checkout_service_id,
    provider_id: staff1,
    promo_code_id: null,
    from_time: strToTime("2023-05-23 14:00:00"),
    to_time: strToTime("2023-05-23 15:00:00"),
    booking_submit_time: strToTime("2023-05-20 13:00:00"),
    booking_accept_time: strToTime("2023-05-20 13:00:00"),
    booking_reject_time: null,
    booking_cancel_time: null,
    paid_deposit_time: strToTime("2023-05-24 10:00:00"),
    paid_fully_time: null,
    deposit_amount: 0,
    full_pay_amount: 0,
    full_pay_deadline: null,
    deposit_deadline: null,
    arrive_time: null,
    leave_time: null,
    refund_submit_time: strToTime("2023-05-25 13:00:00"),
    refund_accept_time: null,
    refund_reject_time: null,
    refund_finish_time: null,
    user_plan_id: null,
    remark: null,
  });
  proxy.t_service_booking.push({
    user_id: vip2,
    service_id: checkout_service_id,
    provider_id: staff1,
    promo_code_id: null,
    from_time: strToTime("2023-05-23 14:00:00"),
    to_time: strToTime("2023-05-23 15:00:00"),
    booking_submit_time: strToTime("2023-05-20 13:00:00"),
    booking_accept_time: strToTime("2023-05-20 13:00:00"),
    booking_reject_time: null,
    booking_cancel_time: null,
    paid_deposit_time: strToTime("2023-05-30 10:00:00"),
    paid_fully_time: null,
    deposit_amount: 0,
    full_pay_amount: 0,
    full_pay_deadline: null,
    deposit_deadline: null,
    arrive_time: null,
    leave_time: null,
    refund_submit_time: null,
    refund_accept_time: null,
    refund_reject_time: null,
    refund_finish_time: null,
    user_plan_id: null,
    remark: null,
  });

  // sample t_plan
  let plan1 = proxy.t_plan.push({
    service_id: null,
    service_type_id: clean_service_type_id,
    weekly_quota: 3,
    quota: 9,
    expire_month: 2,
    desc: "Join this plan to get the 10% discount",
    title: "Special Offer",
    price: 500,
    cancel_time: null,
  });
  let plan2 = proxy.t_plan.push({
    service_id: order_service_id,
    service_type_id: null,
    weekly_quota: 7,
    quota: 10,
    expire_month: 6,
    desc: "Limited offer only for this christmas period",
    title: "Limited Package with $888 only!",
    price: 888,
    cancel_time: null,
  });

  // sample t_user_plan
  let user_plan1 = proxy.t_user_plan.push({
    user_id: consumer,
    plan_id: plan2,
    expire_time: 3,
    payment_time: strToTime("2022-12-01 04:30:00"),
  });
  let user_plan2 = proxy.t_user_plan.push({
    user_id: consumer,
    plan_id: plan1,
    expire_time: 1,
    payment_time: strToTime("2022-12-01 04:30:00"),
  });
  let user_plan3 = proxy.t_user_plan.push({
    user_id: vip,
    plan_id: plan1,
    expire_time: 1,
    payment_time: strToTime("2022-12-01 04:30:00"),
  });
  let user_plan4 = proxy.t_user_plan.push({
    user_id: vip2,
    plan_id: plan1,
    expire_time: 1,
    payment_time: strToTime("2022-12-01 04:30:00"),
  });

  // sample t_product_type
  let chinese_food_product_type_id = proxy.t_product_type.push({
    type: "Chinese Food",
  });
  let western_food_product_type_id = proxy.t_product_type.push({
    type: "Western Food",
  });
  let membership_product_type_id = proxy.t_product_type.push({
    type: "VIP membership",
  });

  // sample t_product
  let chinese_food_product_1 = proxy.t_product.push({
    type_id: chinese_food_product_type_id,
    name: "糖醋排骨",
    desc: "糖醋口味的炸豬排, 帶有酸甜風味",
    pic: "food-3.jpg",
    price: 599,
    is_vip: false,
  });
  let western_food_product_1 = proxy.t_product.push({
    type_id: western_food_product_type_id,
    name: "香煎牛柳配蘑菇醬",
    desc: "經典的西式牛排烹調方式與中國蘑菇醬的配搭",
    pic: "food-2.jpg",
    price: 99,
    is_vip: false,
  });
  let western_food_product_2 = proxy.t_product.push({
    type_id: western_food_product_type_id,
    name: "法式奶油蛋糕",
    desc: "香甜的奶油蛋糕, 常與水果或醬汁搭配",
    pic: "food-1.jpg",
    price: 199,
    is_vip: false,
  });
  let chinese_food_product_2 = proxy.t_product.push({
    type_id: chinese_food_product_type_id,
    name: "麻婆豆腐",
    desc: "辣味的豆腐炒菜醬, 搭配蔥花和豆瓣醬",
    pic: "food-1.jpg",
    price: 249,
    is_vip: false,
  });
  let vip_membership_product6 = proxy.t_product.push({
    type_id: membership_product_type_id,
    name: "VIP Membership",
    desc: "Add to cart to unlock more special offer and coupon!",
    pic: "vip_card.jpg",
    price: 200,
    is_vip: true,
  });

  // sample t_coupon_product
  proxy.t_coupon_product.push({
    coupon_id: vip_coupon_id,
    product_id: chinese_food_product_1,
  });
  proxy.t_coupon_product.push({
    coupon_id: vip_coupon_id,
    product_id: western_food_product_2,
  });

  //sample t_addon_service
  proxy.t_addon_service.push({
    from_service_id: clean_service_1_id,
    to_service_id: clean_service_2_id,
  });
  proxy.t_addon_service.push({
    from_service_id: clean_service_2_id,
    to_service_id: clean_service_1_id,
  });
  proxy.t_addon_service.push({
    from_service_id: order_service_id,
    to_service_id: clean_service_2_id,
  });
  proxy.t_addon_service.push({
    from_service_id: clean_service_2_id,
    to_service_id: order_service_id,
  });
  proxy.t_addon_service.push({
    from_service_id: order_service_id,
    to_service_id: serving_service_id,
  });
  proxy.t_addon_service.push({
    from_service_id: serving_service_id,
    to_service_id: order_service_id,
  });
  proxy.t_addon_service.push({
    from_service_id: cooking_service_2_id,
    to_service_id: cooking_service_1_id,
  });
  proxy.t_addon_service.push({
    from_service_id: cooking_service_1_id,
    to_service_id: cooking_service_2_id,
  });

  // sample t_addon_booking
  proxy.t_addon_booking.push({
    service_id: clean_service_1_id,
    booking_id: booking2_id,
  });

  // sample t_shopping_order
  let shopping_order1 = proxy.t_shopping_order.push({
    user_id: consumer,
    promo_code_id: shopping_coupon1,
    checkout_time: strToTime("2023-03-08 15:30:00"),
    full_pay_time: null,
    full_pay_amount: null,
    full_pay_deadline: null,
    deposit_time: null,
    deposit_amount: 200,
    deposit_deadline: strToTime("2023-05-20 18:00:00"),
  });
  let shopping_order2 = proxy.t_shopping_order.push({
    user_id: consumer,
    promo_code_id: checkout_service_coupon_id,
    checkout_time: null,
    full_pay_time: null,
    full_pay_amount: null,
    full_pay_deadline: null,
    deposit_time: null,
    deposit_amount: null,
    deposit_deadline: null,
  });
  let shopping_order3 = proxy.t_shopping_order.push({
    user_id: vip2,
    promo_code_id: checkout_service_coupon_id,
    checkout_time: strToTime("2023-03-08 15:30:00"),
    full_pay_time: null,
    full_pay_amount: null,
    full_pay_deadline: null,
    deposit_time: null,
    deposit_amount: null,
    deposit_deadline: null,
  });
  let shopping_order4 = proxy.t_shopping_order.push({
    user_id: vip2,
    promo_code_id: all_service_coupon_id,
    checkout_time: strToTime("2023-03-08 15:30:00"),
    full_pay_time: null,
    full_pay_amount: null,
    full_pay_deadline: null,
    deposit_time: null,
    deposit_amount: null,
    deposit_deadline: null,
  });
  let shopping_order5 = proxy.t_shopping_order.push({
    user_id: consumer2,
    promo_code_id: all_service_coupon_id,
    checkout_time: strToTime("2023-03-08 15:30:00"),
    full_pay_time: null,
    full_pay_amount: null,
    full_pay_deadline: null,
    deposit_time: null,
    deposit_amount: null,
    deposit_deadline: null,
  });
  let shopping_order6 = proxy.t_shopping_order.push({
    user_id: vip,
    promo_code_id: all_service_coupon_id,
    checkout_time: strToTime("2023-03-08 15:30:00"),
    full_pay_time: null,
    full_pay_amount: null,
    full_pay_deadline: null,
    deposit_time: null,
    deposit_amount: null,
    deposit_deadline: null,
  });
  let shopping_order7 = proxy.t_shopping_order.push({
    user_id: consumer,
    promo_code_id: null,
    checkout_time: strToTime("2023-03-08 15:30:00"),
    full_pay_time: null,
    full_pay_amount: null,
    full_pay_deadline: null,
    deposit_time: null,
    deposit_amount: null,
    deposit_deadline: null,
  });
  let shopping_order8 = proxy.t_shopping_order.push({
    user_id: consumer,
    promo_code_id: null,
    checkout_time: strToTime("2023-03-08 15:30:00"),
    full_pay_time: null,
    full_pay_amount: null,
    full_pay_deadline: null,
    deposit_time: strToTime("2023-03-09 15:30:00"),
    deposit_amount: 200,
    deposit_deadline: strToTime("2023-03-08 15:30:00"),
  });
  let shopping_order9 = proxy.t_shopping_order.push({
    user_id: consumer,
    promo_code_id: null,
    checkout_time: strToTime("2023-03-08 15:30:00"),
    full_pay_time: strToTime("2023-03-10 15:30:00"),
    full_pay_amount: 100,
    full_pay_deadline: strToTime("2023-03-11 15:30:00"),
    deposit_time: strToTime("2023-03-09 15:30:00"),
    deposit_amount: 49,
    deposit_deadline: strToTime("2023-03-11 15:30:00"),
  });
  let shopping_order10 = proxy.t_shopping_order.push({
    user_id: consumer,
    promo_code_id: null,
    checkout_time: strToTime("2023-03-08 15:30:00"),
    full_pay_time: strToTime("2023-03-05 15:30:00"),
    full_pay_amount: 149,
    full_pay_deadline: strToTime("2023-03-11 15:30:00"),
    deposit_time: null,
    deposit_amount: null,
    deposit_deadline: null,
  });

  // sample t_addon_product
  proxy.t_addon_product.push({
    from_product_id: chinese_food_product_1,
    to_product_id: western_food_product_2,
  });
  proxy.t_addon_product.push({
    from_product_id: western_food_product_2,
    to_product_id: chinese_food_product_1,
  });
  proxy.t_addon_product.push({
    from_product_id: western_food_product_1,
    to_product_id: western_food_product_2,
  });
  proxy.t_addon_product.push({
    from_product_id: western_food_product_2,
    to_product_id: western_food_product_1,
  });
  proxy.t_addon_product.push({
    from_product_id: chinese_food_product_2,
    to_product_id: western_food_product_2,
  });
  proxy.t_addon_product.push({
    from_product_id: western_food_product_2,
    to_product_id: chinese_food_product_2,
  });

  // sample t_addon_order
  proxy.t_addon_order.push({
    product_id: western_food_product_2,
    shopping_order_id: shopping_order1,
  });
  proxy.t_addon_order.push({
    product_id: chinese_food_product_1,
    shopping_order_id: shopping_order2,
  });

  // sample t_order_part
  proxy.t_order_part.push({
    product_id: chinese_food_product_1,
    order_id: shopping_order1,
  });
  proxy.t_order_part.push({
    product_id: chinese_food_product_1,
    order_id: shopping_order2,
  });
  proxy.t_order_part.push({
    product_id: western_food_product_2,
    order_id: shopping_order3,
  });
  proxy.t_order_part.push({
    product_id: western_food_product_1,
    order_id: shopping_order4,
  });
  proxy.t_order_part.push({
    product_id: western_food_product_1,
    order_id: shopping_order5,
  });
  proxy.t_order_part.push({
    product_id: chinese_food_product_2,
    order_id: shopping_order6,
  });
  proxy.t_order_part.push({
    product_id: chinese_food_product_1,
    order_id: shopping_order7,
  });
  proxy.t_order_part.push({
    product_id: chinese_food_product_2,
    order_id: shopping_order9,
  });
  proxy.t_order_part.push({
    product_id: chinese_food_product_2,
    order_id: shopping_order10,
  });

  // sample t_payment
  proxy.t_payment.push({
    remark: "as deposit",
    submit_time: strToTime("2023-03-18 15:30:00"),
    filename: "payme_qrcode.png",
    accept_time: null,
    reject_time: null,
    order_id: shopping_order8,
    booking_id: null,
    method: "payme",
    amount: 12,
    stripe_id: null,
  });
  proxy.t_payment.push({
    remark: "as deposit",
    submit_time: strToTime("2023-03-18 15:30:00"),
    filename: "payme_qrcode.png",
    accept_time: null,
    reject_time: null,
    order_id: null,
    booking_id: booking1_id,
    method: "payme",
    amount: 13,
    stripe_id: null,
  });
  proxy.t_payment.push({
    remark: "as full pay",
    submit_time: strToTime("2023-03-18 15:30:00"),
    filename: "payme_qrcode.png",
    accept_time: strToTime("2023-03-20 15:30:00"),
    reject_time: null,
    order_id: null,
    booking_id: booking1_id,
    method: "payme",
    amount: 300,
    stripe_id: null,
  });
  proxy.t_payment.push({
    remark: "as deposit",
    submit_time: strToTime("2023-03-09 15:30:00"),
    filename: "payme_qrcode.png",
    accept_time: strToTime("2023-03-09 15:30:00"),
    reject_time: null,
    order_id: shopping_order9,
    booking_id: null,
    method: "payme",
    amount: 49,
    stripe_id: null,
  });
  proxy.t_payment.push({
    remark: "as full-pay",
    submit_time: strToTime("2023-03-10 15:30:00"),
    filename: "payme_qrcode.png",
    accept_time: strToTime("2023-03-10 15:30:00"),
    reject_time: null,
    order_id: shopping_order9,
    booking_id: null,
    method: "payme",
    amount: 100,
    stripe_id: null,
  });
  proxy.t_payment.push({
    remark: "as full-pay",
    submit_time: strToTime("2023-03-05 15:30:00"),
    filename: "payme_qrcode.png",
    accept_time: strToTime("2023-03-05 15:30:00"),
    reject_time: null,
    order_id: shopping_order10,
    booking_id: null,
    method: "payme",
    amount: 149,
    stripe_id: null,
  });

  // sample t_payment
  proxy.t_notice.push({
    title: "2023/6/22(週四) 休息1天",
    content: "端午節公眾假期, 2023/6/23(週五) 照常營業",
    publish_time: strToTime("2023-06-19 09:00:00"),
  });
  proxy.t_notice.push({
    title: "2023/7/18(週二) 休息1天",
    content: "東主有喜, 2023/7/19(週三) 照常營業",
    publish_time: strToTime("2023-07-06 09:00:00"),
  });

  //email editing
  //variables is copy from the email.ts
  let id = 0;
  proxy.t_email_template[++id] = {
    name_en: "overall structure",
    name_zh: "整體結構",

    variables: [
      "receiverName",
      "opening",
      "bookingSummary",
      "additional",
      "COMPANY_NAME",
      "COMPANY_PHONE",
      "EMAIL_ADDRESS",
    ].join(","),
    content: null,
    default_content: /* html */ `
Dear {receiverName},

{opening}

{bookingSummary}

{additional}

Best regards,<br>
<br>
{COMPANY_NAME}<br>
{COMPANY_PHONE}<br>
{EMAIL_ADDRESS}<br>

<p>
  P.S. This email is automatically generated by the system. Direct reply to this email may not be received.
</p>
`.trim(),
  };

  //email editing STEP 1
  //compared to email.ts variables (content)
  proxy.t_email_template[++id] = {
    name_en: "booking summary",
    name_zh: "電郵摘要",
    variables: [
      "dateText",
      "timeText",
      "service_name",
      "provider_username",
      "provider_phone",
      "customer_title",
      "client_username",
      "client_phone",
      "booking_detail_link",
    ].join(","),
    content: null,
    default_content: /* html */ `
<table>
  <tbody>
    <tr>
      <tr><td>Date: </td><td>{dateText}</td></tr>
      <tr><td>Time: </td><td>{timeText}</td></tr>
      <tr><td>Service: </td><td>{service_name}</td></tr>
      <tr><td>Service Provider: </td><td>{provider_username}</td></tr>
      <tr><td>Provider Phone: </td><td>{provider_phone}</td></tr>
      <tr><td>{customer_title} Name: </td><td>{client_username}</td></tr>
      <tr><td>Customer Phone: </td><td>{client_phone}</td></tr>
    </tr>
  </tbody>
</table>
<p>
  Booking Detail Page (to cancel): {booking_detail_link}
</p>
`.trim(),
  };
  proxy.t_email_template[++id] = {
    name_en: "(1) submit booking opening paragraph (notice to consumer)",
    name_zh: "(1) 提交預訂的開始段落（給消費者）",

    variables: [].join(","),
    content: null,
    default_content: /* html */ `
Thank you for submitting your appointment request with us.
We have successfully received your application and would like to inform you that it is currently under review.

Please find the details of the submitted appointment below:
`,
  };
  proxy.t_email_template[++id] = {
    name_en: "(1) submit booking additional paragraph (notice to consumer)",
    name_zh: "(1) 提交預訂的主文段落（給消費者）",

    variables: ["COMPANY_PHONE", "EMAIL_ADDRESS"].join(","),
    content: null,
    default_content: /* html */ `
Our team will work diligently to process your request as quickly as possible.
Once your appointment has been approved, we will send you a confirmation email containing the details of your scheduled appointment, including the date, time, and location.

We appreciate your patience during this time, and we look forward to providing you with the best service possible.
If you have any questions or concerns, please do not hesitate to reach out to our support team phone at {COMPANY_PHONE} or email at {EMAIL_ADDRESS}.

Thank you for choosing us, and we hope to see you soon!
`,
  };
  proxy.t_email_template[++id] = {
    name_en: "(2) accept booking opening paragraph (notice to consumer)",
    name_zh: "(2) 接受預訂的開始段落（給消費者）",
    variables: ["COMPANY_NAME"].join(","),
    content: null,
    default_content: /* html */ `
    Thank you for scheduling an appointment with us at {COMPANY_NAME}.

    We are delighted to confirm your booking as follows:
    `,
  };
  proxy.t_email_template[++id] = {
    name_en: "(2) accept booking additional paragraph (notice to consumer)",
    name_zh: "(2) 接受預訂的主文段落（給消費者）",

    variables: ["COMPANY_NAME", "COMPANY_PHONE", "EMAIL_ADDRESS"].join(","),
    content: null,
    default_content: /* html */ `
    Please arrive 10 minutes before your scheduled appointment to ensure a smooth check-in process.
    If you need to reschedule or cancel your appointment, kindly notify us at least 24 hours in advance by calling us at {COMPANY_PHONE} or by replying to {EMAIL_ADDRESS}.
    
    We understand that unforeseen circumstances may occur, but please be aware that appointments canceled or rescheduled without adequate notice may be subject to a cancellation fee.
    
    For your convenience, a map and directions to our location can be found [here – link to map].
    
    We look forward to serving you and providing the best experience possible.
    If you have any questions or special requests, please do not hesitate to contact us.
    
    Thank you for choosing {COMPANY_NAME}, and we'll see you soon!
    `,
  };
  proxy.t_email_template[++id] = {
    name_en: "(3) rescheduled booking opening paragraph (notice to consumer)",
    name_zh: "(3) 重新安排預訂的開始段落（給消費者）",

    variables: [].join(","),
    content: null,
    default_content: /* html */ `
    We hope this email finds you well.
    We are writing to inform you that your appointment originally scheduled has been rescheduled due to unforeseen circumstances.
    
    Please be advised that your new appointment is now scheduled as follows:
    `,
  };
  proxy.t_email_template[++id] = {
    name_en:
      "(3) rescheduled booking additional paragraph (notice to consumer)",
    name_zh: "(3) 重新安排預訂的主文段落（給消費者）",

    variables: ["COMPANY_PHONE", "EMAIL_ADDRESS"].join(","),
    content: null,
    default_content: /* html */ `
    We apologize for any inconvenience this change may cause and hope that the new date and time will work well with your schedule.

    In case the new appointment time does not suit your schedule, we encourage you to contact us as soon as possible so that we can work together to find a more suitable time.
    You can reach us via phone at {COMPANY_PHONE} or email at {EMAIL_ADDRESS} to discuss alternative arrangements.
    
    We appreciate your understanding and cooperation in this matter, and we look forward to providing you with excellent service at your rescheduled appointment.
    If you have any questions or concerns, please do not hesitate to get in touch with us.
    
    Thank you for your continued support.
    `,
  };

  /* ---------------------------- seed report data ---------------------------- */
  // const seedConsumerIdList = proxy.t_user.filter(
  //   (user) => user.role === "consumer"
  // );
  // const seedServiceId = proxy.t_service;
  // const seedProviderIdList = proxy.t_service_provider;
  // let seedMatchingProviderIdList;
  // const seedPromoCodeIdList = proxy.t_coupon;
  // let sampleBookingList = [];
  // for (let i = 0; i < 100; i++) {
  //   const user_id =
  //     seedConsumerIdList[Math.floor(Math.random() * seedConsumerIdList.length)]
  //       ?.id;
  //   const service_id =
  //     seedServiceId[Math.floor(Math.random() * seedServiceId.length)]?.id;
  //   if (
  //     user_id === undefined ||
  //     user_id === null ||
  //     service_id === undefined ||
  //     service_id === null
  //   ) {
  //     continue;
  //   }
  //   let seedMatchingProviderIdList = seedProviderIdList.filter(
  //     (serviceProvider) => {
  //       serviceProvider.service_id = service_id;
  //     }
  //   );
  //   const provider_id =
  //     seedMatchingProviderIdList[
  //       Math.floor(Math.random() * seedMatchingProviderIdList.length)
  //     ]?.provider_id;
  //   const promo_code_id =
  //     Math.random() < 0.5
  //       ? seedPromoCodeIdList[
  //           Math.floor(Math.random() * seedPromoCodeIdList.length)
  //         ]?.id
  //       : null;
  //   if (
  //     provider_id === undefined ||
  //     provider_id === null ||
  //     promo_code_id === undefined
  //   ) {
  //     continue;
  //   }
  //   const time = new Date("2023-05-23 14:00:00");

  //   const from_time = time.setDate(20 + Math.floor(Math.random() * 12));
  //   const to_time = time.setHours(
  //     time.getHours() + 1 + Math.floor(Math.random() * 5)
  //   );
  //   const booking_submit_time = time.setDate(
  //     time.getDate() - Math.floor(Math.random() * 10)
  //   );
  //   const booking_accept_time = time.setDate(
  //     time.getDate() + 1 + Math.floor(Math.random() * 3)
  //   );
  //   const paid_deposit_time = time.setDate(
  //     time.getDate() + 1 + Math.floor(Math.random() * 3)
  //   );
  //   sampleBookingList.push({
  //     user_id,
  //     service_id,
  //     provider_id,
  //     promo_code_id,
  //     from_time: from_time,
  //     to_time: to_time,
  //     booking_submit_time: booking_submit_time,
  //     booking_accept_time: booking_accept_time,
  //     booking_reject_time: null,
  //     booking_cancel_time: null,
  //     paid_deposit_time: paid_deposit_time,
  //     paid_fully_time: null,
  //     deposit_amount: 0,
  //     full_pay_amount: 0,
  //     full_pay_deadline: null,
  //     deposit_deadline: null,
  //     arrive_time: null,
  //     leave_time: null,
  //     refund_submit_time: null,
  //     refund_accept_time: null,
  //     refund_reject_time: null,
  //     refund_finish_time: null,
  //     user_plan_id: null,
  //   });
  // }
  // proxy.t_service_booking.push(...sampleBookingList);
  /* ------------------------- seed report data finish ------------------------ */
  console.log("seed finish");
}

export function seed() {
  db.transaction(main)();
}

if (process.argv[1] === __filename) {
  seed();
}
