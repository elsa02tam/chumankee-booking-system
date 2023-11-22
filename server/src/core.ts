import { TimezoneDate } from "timezone-date.ts";
import { filter, find, notNull, count } from "better-sqlite3-proxy";
import { defModule } from "./api";
import { HttpError } from "./error";
import { hashPassword, comparePassword } from "./hash";
import { encodeJWT } from "./jwt";
import {
  proxy,
  TUser,
  TServiceBooking,
  TPayment,
  TShoppingOrder,
  TCoupon,
  TService,
} from "./proxy";
import { db } from "./db";
import { DAY, HOUR, MINUTE } from "@beenotung/tslib/time";
import { strToTime } from "./format";
import { compactSlots, d2, StartEnd } from "timeslot-ts";
import { sendEmails } from "./email";
import { createAcceptBookingEmails } from "./email-template/accept-booking";
import { createRejectedBookingEmails } from "./email-template/reject-booking";
import { createCancelBookingEmails } from "./email-template/cancel-booking";
import { createSubmitBookingEmails } from "./email-template/submit-booking";
import {
  createRescheduledBookingByAdminEmails,
  createRescheduledBookingByUserEmails,
} from "./email-template/reschedule-booking";
import { open } from "fs/promises";
import { parse } from "csv-parse";
import { env } from "./env";
import path from "path";
import {
  array,
  boolean,
  float,
  id,
  int,
  nullable,
  number,
  object,
  optional,
  string,
  email,
  values,
} from "cast.ts";
import { format_2_digit } from "@beenotung/tslib/format";
import Stripe from "stripe";
import HttpStatus from "http-status";
import { createPromoteCouponCodeBookingEmails } from "./email-template/promote-coupon-booking";
// HttpStatus.NOT_FOUND -> 404

function timestamp() {
  return int({ min: 0, sampleValue: Date.now() });
}

const stripe = new Stripe(env.STRIPE_API_KEY, {
  apiVersion: "2022-11-15",
});

export let core = defModule();

let { defAPI } = core;

const roles = [
  "super_admin" as const,
  "admin" as const,
  "service_provider" as const,
  "consumer" as const,
];

//login
defAPI({
  name: "login",
  sampleInput: {
    loginId: "alice",
    password: "secret",
  },
  sampleOutput: { token: "jwt" },
  async fn(input) {
    let user = find(
      proxy.t_user,
      input.loginId.includes("@")
        ? { email: input.loginId }
        : { username: input.loginId }
    );
    if (!user)
      throw new HttpError(
        HttpStatus.NOT_FOUND,
        "this username/email is not used"
      );
    let matched = await comparePassword({
      password: input.password,
      password_hash: user.password_hash,
    });
    if (!matched)
      throw new HttpError(
        HttpStatus.UNAUTHORIZED,
        "wrong username or password"
      );
    if (user.delete_time)
      throw new HttpError(HttpStatus.FORBIDDEN, "This account is deleted");
    let token = encodeJWT({
      id: user.id!,
      username: user.username,
      role: user.role,
      is_vip: false,
    });
    return { token };
  },
});

//loginWithFacebook
defAPI({
  name: "loginWithFacebook",
  sampleInput: {
    loginId: "alice",
    password: "secret",
  },
  sampleOutput: { token: "jwt" },
  async fn(input) {
    // let facebookAppId = {env.FACEBOOK_APP_ID}
    let user = find(
      proxy.t_user,
      input.loginId.includes("@")
        ? { email: input.loginId }
        : { username: input.loginId }
    );
    if (!user)
      throw new HttpError(
        HttpStatus.NOT_FOUND,
        "this username/email is not used"
      );
    let matched = await comparePassword({
      password: input.password,
      password_hash: user.password_hash,
    });
    if (!matched)
      throw new HttpError(
        HttpStatus.UNAUTHORIZED,
        "wrong username or password"
      );
    if (user.delete_time)
      throw new HttpError(HttpStatus.FORBIDDEN, "This account is deleted");
    let token = encodeJWT({
      id: user.id!,
      username: user.username,
      role: user.role,
      is_vip: false,
    });
    return { token };
  },
});

//register
defAPI({
  name: "register",
  sampleInput: {
    username: "alice",
    phone: "12345678",
    email: "new@abc.com",
    password: "secret",
  },
  sampleOutput: { token: "jwt" },
  async fn(input) {
    if (!input.username)
      throw new HttpError(HttpStatus.BAD_REQUEST, "missing username");
    if (!input.phone)
      throw new HttpError(HttpStatus.BAD_REQUEST, "missing phone");
    if (!input.email)
      throw new HttpError(HttpStatus.BAD_REQUEST, "missing email");
    if (!input.password)
      throw new HttpError(HttpStatus.BAD_REQUEST, "missing password");
    let password_hash = await hashPassword(input.password);
    let id = proxy.t_user.push({
      username: input.username,
      phone: input.phone,
      email: input.email,
      password_hash: password_hash,
      role: "consumer",
      is_vip: false,
      pic: null,
      delete_time: null,
      original_email: null,
      color: null,
    });
    let token = encodeJWT({
      id,
      username: input.username,
      role: "consumer",
      is_vip: false,
    });
    return { token };
  },
});

//createUserByAdmin
defAPI({
  name: "createUserByAdmin",
  sampleInput: {
    username: "alice",
    phone: "12345678",
    email: "new@abc.com",
    password: "secret",
  },
  sampleOutput: {},
  async fn(input) {
    if (!input.username)
      throw new HttpError(HttpStatus.BAD_REQUEST, "missing username");
    if (!input.phone)
      throw new HttpError(HttpStatus.BAD_REQUEST, "missing phone");
    if (!input.email)
      throw new HttpError(HttpStatus.BAD_REQUEST, "missing email");
    if (!input.password)
      throw new HttpError(HttpStatus.BAD_REQUEST, "missing password");
    let password_hash = await hashPassword(input.password);
    proxy.t_user.push({
      username: input.username,
      phone: input.phone,
      email: input.email,
      password_hash: password_hash,
      role: "consumer",
      is_vip: false,
      pic: null,
      delete_time: null,
      original_email: null,
      color: null,
    });
    return {};
  },
});

//deleteAccount
defAPI({
  name: "deleteAccount",
  role: "consumer",
  fn(input, jwt) {
    let user = proxy.t_user[jwt.id];
    let now = Date.now();
    user.delete_time = now;
    let email = user.email;
    user.original_email = email;
    user.email = `deleted:${now}:${email}`;
    return {};
  },
});

//Service Provider: getServiceProviderProfile
defAPI({
  name: "getServiceProviderProfile",
  sampleInput: {},
  sampleOutput: {
    profile: {
      id: 1,
      username: "dancer",
      email: "dancer@gmail.com",
      role: "service_provider",
      is_vip: false,
      phone: "9000007",
      pic: "/mrboogie_logo.jpg",
    },
    shopSetting: [{ rest_remark: "Mon-Fri 12nn-1pm lunch break" }],
    serviceTimes: [{ week_day: 1, from_time: "09:00:00", to_time: "18:00:00" }],
    services: [
      { booking_max: 10, service_name: "street dance 101", service_id: 1 },
    ],
  },
  role: "service_provider",
  fn(input, jwt) {
    let user = proxy.t_user[jwt.id];
    return {
      profile: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_vip: user.is_vip,
        phone: user.phone,
        pic: user.pic,
      },
      shopSetting: proxy.t_shop_setting.map((row) => ({
        rest_remark: row.rest_remark,
      })),
      serviceTimes: filter(proxy.t_provider_working_hr, {
        provider_id: jwt.id,
      }).map((row) => ({
        week_day: row.week_day,
        from_time: row.from_time,
        to_time: row.to_time,
      })),
      services: filter(proxy.t_service_provider, { provider_id: jwt.id }).map(
        (row) => ({
          booking_max: row.booking_max,
          service_name: row.service?.name!,
          service_id: row.service_id,
        })
      ),
    };
  },
});

//Consumer: getConsumerProfile
defAPI({
  name: "getConsumerProfile",
  sampleInput: {},
  sampleOutput: {
    profile: {
      id: 1,
      username: "Ada",
      email: "ada@gmail.com",
      role: "consumer",
      is_vip: false,
      phone: "9000007",
      pic: "/mrboogie_logo.jpg",
    },
  },
  role: "consumer",
  fn(input, jwt) {
    let user = proxy.t_user[jwt.id];
    if (!user) {
      throw new HttpError(HttpStatus.NOT_FOUND, "user not registered");
    }
    return {
      profile: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_vip: user.is_vip,
        phone: user.phone,
        pic: user.pic,
      },
    };
  },
});

//Service Provider: getBookingListsByServiceProvider
defAPI({
  name: "getBookingListsByServiceProvider",
  role: "service_provider",
  sampleInput: {},
  sampleOutput: {
    booking: [
      {
        user: { id: 1, username: "Mary" },
        service: { id: 1, name: "yoga wheel" },
        from_time: strToTime("2023-05-29 12:00:00"),
        to_time: strToTime("2023-05-29 16:00:00"),
        booking_submit_time: strToTime("2023-05-25 10:00:00"),
        booking_accept_time: strToTime("2023-05-25 10:00:00"),
        booking_reject_time: strToTime("2023-05-25 10:00:00"),
        booking_cancel_time: strToTime("2023-05-25 10:00:00"),
        arrive_time: strToTime("2023-05-25 10:00:00"),
        leave_time: strToTime("2023-05-25 10:00:00"),
      },
    ],
  },
  fn(input, jwt) {
    let user_id = jwt.id;
    return {
      booking: filter(proxy.t_service_booking, { provider_id: user_id }).map(
        (row) => ({
          user: {
            id: row.user_id,
            // username: find(proxy.t_user,{id:row.user_id})?.username,
            // username: proxy.t_user[row.user_id].username,
            username: row.user!.username,
          },
          service: {
            id: row.service_id,
            name: row.service!.name,
          },
          from_time: row.from_time,
          to_time: row.to_time,
          booking_submit_time: row.booking_submit_time,
          booking_accept_time: row.booking_accept_time,
          booking_reject_time: row.booking_reject_time,
          booking_cancel_time: row.booking_cancel_time,
          arrive_time: row.arrive_time,
          leave_time: row.leave_time,
        })
      ),
    };
  },
});

//Admin: getBookingListsByAdmin
defAPI({
  name: "getBookingListsByAdmin",
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    booking: [
      {
        id: 1,
        user: { id: 1, username: "Mary" },
        service: { id: 1, name: "yoga wheel", quota: 5 },
        from_time: strToTime("2023-05-29 12:00:00"),
        to_time: strToTime("2023-05-29 16:00:00"),
        booking_submit_time: strToTime("2023-05-25 10:00:00"),
        booking_accept_time: strToTime("2023-05-25 10:00:00"),
        booking_reject_time: strToTime("2023-05-25 10:00:00"),
        booking_cancel_time: strToTime("2023-05-25 10:00:00"),
        paid_deposit_time: strToTime("2023-05-25 10:00:00"),
        paid_fully_time: strToTime("2023-05-25 10:00:00"),
        refund_submit_time: strToTime("2023-05-25 10:00:00"),
      },
    ],
  },
  fn(input, jwt) {
    return {
      booking: proxy.t_service_booking.map((row) => ({
        user: {
          id: row.user_id,
          // username: find(proxy.t_user,{id:row.user_id})?.username,
          // username: proxy.t_user[row.user_id].username,
          username: row.user!.username,
        },
        service: {
          id: row.service_id,
          name: row.service!.name,
          quota: row.service!.quota,
        },
        id: row.id,
        from_time: row.from_time,
        to_time: row.to_time,
        booking_submit_time: row.booking_submit_time,
        booking_accept_time: row.booking_accept_time,
        booking_reject_time: row.booking_reject_time,
        booking_cancel_time: row.booking_cancel_time,
        paid_deposit_time: row.paid_deposit_time,
        paid_fully_time: row.paid_fully_time,
        refund_submit_time: row.refund_submit_time,
      })),
    };
  },
});

//Admin: getBookingDetailsByAdmin
defAPI({
  name: "getBookingDetailsByAdmin",
  role: "admin",
  sampleInput: { booking_id: 1 },
  sampleOutput: {
    booking: {
      id: 1,
      user: { id: 1, username: "Mary" },
      service: { id: 1, name: "yoga wheel", quota: 5 },
      service_provider: { id: 1, name: "dancer" },
      from_time: strToTime("2023-05-29 12:00:00"),
      to_time: strToTime("2023-05-29 16:00:00"),
      booking_submit_time: strToTime("2023-05-25 10:00:00"),
      booking_accept_time: strToTime("2023-05-25 10:00:00"),
      booking_reject_time: strToTime("2023-05-25 10:00:00"),
      booking_cancel_time: strToTime("2023-05-25 10:00:00"),
      paid_deposit_time: strToTime("2023-05-25 10:00:00"),
      paid_fully_time: strToTime("2023-05-25 10:00:00"),
      arrive_time: strToTime("2023-05-25 10:00:00"),
      leave_time: strToTime("2023-05-25 10:00:00"),
      refund_submit_time: strToTime("2023-05-25 10:00:00"),
      refund_accept_time: strToTime("2023-05-25 10:00:00"),
      refund_reject_time: strToTime("2023-05-25 10:00:00"),
      refund_finish_time: strToTime("2023-05-25 10:00:00"),
      deposit_deadline: strToTime("2023-05-25 10:00:00"),
      deposit_amount: 100,
      full_pay_deadline: strToTime("2023-05-25 10:00:00"),
      full_pay_amount: 200,
      remark: "remark test",
    },
  },
  fn(input, jwt) {
    let row: TServiceBooking = proxy.t_service_booking[input.booking_id];
    if (!row) throw new HttpError(HttpStatus.NOT_FOUND, "booking not found");
    return {
      booking: {
        user: {
          id: row.user_id,
          // username: find(proxy.t_user,{id:row.user_id})?.username,
          // username: proxy.t_user[row.user_id].username,
          username: row.user!.username,
        },
        service: {
          id: row.service_id,
          name: row.service!.name,
          quota: row.service!.quota,
        },
        service_provider: {
          id: row.provider_id,
          name: row.provider!.username,
        },
        id: row.id,
        from_time: row.from_time,
        to_time: row.to_time,
        booking_submit_time: row.booking_submit_time,
        booking_accept_time: row.booking_accept_time,
        booking_reject_time: row.booking_reject_time,
        booking_cancel_time: row.booking_cancel_time,
        paid_deposit_time: row.paid_deposit_time,
        paid_fully_time: row.paid_fully_time,
        arrive_time: row.arrive_time,
        leave_time: row.leave_time,
        refund_submit_time: row.refund_submit_time,
        refund_accept_time: row.refund_accept_time,
        refund_reject_time: row.refund_reject_time,
        refund_finish_time: row.refund_finish_time,

        deposit_deadline: row.deposit_deadline,
        deposit_amount: row.deposit_amount,
        full_pay_deadline: row.full_pay_deadline,
        full_pay_amount: row.full_pay_amount,
        remark: row.remark,
      },
    };
  },
});

function roundPrice(price: number) {
  return +price.toFixed(1);
}

//Admin: requestOrderPaymentByAdmin
defAPI({
  name: "requestOrderPaymentByAdmin",
  role: "admin",
  inputParser: object({
    order_id: id(),
    full_pay_amount: float({ min: 0 }),
    full_pay_deadline: int({ sampleValue: strToTime("2023-03-08 04:30:00") }),
    deposit_amount: float({ min: 0 }),
    deposit_deadline: int({ sampleValue: strToTime("2023-03-08 04:30:00") }),
  }),
  fn(input, jwt) {
    let order = proxy.t_shopping_order[input.order_id];
    if (!order) throw new HttpError(HttpStatus.NOT_FOUND, "booking not found");

    let deposit_amount = roundPrice(input.deposit_amount);
    let full_pay_amount = roundPrice(input.full_pay_amount);

    let total_price = 0;
    filter(proxy.t_order_part, { order_id: input.order_id }).forEach((row) => {
      total_price += row.product!.price;
    });
    total_price -= order.promo_code?.discount_amount || 0;
    if (total_price < 0) total_price = 0;
    total_price = roundPrice(total_price);

    if (deposit_amount + full_pay_amount !== total_price)
      throw new HttpError(
        HttpStatus.NOT_ACCEPTABLE,
        "the sum of deposit_amount and full_pay_amount should be " + total_price
      );

    if (deposit_amount && !input.deposit_deadline)
      throw new HttpError(HttpStatus.BAD_REQUEST, "missing deposit_deadline");

    if (!input.full_pay_deadline)
      throw new HttpError(HttpStatus.BAD_REQUEST, "missing full_pay_deadline");

    order.full_pay_amount = full_pay_amount;
    order.full_pay_deadline = input.full_pay_deadline;
    order.deposit_amount = deposit_amount;
    order.deposit_deadline = input.deposit_deadline;

    return {};
  },
});

//Admin: acceptBookingByAdmin
defAPI({
  name: "acceptBookingByAdmin",
  role: "admin",
  inputParser: object({
    booking_id: id(),
    full_pay_amount: float({ min: 0 }),
    full_pay_deadline: int({ sampleValue: strToTime("2023-03-08 04:30:00") }),
    deposit_amount: float({ min: 0 }),
    deposit_deadline: int({ sampleValue: strToTime("2023-03-08 04:30:00") }),
  }),
  sampleOutput: {
    booking_accept_time: strToTime("2023-03-08 04:30:00"),
  },
  async fn(input, jwt) {
    let row = proxy.t_service_booking[input.booking_id];
    if (!row) throw new HttpError(HttpStatus.NOT_FOUND, "booking not found");

    let deposit_amount = roundPrice(input.deposit_amount);
    let full_pay_amount = roundPrice(input.full_pay_amount);

    let total_price = roundPrice(
      row.service!.price - (row.promo_code?.discount_amount || 0)
    );
    if (total_price < 0) total_price = 0;

    if (deposit_amount + full_pay_amount !== total_price)
      throw new HttpError(
        HttpStatus.NOT_ACCEPTABLE,
        "the sum of deposit_amount and full_pay_amount should be " + total_price
      );

    if (deposit_amount && !input.deposit_deadline)
      throw new HttpError(HttpStatus.BAD_REQUEST, "missing deposit_deadline");

    if (!input.full_pay_deadline)
      throw new HttpError(HttpStatus.BAD_REQUEST, "missing full_pay_deadline");

    let booking_accept_time = Date.now();
    row.booking_accept_time = booking_accept_time;
    row.booking_reject_time = null;
    row.full_pay_amount = full_pay_amount;
    row.full_pay_deadline = input.full_pay_deadline;
    row.deposit_amount = deposit_amount;
    row.deposit_deadline = input.deposit_deadline;
    await sendEmails(createAcceptBookingEmails(row));
    return { booking_accept_time };
  },
});

//Admin: rejectBookingByAdmin
defAPI({
  name: "rejectBookingByAdmin",
  role: "admin",
  sampleInput: {
    booking_id: 1,
  },
  sampleOutput: {
    booking_reject_time: strToTime("2023-03-08 04:30:00"),
  },
  async fn(input, jwt) {
    let row = proxy.t_service_booking[input.booking_id];
    if (!row) throw new HttpError(HttpStatus.NOT_FOUND, "booking not found");
    let booking_reject_time = Date.now();
    row.booking_reject_time = booking_reject_time;
    row.booking_accept_time = null;
    await sendEmails(createRejectedBookingEmails(row));
    return { booking_reject_time };
  },
});

//Admin: promoteCouponCodeEmailByAdmin
defAPI({
  name: "promoteCouponCodeEmailByAdmin",
  role: "admin",
  sampleInput: {
    coupon_id: 1,
    email: "alice@gmail.com",
  },
  sampleOutput: {},
  async fn(input, jwt) {
    let row = proxy.t_coupon[input.coupon_id];
    if (!row) throw new HttpError(HttpStatus.NOT_FOUND, "coupon not found");
    await sendEmails(
      createPromoteCouponCodeBookingEmails({
        coupon: row,
        email: input.email,
      })
    );
    return {};
  },
});

//Admin: receiveBookingPaymeByAdmin
defAPI({
  name: "receiveBookingPaymeByAdmin",
  role: "admin",
  sampleInput: {
    booking_id: 1,
    pay_for: "deposit" || "full-pay",
    received_amount: 123,
  },
  sampleOutput: {
    payment_id: 1,
    submit_time: strToTime("2023-03-08 04:30:00"),
  },
  fn(input, jwt) {
    let booking = proxy.t_service_booking[input.booking_id];
    if (!booking)
      throw new HttpError(HttpStatus.NOT_FOUND, "booking not found");

    let received_amount = roundPrice(input.received_amount);
    let expected_amount = roundPrice(
      (input.pay_for === "deposit"
        ? booking.deposit_amount
        : booking.full_pay_amount) || 0
    );

    if (received_amount !== expected_amount)
      throw new HttpError(
        HttpStatus.NOT_ACCEPTABLE,
        "expected amount is " + expected_amount
      );

    let now = Date.now();
    let payment_id = proxy.t_payment.push({
      remark: "as " + input.pay_for,
      submit_time: now,
      filename: null,
      stripe_id: null,
      accept_time: now,
      reject_time: null,
      method: "payme",
      amount: received_amount,
      order_id: null,
      booking_id: input.booking_id,
    });

    if (input.pay_for === "deposit") {
      booking.paid_deposit_time = now;
    } else if (input.pay_for === "full-pay") {
      booking.paid_fully_time = now;
    }

    return { payment_id, submit_time: now };
  },
});

//Admin: receiveOrderPaymeByAdmin
defAPI({
  name: "receiveOrderPaymeByAdmin",
  role: "admin",
  sampleInput: {
    order_id: 1,
    pay_for: "deposit" || "full-pay",
    received_amount: 123,
  },
  sampleOutput: {
    payment_id: 1,
    submit_time: strToTime("2023-03-08 04:30:00"),
  },
  fn(input, jwt) {
    let order = proxy.t_shopping_order[input.order_id];
    if (!order) throw new HttpError(HttpStatus.NOT_FOUND, "order not found");
    let received_amount = roundPrice(input.received_amount);
    let expected_amount = roundPrice(
      (input.pay_for === "deposit"
        ? order.deposit_amount
        : order.full_pay_amount) || 0
    );

    if (received_amount !== expected_amount)
      throw new HttpError(
        HttpStatus.NOT_ACCEPTABLE,
        "expected amount is " + expected_amount
      );
    let now = Date.now();

    let payment_id = proxy.t_payment.push({
      remark: "as " + input.pay_for,
      submit_time: now,
      filename: null,
      stripe_id: null,
      accept_time: now,
      reject_time: null,
      method: "payme",
      amount: received_amount,
      order_id: input.order_id,
      booking_id: null,
    });
    if (input.pay_for === "deposit") {
      order.deposit_time = now;
    } else if (input.pay_for === "full-pay") {
      order.full_pay_time = now;
    }

    if (input.pay_for === "full-pay") {
      checkToBecomeVIP(order);
    }

    return { payment_id, submit_time: now };
  },
});

//Consumer: requestStripePaymentByConsumer
defAPI({
  name: "requestStripePaymentByConsumer",
  role: "consumer",
  inputParser: object({
    order_id: optional(id()),
    booking_id: optional(id()),
    pay_for: values(["deposit" as const, "full-pay" as const]),
  }),
  sampleOutput: { payment_url: "https://stripe.com/checkout/123456" },
  async fn(input, jwt) {
    let item: TShoppingOrder | TServiceBooking;
    let type: "shopping order" | "service booking";
    if (input.order_id) {
      let order = proxy.t_shopping_order[input.order_id];
      item = order;
      type = "shopping order";
    } else if (input.booking_id) {
      let booking = proxy.t_service_booking[input.booking_id];
      item = booking;
      type = "service booking";
    } else {
      throw new HttpError(
        HttpStatus.BAD_REQUEST,
        "missing order_id or booking_id"
      );
    }

    if (!item) {
      throw new HttpError(HttpStatus.NOT_FOUND, type + " not found");
    }

    if (item.user_id !== jwt.id) {
      throw new HttpError(HttpStatus.NOT_ACCEPTABLE, "not your " + type);
    }

    let amount: number;
    let title: string;
    if (input.pay_for === "deposit") {
      amount = item.deposit_amount!;
      title = "deposit of " + type + " #" + item.id;
    } else if (input.pay_for === "full-pay") {
      amount = item.full_pay_amount!;
      title = "full pay of " + type + " #" + item.id;
    } else {
      throw new HttpError(
        HttpStatus.BAD_REQUEST,
        "unknown pay_for, expect deposit or full-pay"
      );
    }

    if (!(amount >= 0))
      throw new HttpError(
        HttpStatus.PRECONDITION_REQUIRED,
        "payment amount not set by admin yet"
      );

    let payment_id = proxy.t_payment.push({
      remark: "as " + input.pay_for,
      submit_time: Date.now(),
      filename: null,
      stripe_id: null,
      accept_time: null,
      reject_time: null,
      method: "stripe",
      amount,
      order_id: input.order_id || null,
      booking_id: input.booking_id || null,
    });

    let session = await stripe.checkout.sessions.create({
      success_url: env.ORIGIN + `/api/stripe/payment/${payment_id}/success`,
      cancel_url: env.ORIGIN + `/api/stripe/payment/${payment_id}/cancel`,
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "HKD",
            unit_amount: amount * 100, // unit in cent
            product_data: {
              name: title,
            },
          },
        },
      ],
    });
    proxy.t_payment[payment_id].stripe_id = session.id;

    return { payment_url: session.url };
  },
});

core.router.get("/stripe/payment/:id/success", async (req, res, next) => {
  try {
    let payment_id = +req.params.id;
    let payment = proxy.t_payment[payment_id];
    if (!payment)
      throw new HttpError(HttpStatus.NOT_FOUND, "payment not found");
    let stripe_id = payment.stripe_id;
    if (!stripe_id)
      throw new HttpError(
        HttpStatus.PRECONDITION_FAILED,
        "this payment is not charged by stripe"
      );
    let session = await stripe.checkout.sessions.retrieve(stripe_id);
    // TODO wait for some time?
    if (session.payment_status !== "paid")
      throw new HttpError(
        HttpStatus.BAD_REQUEST,
        "The stripe payment is not paid"
      );
    let now = Date.now();
    payment.accept_time = now;

    let { order, booking } = payment;
    if (!order && !booking) {
      throw new HttpError(
        HttpStatus.PRECONDITION_FAILED,
        "invalid payment, should has order_id or booking_id"
      );
    }

    let remark = payment.remark;
    if (remark === "as deposit") {
      if (order) {
        order.deposit_time = now;
      }
      if (booking) {
        booking.paid_deposit_time = now;
      }
    } else if (remark === "as full-pay") {
      if (order) {
        order.full_pay_time = now;
      }
      if (booking) {
        booking.paid_fully_time = now;
      }
    } else {
      throw new HttpError(
        HttpStatus.PRECONDITION_FAILED,
        'invalid payment remark, should be "as deposit" or "as full-pay"'
      );
    }

    // TODO test redirect after payment
    res.redirect(env.FRONTEND_ORIGIN + "/consumer/profile/payment-record");
  } catch (error) {
    next(error);
  }
});

core.router.get("/stripe/payment/:id/cancel", async (req, res, next) => {
  try {
    let payment_id = +req.params.id;
    let payment = proxy.t_payment[payment_id];
    if (!payment)
      throw new HttpError(HttpStatus.NOT_FOUND, "payment not found");
    let stripe_id = payment.stripe_id;
    if (!stripe_id)
      throw new HttpError(
        HttpStatus.PRECONDITION_FAILED,
        "this payment is not charged by stripe"
      );
    let session = await stripe.checkout.sessions.retrieve(stripe_id);
    if (session.payment_status === "paid")
      throw new HttpError(
        HttpStatus.BAD_REQUEST,
        "The stripe payment is already paid"
      );
    payment.reject_time = Date.now();
    // TODO redirect
    res.json({});
  } catch (error) {
    next(error);
  }
});

function checkToBecomeVIP(order: TShoppingOrder) {
  for (let row of filter(proxy.t_order_part, { order_id: order.id! })) {
    if (row.product?.is_vip) {
      order.user!.is_vip = true;
      break;
    }
  }
}

//Admin: checkInBookingByAdmin
defAPI({
  name: "checkInBookingByAdmin",
  role: "admin",
  sampleInput: {
    booking_id: 1,
  },
  sampleOutput: {
    arrive_time: strToTime("2023-03-08 04:30:00"),
  },
  fn(input, jwt) {
    let row = proxy.t_service_booking[input.booking_id];
    if (!row) throw new HttpError(HttpStatus.NOT_FOUND, "booking not found");
    let arrive_time = Date.now();
    row.arrive_time = arrive_time;
    return { arrive_time };
  },
});

//Admin: checkOutBookingByAdmin
defAPI({
  name: "checkOutBookingByAdmin",
  role: "admin",
  sampleInput: {
    booking_id: 1,
  },
  sampleOutput: {
    leave_time: strToTime("2023-03-08 04:30:00"),
  },
  fn(input, jwt) {
    let row = proxy.t_service_booking[input.booking_id];
    if (!row) throw new HttpError(HttpStatus.NOT_FOUND, "booking not found");
    let leave_time = Date.now();
    row.leave_time = leave_time;
    return { leave_time };
  },
});

//Consumer: getNoticeListForConsumer
defAPI({
  name: "getNoticeListForConsumer",
  role: "consumer",
  sampleInput: {},
  sampleOutput: {
    notice: [
      {
        id: 1,
        title: "test title",
        content: "test content",
        publish_time: strToTime("2023-04-25 09:00"),
      },
    ],
  },
  fn(input, jwt) {
    return {
      notice: proxy.t_notice.map((row) => ({
        id: row.id!,
        title: row.title,
        content: row.content,
        publish_time: row.publish_time,
      })),
    };
  },
});

//Admin: getNoticeListForAdmin
defAPI({
  name: "getNoticeListForAdmin",
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    notice: [
      {
        id: 1,
        title: "test title",
        content: "test content",
        publish_time: strToTime("2023-04-25 09:00"),
      },
    ],
  },
  fn(input, jwt) {
    return {
      notice: proxy.t_notice.map((row) => ({
        id: row.id!,
        title: row.title,
        content: row.content,
        publish_time: row.publish_time,
      })),
    };
  },
});

//Admin: saveNoticeByAdmin
defAPI({
  name: "saveNoticeByAdmin",
  role: "admin",
  sampleInput: {
    notice: {
      id: 1,
      title: "test title",
      content: "test content",
      publish_time: strToTime("2023-04-25 09:00"),
    },
  },
  sampleOutput: { id: 1 },
  fn(input, jwt) {
    let notice = input.notice;
    let id = notice.id;
    if (id > 0) {
      proxy.t_notice[id] = notice;
    } else {
      notice.id = null as any;
      id = proxy.t_notice.push(notice);
    }
    return {
      id,
    };
  },
});

//Admin: deleteNoticeByAdmin
defAPI({
  name: "deleteNoticeByAdmin",
  role: "admin",
  sampleInput: {
    notice_id: 1,
  },
  sampleOutput: {},
  fn(input, jwt) {
    filter(proxy.t_notice, {
      id: input.notice_id,
    }).forEach((row) => {
      delete proxy.t_notice[row.id!];
    });
    return {};
  },
});

//Admin: getPlanListForAdmin
defAPI({
  name: "getPlanListForAdmin",
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    plans: [
      {
        id: 1,
        service_id: 1,
        service_type_id: 1,
        weekly_quota: 3,
        quota: 3,
        expire_month: 2,
        desc: "定期方案： 詳情",
        title: "定期方案2",
        price: 100,
        cancel_time: strToTime("2023-04-25 09:00"),
      },
    ],
    service_types: [
      {
        id: 1,
        name: "dance",
      },
    ],
    services: [
      {
        id: 1,
        name: "street dance",
      },
    ],
  },
  fn(input, jwt) {
    return {
      plans: proxy.t_plan.map((row) => ({
        id: row.id!,
        service_id: row.service_id,
        service_type_id: row.service_type_id,
        weekly_quota: row.weekly_quota,
        quota: row.quota,
        expire_month: row.expire_month,
        desc: row.desc,
        title: row.title,
        price: row.price,
        cancel_time: row.cancel_time,
      })),
      service_types: proxy.t_service_type.map((service_type) => ({
        id: service_type.id,
        name: service_type.name,
      })),
      services: proxy.t_service.map((service) => ({
        id: service.id,
        name: service.name,
      })),
    };
  },
});

let count_user_confirmed_booking = db
  .prepare(
    /* sql */ `
select
  count(*) as count
from t_service_booking
where user_id = :user_id
  and booking_accept_time is not null
  and from_time >= :from_time
  and to_time <= :to_time
`
  )
  .pluck();

//Consumer: getPlanListForConsumer
defAPI({
  name: "getPlanListForConsumer",
  role: "consumer",
  sampleInput: {},
  sampleOutput: {
    plans: [
      {
        user_plan_id: 1,
        user_plan_expire_time: strToTime("2023-04-25 09:00"),
        user_plan_payment_time: strToTime("2023-04-25 09:00"),
        plan_id: 1,
        service_id: 1,
        service_name: "street dance",
        service_type_id: 1,
        service_type_name: "dance",
        weekly_quota: 3,
        used_weekly_quota: 1,
        quota: 3,
        used_quota: 1,
        expire_month: 2,
        desc: "定期方案： 詳情",
        title: "定期方案2",
        price: 100,
      },
    ],
  },
  fn(input, jwt) {
    let used_quota = count_user_confirmed_booking.get({
      user_id: jwt.id,
      from_time: 0,
      to_time: strToTime("2199-01-01"),
    });
    let date = new TimezoneDate();
    date.timezone = 8;
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - date.getDay() * DAY);
    let from_time = date.getTime();
    let to_time = from_time + 7 * DAY - 1;
    let used_weekly_quota = count_user_confirmed_booking.get({
      user_id: jwt.id,
      from_time,
      to_time,
    });
    return {
      plans: filter(proxy.t_user_plan, { user_id: jwt.id }).map((row) => {
        let plan = row.plan!;
        return {
          user_plan_id: row.id,
          user_plan_expire_time: row.expire_time,
          user_plan_payment_time: row.payment_time,
          plan_id: plan.id,
          service_id: plan.service_id,
          service_name: plan.service?.name,
          service_type_id: plan.service_type_id,
          service_type_name: plan.service_type?.name,
          weekly_quota: plan.weekly_quota,
          used_weekly_quota,
          quota: plan.quota,
          used_quota,
          expire_month: plan.expire_month,
          desc: plan.desc,
          title: plan.title,
          price: plan.price,
        };
      }),
    };
  },
});

//Admin: savePlan
defAPI({
  name: "savePlan",
  role: "admin",
  sampleInput: {
    plan: {
      id: 1,
      service_id: 1,
      service_type_id: 1,
      weekly_quota: 3,
      quota: 3,
      expire_month: 2,
      desc: "定期方案： 詳情",
      title: "定期方案2",
      price: 300,
      cancel_time: strToTime("2023-04-25 09:00"),
    },
  },
  sampleOutput: { id: 1 },
  fn(input, jwt) {
    let plan = input.plan;
    let id = plan.id;
    if (!plan.service_id) {
      plan.service_id = null as any;
    }
    if (!plan.service_type_id) {
      plan.service_type_id = null as any;
    }
    if (id > 0) {
      proxy.t_plan[id] = plan;
    } else {
      plan.id = null as any;
      id = proxy.t_plan.push(plan);
    }
    return {
      id,
    };
  },
});

//Admin: getAddonServiceListByAdmin
defAPI({
  name: "getAddonServiceListByAdmin",
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    services: [{ id: 1, name: "service A" }],
    addon_services: [
      {
        from_service_id: 1,
        to_service_id: 2,
      },
    ],
  },
  fn(input, jwt) {
    return {
      services: proxy.t_service.map((service) => ({
        id: service.id,
        name: service.name,
      })),
      addon_services: proxy.t_addon_service.map((addon) => ({
        from_service_id: addon.from_service_id,
        to_service_id: addon.to_service_id,
      })),
    };
  },
});

//Admin: saveAddonServiceByAdmin
defAPI({
  name: "saveAddonServiceByAdmin",
  role: "admin",
  inputParser: object({
    addon_services: array(
      object({
        from_service_id: id(),
        to_service_id: id(),
      })
    ),
  }),
  fn(input, jwt) {
    db.transaction(() => {
      proxy.t_addon_service.forEach(
        (row) => delete proxy.t_addon_service[row.id!]
      );
      input.addon_services.forEach((row) => {
        proxy.t_addon_service.push({
          from_service_id: row.from_service_id,
          to_service_id: row.to_service_id,
        });
      });
    })();
    return {};
  },
});

//Admin: getAddonProductListByAdmin
defAPI({
  name: "getAddonProductListByAdmin",
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    products: [{ id: 1, name: "product A" }],
    addon_products: [
      {
        from_product_id: 1,
        to_product_id: 2,
      },
    ],
  },
  fn(input, jwt) {
    return {
      products: proxy.t_product.map((product) => ({
        id: product.id,
        name: product.name,
      })),
      addon_products: proxy.t_addon_product.map((addon) => ({
        from_product_id: addon.from_product_id,
        to_product_id: addon.to_product_id,
      })),
    };
  },
});

//Admin: saveAddonProductByAdmin
defAPI({
  name: "saveAddonProductByAdmin",
  role: "admin",
  inputParser: object({
    addon_products: array(
      object({
        from_product_id: id(),
        to_product_id: id(),
      })
    ),
  }),
  fn(input, jwt) {
    db.transaction(() => {
      proxy.t_addon_product.forEach(
        (row) => delete proxy.t_addon_product[row.id!]
      );
      input.addon_products.forEach((row) => {
        proxy.t_addon_product.push({
          from_product_id: row.from_product_id,
          to_product_id: row.to_product_id,
        });
      });
    })();
    return {};
  },
});

//Admin: getEventList
defAPI({
  name: "getEventList",
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    events: [
      {
        id: 1,
        name: "「生咗個仔，姓單，改咩名好」大會",
        remark: "2023-04-30",
        quota: 3,
        cancel_time: strToTime("2023-04-30 09:00"),
      },
    ],
  },
  fn(input, jwt) {
    return {
      events: proxy.t_event.map((event) => ({
        id: event.id!,
        name: event.name,
        remark: event.remark,
        quota: event.quota,
        cancel_time: event.cancel_time,
      })),
    };
  },
});

//Admin: getCouponListByAdmin
defAPI({
  name: "getCouponListByAdmin",
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    services: [
      {
        id: 1,
        service_name: "street dance",
        type_name: "dance",
      },
    ],
    products: [
      {
        id: 1,
        product_name: "d",
        type_name: "dance",
      },
    ],
    coupons: [
      {
        id: 1,
        coupon_code: "Mouse-Pro",
        quota: 1,
        discount_amount: 100,
        expired_time: strToTime("2024-12-01 04:30:00"),
        is_any_product: false,
        is_any_service: false,
        is_vip_only: true,
        service_ids: [1, 2, 3],
        product_ids: [1, 22],
      },
    ],
  },
  fn(input, jwt) {
    return {
      services: proxy.t_service.map((row) => ({
        id: row.id!,
        service_name: row.name,
        type_name: row.type?.name,
      })),
      products: proxy.t_product.map((row) => ({
        id: row.id!,
        product_name: row.name,
        type_name: row.type?.type,
      })),
      coupons: proxy.t_coupon.map((coupon) => ({
        id: coupon.id,
        coupon_code: coupon.coupon_code!,
        quota: coupon.quota,
        discount_amount: coupon.discount_amount,
        expired_time: coupon.expired_time,
        is_any_product: coupon.is_any_product,
        is_any_service: coupon.is_any_service,
        is_vip_only: coupon.is_vip_only,
        service_ids: filter(proxy.t_coupon_service, {
          coupon_id: coupon.id!,
        }).map((row) => row.service_id),
        product_ids: filter(proxy.t_coupon_product, {
          coupon_id: coupon.id!,
        }).map((row) => row.product_id),
      })),
    };
  },
});

//Admin: saveCouponByAdmin
defAPI({
  name: "saveCouponByAdmin",
  role: "admin",
  sampleInput: {
    coupon: {
      id: 1,
      coupon_code: "Mouse-Pro",
      quota: 1,
      discount_amount: 100,
      expired_time: strToTime("2024-12-01 04:30:00"),
      is_any_product: false,
      is_any_service: false,
      is_vip_only: true,
      service_ids: [1, 2, 3],
      product_ids: [1, 22],
    },
  },
  sampleOutput: { id: 1 },
  fn(input, jwt) {
    return db.transaction(() => {
      let { service_ids, product_ids, id: coupon_id, ...coupon } = input.coupon;

      let db_coupon = proxy.t_coupon[coupon_id];

      if (db_coupon) {
        Object.assign(db_coupon, coupon);
      } else {
        coupon_id = proxy.t_coupon.push(coupon);
      }

      filter(proxy.t_coupon_service, { coupon_id }).forEach(
        (row) => delete proxy.t_coupon_service[row.id!]
      );
      service_ids.forEach((service_id) =>
        proxy.t_coupon_service.push({ service_id, coupon_id })
      );

      filter(proxy.t_coupon_product, { coupon_id }).forEach(
        (row) => delete proxy.t_coupon_product[row.id!]
      );
      product_ids.forEach((product_id) =>
        proxy.t_coupon_product.push({ product_id, coupon_id })
      );

      return { id: coupon_id };
    })();
  },
});

//Admin: getCouponDetailsByAdmin
defAPI({
  name: "getCouponDetailsByAdmin",
  role: "admin",
  sampleInput: { coupon_id: 1 },
  sampleOutput: {
    coupon: {
      id: 1,
      coupon_code: "Mouse-Pro",
      discount_amount: 100,
      expired_time: strToTime("2024-12-01 04:30:00"),
      is_any_product: false,
      is_any_service: false,
      is_vip_only: true,
      services: [
        {
          id: 1,
          service_name: "street dance",
          type_name: "dance",
        },
      ],
      products: [
        {
          id: 1,
          product_name: "d",
        },
      ],
    },
  },
  fn(input, jwt) {
    let coupon: TCoupon = proxy.t_coupon[input.coupon_id];
    return {
      coupon: {
        id: coupon.id!,
        coupon_code: coupon.coupon_code!,
        discount_amount: coupon.discount_amount,
        expired_time: coupon.expired_time,
        is_any_product: coupon.is_any_product,
        is_any_service: coupon.is_any_service,
        is_vip_only: coupon.is_vip_only,
        services: filter(proxy.t_coupon_service, {
          coupon_id: coupon.id!,
        }).map((row) => ({
          id: row.id,
          service_name: row.service?.name,
          type_name: row.service?.type?.name,
        })),
        products: filter(proxy.t_coupon_product, {
          coupon_id: coupon.id!,
        }).map((row) => ({
          id: row.id,
          product_name: row.product?.name,
        })),
      },
    };
  },
});

//Admin: saveEvent
defAPI({
  name: "saveEvent",
  role: "admin",
  sampleInput: {
    event: {
      id: 1,
      name: "「生咗個仔，姓單，改咩名好」大會",
      remark: "2023-04-30",
      quota: 3,
      cancel_time: strToTime("2023-04-25 09:00"),
    },
  },
  sampleOutput: { id: 1 },
  fn(input, jwt) {
    let event = input.event;
    let id = event.id;
    if (id > 0) {
      proxy.t_event[id] = event;
    } else {
      event.id = null as any;
      id = proxy.t_event.push({
        name: event.name,
        remark: event.remark,
        quota: event.quota,
        cancel_time: null,
      });
    }
    return {
      id,
    };
  },
});

//Root: getUserListForSuperAdmin
defAPI({
  name: "getUserListForSuperAdmin",
  sampleInput: {},
  outputParser: object({
    users: array(
      object({
        id: id(),
        username: string(),
        email: email(),
        role: values(roles),
      })
    ),
  }),
  role: "super_admin",
  fn(input, jwt) {
    return {
      users: proxy.t_user.map((row) => ({
        id: row.id!,
        username: row.username,
        email: row.email,
        role: row.role,
      })),
    };
  },
});

//Admin: getUserListForAdmin
defAPI({
  name: "getUserListForAdmin",
  sampleInput: {},
  outputParser: object({
    users: array(
      object({
        id: id(),
        username: string(),
        email: email(),
        role: values(roles),
        is_vip: boolean(),
        color: string(),
      })
    ),
  }),
  role: "admin",
  fn(input, jwt) {
    return {
      users: proxy.t_user
        .filter((row) => row.role !== "super_admin")
        .map((row) => ({
          id: row.id!,
          username: row.username,
          email: row.email,
          role: row.role,
          is_vip: row.is_vip,
          color: row.color || "",
        })),
    };
  },
});

//Admin: getUserDetailsForAdmin
let getUserDetailsForAdmin = defAPI({
  name: "getUserDetailsForAdmin",
  sampleInput: { user_id: 1 },
  sampleOutput: {
    userDetails: {
      id: 1,
      username: "dancer",
      email: "dancer@gamil.com",
      pic: "/mrboogie_logo.jpg",
      role: "service_provider",
      phone: "12345678",
      is_vip: false,
    },
    restTime: {
      rest_remark: "Mon-Fri 12nn-1pm lunch break",
    },
    services: [
      {
        id: 1,
        service_name: "yoga beginner",
        type_name: "yoga",
        quota: 12,
      },
    ],
    providerWorkingTime: [
      {
        provider_id: 1,
        week_day: 1,
        from_time: "09:00:00",
        to_time: "18:00:00",
      },
    ],
  },
  role: "admin",
  fn(input, jwt) {
    let restTime = proxy.t_shop_setting[1];
    let user: TUser = proxy.t_user[input.user_id];
    return {
      userDetails: {
        id: user.id,
        username: user.username,
        email: user.email,
        pic: user.pic,
        role: user.role,
        phone: user.phone,
        is_vip: user.is_vip,
      },
      restTime: {
        rest_remark: restTime.rest_remark,
      },
      services: filter(proxy.t_service_provider, {
        provider_id: input.user_id,
      }).map((row) => ({
        id: row.id,
        service_name: row.service?.name,
        type_name: row.service?.type?.name,
        quota: row.booking_max,
      })),
      providerWorkingTime: filter(proxy.t_provider_working_hr, {
        provider_id: input.user_id,
      }).map((row) => ({
        provider_id: row.provider_id,
        week_day: row.week_day,
        from_time: row.from_time,
        to_time: row.to_time,
      })),
    };
  },
});

//Admin: getProviderListForAdmin
defAPI({
  name: "getProviderListForAdmin",
  sampleInput: {},
  sampleOutput: {
    providers: [{ id: 1, username: "dancer" }],
  },
  role: "admin",
  fn(input, jwt) {
    return {
      providers: proxy.t_user
        .filter((row) => row.role === "service_provider")
        .map((row) => ({
          id: row.id!,
          username: row.username,
        })),
    };
  },
});

function defReportAPI(options: {
  reportName: string;
  tableName: keyof typeof proxy;
  columnName: string;
}) {
  type SelectReportRow = {
    [columnName: string]: number;
  };

  let select_report = db.prepare(/* sql */ `
select
  ${options.columnName}
from ${options.tableName}
where ${options.columnName} >= :start_time
  and ${options.columnName} <= :end_time
`);

  //Admin: getXReportByAdmin
  defAPI({
    name: `getYearly${options.reportName}ReportByAdmin`,
    role: "admin",
    sampleInput: {},
    sampleOutput: {
      labels: ["2023", "2024"],
      data: { "Numbers of Bookings": [123, 456] },
    },
    fn(input, jwt) {
      let rows = select_report.all({
        start_time: 0,
        end_time: new Date("2099-01-01").getTime(),
      }) as SelectReportRow[];

      // year -> count
      let counts: number[] = [];
      rows.forEach((row) => {
        let date = new TimezoneDate(row[options.columnName]);
        date.timezone = 8;
        let year = date.getFullYear();
        let count = counts[year] || 0;
        counts[year] = count + 1;
      });
      return {
        labels: Object.keys(counts),
        data: { "Numbers of Bookings": Object.values(counts) },
      };
    },
  });

  //Admin: getMonthlyXReportByAdmin
  defAPI({
    name: `getMonthly${options.reportName}ReportByAdmin`,
    role: "admin",
    sampleInput: { year: "2023" },
    sampleOutput: {
      labels: ["2023", "2024"],
      data: { "Numbers of Bookings": [123, 456] },
    },
    fn(input, jwt) {
      const inputDate = new Date(input.year);
      const inputYear = inputDate.getFullYear();
      let date = new TimezoneDate();

      date.timezone = 8;
      date.setFullYear(inputYear, 0, 1);
      date.setHours(0, 0, 0, 0);

      let start_time = date.getTime();

      date.setFullYear(inputYear + 1);
      let end_time = date.getTime() - 1;

      let rows = select_report.all({
        start_time,
        end_time,
      }) as SelectReportRow[];

      // month -> count
      let counts: number[] = [];
      rows.forEach((row) => {
        let date = new TimezoneDate(row[options.columnName]);
        date.timezone = 8;
        let month = date.getMonth() + 1;
        let count = counts[month] || 0;
        counts[month] = count + 1;
      });
      return {
        labels: Object.keys(counts),
        data: { "Numbers of Bookings": Object.values(counts) },
      };
    },
  });

  //Admin: getDailyXReportByAdmin
  defAPI({
    name: `getDaily${options.reportName}ReportByAdmin`,
    role: "admin",
    sampleInput: { date: "2023-04-02T22:12:00+08:00" },
    sampleOutput: {
      labels: ["2023", "2024"],
      data: { "Numbers of Bookings": [123, 456] },
    },
    fn(input, jwt) {
      let date = new Date(input.date);
      date.setHours(0, 0, 0, 0);

      let start_time = date.getTime();

      date.setDate(date.getDate() + 7);
      let end_time = date.getTime() - 1;

      let rows = select_report.all({
        start_time,
        end_time,
      }) as SelectReportRow[];

      // day -> count
      let counts: number[] = [];
      rows.forEach((row) => {
        let date = new TimezoneDate(row[options.columnName]);
        date.timezone = 8;
        let day = date.getDate();
        let count = counts[day] || 0;
        counts[day] = count + 1;
      });
      return {
        labels: Object.keys(counts),
        data: { "Numbers of Bookings": Object.values(counts) },
      };
    },
  });
}

defReportAPI({
  reportName: "Booking",
  tableName: "t_service_booking",
  columnName: "booking_submit_time",
});

function defSalesReportAPI() {
  type SelectSalesReportRow = {
    price: number;
    from_time: number;
  };

  let select_sales_report = db.prepare(/* sql */ `
select
  t_service.price, 
  t_service_booking.from_time
from t_service inner join t_service_booking on t_service.id = t_service_booking.service_id
where t_service_booking.from_time >= :start_time
  and t_service_booking.from_time <= :end_time
`);

  let select_provider_sales_report = db.prepare(/* sql */ `
select
  t_service.price, 
  t_service_booking.from_time
from t_service inner join t_service_booking on t_service.id = t_service_booking.service_id
where t_service_booking.from_time >= :start_time
  and t_service_booking.from_time <= :end_time
  and t_service_booking.provider_id == :provider_id
`);

  //Admin: getYearlySalesReportByAdmin
  defAPI({
    name: `getYearlySalesReportByAdmin`,
    role: "admin",
    sampleInput: { providerId: -1 },
    sampleOutput: {
      labels: ["2023", "2024"],
      data: { Sales: [123, 456] },
    },
    fn(input, jwt) {
      let rows =
        input.providerId === -1
          ? (select_sales_report.all({
            start_time: 0,
            end_time: new Date("2099-01-01").getTime(),
          }) as SelectSalesReportRow[])
          : (select_provider_sales_report.all({
            start_time: 0,
            end_time: new Date("2099-01-01").getTime(),
            provider_id: input.providerId,
          }) as SelectSalesReportRow[]);

      // year -> count
      let sums: number[] = [];
      rows.forEach((row) => {
        let date = new TimezoneDate(row.from_time);
        date.timezone = 8;
        let year = date.getFullYear();
        let sum = sums[year] || 0;
        sums[year] = sum + row.price;
      });
      return {
        labels: Object.keys(sums),
        data: { Sales: Object.values(sums) },
      };
    },
  });

  //Admin: getMonthlySalesReportByAdmin
  defAPI({
    name: `getMonthlySalesReportByAdmin`,
    role: "admin",
    sampleInput: { year: "2023", providerId: -1 },
    sampleOutput: {
      labels: ["2023", "2024"],
      data: { Sales: [123, 456] },
    },
    fn(input, jwt) {
      const inputDate = new Date(input.year);
      const inputYear = inputDate.getFullYear();
      let date = new TimezoneDate();
      date.timezone = 8;
      date.setFullYear(inputYear, 0, 1);
      date.setHours(0, 0, 0, 0);

      let start_time = date.getTime();

      date.setFullYear(inputYear + 1);
      let end_time = date.getTime() - 1;

      let rows =
        input.providerId === -1
          ? (select_sales_report.all({
            start_time,
            end_time,
          }) as SelectSalesReportRow[])
          : (select_provider_sales_report.all({
            start_time,
            end_time,
            provider_id: input.providerId,
          }) as SelectSalesReportRow[]);

      // month -> count
      let sums: number[] = [];
      rows.forEach((row) => {
        let date = new TimezoneDate(row.from_time);
        date.timezone = 8;
        let month = date.getMonth() + 1;
        let sum = sums[month] || 0;
        sums[month] = sum + row.price;
      });
      return {
        labels: Object.keys(sums),
        data: { Sales: Object.values(sums) },
      };
    },
  });

  //Admin: getDailySalesReportByAdmin
  defAPI({
    name: `getDailySalesReportByAdmin`,
    role: "admin",
    sampleInput: { date: "2023-04-02T22:12:00+08:00", providerId: -1 },
    sampleOutput: {
      labels: ["2023", "2024"],
      data: { Sales: [123, 456] },
    },
    fn(input, jwt) {
      let date = new Date(input.date);
      date.setHours(0, 0, 0, 0);

      let start_time = date.getTime();

      date.setDate(date.getDate() + 7);
      let end_time = date.getTime() - 1;

      let rows =
        input.providerId === -1
          ? (select_sales_report.all({
            start_time,
            end_time,
          }) as SelectSalesReportRow[])
          : (select_provider_sales_report.all({
            start_time,
            end_time,
            provider_id: input.providerId,
          }) as SelectSalesReportRow[]);

      // day -> count
      let sums: number[] = [];
      rows.forEach((row) => {
        let date = new TimezoneDate(row.from_time);
        date.timezone = 8;
        let day = date.getDate() + 1;
        let sum = sums[day] || 0;
        sums[day] = sum + row.price;
      });
      return {
        labels: Object.keys(sums),
        data: { Sales: Object.values(sums) },
      };
    },
  });
}

defSalesReportAPI();

function defAttendanceReportAPI() {
  type SelectAttendanceReportRow = {
    from_time: number;
    booking_accept_time: number;
    arrive_time: number | null;
  };

  let select_attendance_report = db.prepare(/* sql */ `
select
  from_time,
  booking_accept_time,
  arrive_time
from t_service_booking
where from_time >= :start_time
  and from_time <= :end_time
`);

  //Admin: getYearlyAttendanceReportByAdmin
  defAPI({
    name: `getYearlyAttendanceReportByAdmin`,
    role: "admin",
    sampleInput: {},
    sampleOutput: {
      labels: ["2023", "2024"],
      data: {
        "Numbers of Accepted Bookings": [123, 456],
        "Numbers of no Arriving": [789, 123],
      },
    },
    fn(input, jwt) {
      let rows = select_attendance_report.all({
        start_time: 0,
        end_time: new Date("2099-01-01").getTime(),
      }) as SelectAttendanceReportRow[];

      // year -> count
      let bookingAcceptCounts: number[] = [];
      let noArriveCounts: number[] = [];
      rows.forEach((row) => {
        let date = new TimezoneDate(row.from_time);
        date.timezone = 8;
        let year = date.getFullYear();
        let bookingAcceptCount = bookingAcceptCounts[year] || 0;
        bookingAcceptCounts[year] = bookingAcceptCount + 1;
        let noArriveCount = noArriveCounts[year] || 0;
        noArriveCounts[year] = row.arrive_time
          ? noArriveCount
          : noArriveCount + 1;
      });
      return {
        labels: Object.keys(bookingAcceptCounts),
        data: {
          "Numbers of Accepted Bookings": Object.values(bookingAcceptCounts),
          "Numbers of no Arriving": Object.values(noArriveCounts),
        },
      };
    },
  });

  //Admin: getMonthlyAttendanceReportByAdmin
  defAPI({
    name: `getMonthlyAttendanceReportByAdmin`,
    role: "admin",
    sampleInput: { year: "2023" },
    sampleOutput: {
      labels: ["2023", "2024"],
      data: {
        "Numbers of Accepted Bookings": [123, 456],
        "Numbers of no Arriving": [789, 123],
      },
    },
    fn(input, jwt) {
      const inputDate = new Date(input.year);
      const inputYear = inputDate.getFullYear();
      let date = new TimezoneDate();
      date.timezone = 8;
      date.setFullYear(inputYear, 0, 1);
      date.setHours(0, 0, 0, 0);

      let start_time = date.getTime();

      date.setFullYear(inputYear + 1);
      let end_time = date.getTime() - 1;

      let rows = select_attendance_report.all({
        start_time,
        end_time,
      }) as SelectAttendanceReportRow[];

      // month -> count
      let bookingAcceptCounts: number[] = [];
      let noArriveCounts: number[] = [];
      rows.forEach((row) => {
        let date = new TimezoneDate(row.from_time);
        date.timezone = 8;
        let month = date.getMonth() + 1;
        let bookingAcceptCount = bookingAcceptCounts[month] || 0;
        bookingAcceptCounts[month] = bookingAcceptCount + 1;
        let noArriveCount = noArriveCounts[month] || 0;
        noArriveCounts[month] = row.arrive_time
          ? noArriveCount
          : noArriveCount + 1;
      });
      return {
        labels: Object.keys(bookingAcceptCounts),
        data: {
          "Numbers of Accepted Bookings": Object.values(bookingAcceptCounts),
          "Numbers of no Arriving": Object.values(noArriveCounts),
        },
      };
    },
  });

  //Admin: getDailyAttendanceReportByAdmin
  defAPI({
    name: `getDailyAttendanceReportByAdmin`,
    role: "admin",
    sampleInput: { date: "2023-04-02T22:12:00+08:00" },
    sampleOutput: {
      labels: ["2023", "2024"],
      data: {
        "Numbers of Accepted Bookings": [123, 456],
        "Numbers of no Arriving": [789, 123],
      },
    },
    fn(input, jwt) {
      let date = new Date(input.date);
      date.setHours(0, 0, 0, 0);

      let start_time = date.getTime();

      date.setDate(date.getDate() + 7);
      let end_time = date.getTime() - 1;

      let rows = select_attendance_report.all({
        start_time,
        end_time,
      }) as SelectAttendanceReportRow[];

      // day -> count
      let bookingAcceptCounts: number[] = [];
      let noArriveCounts: number[] = [];
      rows.forEach((row) => {
        let date = new TimezoneDate(row.from_time);
        date.timezone = 8;
        let day = date.getDate() + 1;
        let bookingAcceptCount = bookingAcceptCounts[day] || 0;
        bookingAcceptCounts[day] = bookingAcceptCount + 1;
        let noArriveCount = noArriveCounts[day] || 0;
        noArriveCounts[day] = row.arrive_time
          ? noArriveCount
          : noArriveCount + 1;
      });
      return {
        labels: Object.keys(bookingAcceptCounts),
        data: {
          "Numbers of Accepted Bookings": Object.values(bookingAcceptCounts),
          "Numbers of no Arriving": Object.values(noArriveCounts),
        },
      };
    },
  });
}

defAttendanceReportAPI();

function defServiceHotnessReportAPI() {
  type SelectServiceHotnessReportRow = {
    name: string;
    "count(t_service.name)": number;
  };
  let select_service_hotness_report = db.prepare(/* sql */ `
select
  t_service.name, 
  count(t_service.name)
from t_service_booking inner join t_service on t_service.id = t_service_booking.service_id
where from_time >= :start_time
  and from_time <= :end_time
group by t_service.name
`);

  //Admin: getYearlyServiceHotnessReportByAdmin
  defAPI({
    name: `getYearlyServiceHotnessReportByAdmin`,
    role: "admin",
    sampleInput: {},
    sampleOutput: {
      labels: ["2023", "2024"],
      data: {
        data: [789, 123],
      },
    },
    fn(input, jwt) {
      let rows = select_service_hotness_report.all({
        start_time: 0,
        end_time: new Date("2099-01-01").getTime(),
      }) as SelectServiceHotnessReportRow[];
      console.log(rows);
      let serviceNameArr: string[] = [];
      let serviceCounts: number[] = [];
      rows.forEach((row) => {
        serviceNameArr.push(row.name);
        serviceCounts.push(row["count(t_service.name)"]);
      });
      return {
        labels: serviceNameArr,
        data: {
          data: serviceCounts,
        },
      };
    },
  });

  //Admin: getMonthlyServiceHotnessReportByAdmin
  defAPI({
    name: `getMonthlyServiceHotnessReportByAdmin`,
    role: "admin",
    sampleInput: { year: "2023" },
    sampleOutput: {
      labels: ["2023", "2024"],
      data: {
        data: [123, 456],
      },
    },
    fn(input, jwt) {
      const inputDate = new Date(input.year);
      const inputYear = inputDate.getFullYear();
      let date = new TimezoneDate();
      date.timezone = 8;
      date.setFullYear(inputYear, 0, 1);
      date.setHours(0, 0, 0, 0);

      let start_time = date.getTime();

      date.setFullYear(inputYear + 1);
      let end_time = date.getTime() - 1;

      let rows = select_service_hotness_report.all({
        start_time,
        end_time,
      }) as SelectServiceHotnessReportRow[];

      let serviceNameArr: string[] = [];
      let serviceCounts: number[] = [];
      rows.forEach((row) => {
        serviceNameArr.push(row.name);
        serviceCounts.push(row["count(t_service.name)"]);
      });
      return {
        labels: serviceNameArr,
        data: {
          data: serviceCounts,
        },
      };
    },
  });

  //Admin: getDailyServiceHotnessReportByAdmin
  defAPI({
    name: `getDailyServiceHotnessReportByAdmin`,
    role: "admin",
    sampleInput: { date: "2023-04-02T22:12:00+08:00" },
    sampleOutput: {
      labels: ["2023", "2024"],
      data: {
        data: [123, 456],
      },
    },
    fn(input, jwt) {
      let date = new Date(input.date);
      date.setHours(0, 0, 0, 0);

      let start_time = date.getTime();

      date.setDate(date.getDate() + 7);
      let end_time = date.getTime() - 1;

      let rows = select_service_hotness_report.all({
        start_time,
        end_time,
      }) as SelectServiceHotnessReportRow[];

      let serviceNameArr: string[] = [];
      let serviceCounts: number[] = [];
      rows.forEach((row) => {
        serviceNameArr.push(row.name);
        serviceCounts.push(row["count(t_service.name)"]);
      });
      return {
        labels: serviceNameArr,
        data: {
          data: serviceCounts,
        },
      };
    },
  });
}

defServiceHotnessReportAPI();

//Admin: getBookingListByDateByAdmin
defAPI({
  name: `getBookingListByDateByAdmin`,
  role: "admin",
  sampleInput: { date: "2023-04-02T22:12:00+08:00" },
  sampleOutput: [
    {
      id: 1,
      user_id: 1,
      username: "a",
      service_id: 1,
      name: "a",
      provider_id: 1,
      provider_name: "a",
      promo_code_id: 1,
      booking_submit_time: 1,
      booking_accept_time: 1,
      booking_reject_time: 1,
      booking_cancel_time: 1,
      paid_deposit_time: 1,
      paid_fully_time: 1,
      user_plan_id: 1,
      title: "a",
    },
  ],
  fn(input, jwt) {
    type SelectBookingListRow = {
      id: number;
      user_id: number;
      username: string;
      service_id: number;
      name: string;
      provider_id: number;
      provider_name: string;
      promo_code_id: number;
      booking_submit_time: number;
      booking_accept_time: number;
      booking_reject_time: number;
      booking_cancel_time: number;
      paid_deposit_time: number;
      paid_fully_time: number;
      user_plan_id: number;
      title: string;
    };

    let select_booking_list = db.prepare(/* sql */ `
select
  t_service_booking.id,
  t_service_booking.user_id,
  t_user.username,
  t_service_booking.service_id,
  t_service.name,
  t_service_booking.provider_id,
  t_provider.username as provider_name,
  t_service_booking.promo_code_id,
  t_service_booking.booking_submit_time,
  t_service_booking.booking_accept_time,
  t_service_booking.booking_reject_time,
  t_service_booking.booking_cancel_time,
  t_service_booking.paid_deposit_time,
  t_service_booking.paid_fully_time,
  t_service_booking.user_plan_id,
  t_plan.title
from t_service_booking 
inner join t_user on t_service_booking.user_id = t_user.id 
inner join t_service on t_service_booking.service_id = t_service.id
inner join t_user as t_provider on t_service_booking.provider_id = t_provider.id 
left join t_user_plan on t_service_booking.user_plan_id = t_user_plan.id
left join t_plan on t_user_plan.plan_id = t_plan.id
where t_service_booking.booking_submit_time >= :start_time
  and t_service_booking.booking_submit_time <= :end_time and t_service_booking.booking_accept_time is not null
`);
    let date = new Date(input.date);
    date.setHours(0, 0, 0, 0);

    let start_time = date.getTime();

    date.setDate(date.getDate() + 1);
    let end_time = date.getTime() - 1;

    let rows = select_booking_list.all({
      start_time,
      end_time,
    }) as SelectBookingListRow[];
    return rows;
  },
});

//Admin: getNextWeekBookingListByAdmin
defAPI({
  name: `getNextWeekBookingListByAdmin`,
  role: "admin",
  sampleInput: {},
  sampleOutput: [
    {
      id: 1,
      user_id: 1,
      username: "a",
      service_id: 1,
      name: "a",
      provider_id: 1,
      provider_name: "a",
      promo_code_id: 1,
      booking_submit_time: 1,
      booking_accept_time: 1,
      booking_reject_time: 1,
      booking_cancel_time: 1,
      paid_deposit_time: 1,
      paid_fully_time: 1,
      user_plan_id: 1,
      title: "a",
    },
  ],
  fn(input, jwt) {
    type SelectBookingListRow = {
      id: number;
      user_id: number;
      username: string;
      service_id: number;
      name: string;
      provider_id: number;
      provider_name: string;
      promo_code_id: number;
      booking_submit_time: number;
      booking_accept_time: number;
      booking_reject_time: number;
      booking_cancel_time: number;
      paid_deposit_time: number;
      paid_fully_time: number;
      user_plan_id: number;
      title: string;
    };

    let select_booking_list = db.prepare(/* sql */ `
select
  t_service_booking.id,
  t_service_booking.user_id,
  t_user.username,
  t_service_booking.service_id,
  t_service.name,
  t_service_booking.provider_id,
  t_provider.username as provider_name,
  t_service_booking.promo_code_id,
  t_service_booking.booking_submit_time,
  t_service_booking.booking_accept_time,
  t_service_booking.booking_reject_time,
  t_service_booking.booking_cancel_time,
  t_service_booking.paid_deposit_time,
  t_service_booking.paid_fully_time,
  t_service_booking.user_plan_id,
  t_plan.title
from t_service_booking 
inner join t_user on t_service_booking.user_id = t_user.id 
inner join t_service on t_service_booking.service_id = t_service.id
inner join t_user as t_provider on t_service_booking.provider_id = t_provider.id 
left join t_user_plan on t_service_booking.user_plan_id = t_user_plan.id
left join t_plan on t_user_plan.plan_id = t_plan.id
where t_service_booking.booking_submit_time >= :start_time
  and t_service_booking.booking_submit_time <= :end_time
`);
    let date = new Date();
    date.setHours(0, 0, 0, 0);

    let start_time = date.getTime();

    date.setDate(date.getDate() + 7);
    let end_time = date.getTime() - 1;

    let rows = select_booking_list.all({
      start_time,
      end_time,
    }) as SelectBookingListRow[];
    return rows;
  },
});

type SelectUserNumberReportRow = {
  userNumber: number;
};

//Admin: getUserNumberByAdmin
defAPI({
  name: `getUserNumberByAdmin`,
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    data: {
      userNumber: 123,
    },
  },
  fn(input, jwt) {
    let rows = db
      .prepare(
        /* sql */ `
            select
              count(*) as userNumber 
            from t_user;
            `
      )
      .all() as SelectUserNumberReportRow[];
    return {
      data: {
        userNumber: rows[0].userNumber,
      },
    };
  },
});

type SelectNonAdminUserNumberReportRow = {
  nonAdminUserNumber: number;
};

//Admin: getNonAdminUserNumberByAdmin
defAPI({
  name: `getNonAdminUserNumberByAdmin`,
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    data: {
      nonAdminUserNumber: 123,
    },
  },
  fn(input, jwt) {
    let rows = db
      .prepare(
        /* sql */ `
            select
              count(*) as nonAdminUserNumber 
            from t_user
            where role IN ('service_provider','consumer');
            `
      )
      .all() as SelectNonAdminUserNumberReportRow[];
    return {
      data: {
        nonAdminUserNumber: rows[0].nonAdminUserNumber,
      },
    };
  },
});

type SelectAdminNumberReportRow = {
  adminNumber: number;
};

//Admin: getAdminNumberByAdmin
defAPI({
  name: `getAdminNumberByAdmin`,
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    data: {
      adminNumber: 123,
    },
  },
  fn(input, jwt) {
    let rows = db
      .prepare(
        /* sql */ `
            select
              count(*) as adminNumber 
            from t_user
            where role IN ('super_admin','admin');
            `
      )
      .all() as SelectAdminNumberReportRow[];
    return {
      data: {
        adminNumber: rows[0].adminNumber,
      },
    };
  },
});

type SelectBookingSalesReportRow = {
  bookingSales: number;
};

//Admin: getBookingSalesByAdmin
defAPI({
  name: `getBookingSalesByAdmin`,
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    data: {
      bookingSales: 123,
    },
  },
  fn(input, jwt) {
    let rows = db
      .prepare(
        /* sql */ `
            select
              sum(amount) as bookingSales 
            from t_payment
            where booking_id not null and accept_time not null;
            `
      )
      .all() as SelectBookingSalesReportRow[];
    return {
      data: {
        bookingSales: rows[0].bookingSales,
      },
    };
  },
});

type SelectOrderSalesReportRow = {
  orderSales: number;
};

//Admin: getOrderSalesByAdmin
defAPI({
  name: `getOrderSalesByAdmin`,
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    data: {
      orderSales: 123,
    },
  },
  fn(input, jwt) {
    let rows = db
      .prepare(
        /* sql */ `
            select
              sum(amount) as orderSales 
            from t_payment
            where order_id not null and accept_time not null;
            `
      )
      .all() as SelectOrderSalesReportRow[];
    return {
      data: {
        orderSales: rows[0].orderSales,
      },
    };
  },
});

type SelectBookingNumberReportRow = {
  bookingNumber: number;
};

//Admin: getBookingNumberByAdmin
defAPI({
  name: `getBookingNumberByAdmin`,
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    data: {
      bookingNumber: 123,
    },
  },
  fn(input, jwt) {
    let rows = db
      .prepare(
        /* sql */ `
            select
              count(*) as bookingNumber 
            from t_service_booking
            `
      )
      .all() as SelectBookingNumberReportRow[];
    return {
      data: {
        bookingNumber: rows[0].bookingNumber,
      },
    };
  },
});

type SelectPendingBookingNumberReportRow = {
  pendingBookingNumber: number;
};

//Admin: getPendingBookingNumberByAdmin
defAPI({
  name: `getPendingBookingNumberByAdmin`,
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    data: {
      pendingBookingNumber: 123,
    },
  },
  fn(input, jwt) {
    let rows = db
      .prepare(
        /* sql */ `
            select
              count(*) as pendingBookingNumber 
            from t_service_booking where booking_accept_time is null and booking_reject_time is null and booking_cancel_time is null;
            `
      )
      .all() as SelectPendingBookingNumberReportRow[];
    return {
      data: {
        pendingBookingNumber: rows[0].pendingBookingNumber,
      },
    };
  },
});

type SelectAcceptedBookingNumberReportRow = {
  acceptedBookingNumber: number;
};

//Admin: getAcceptedBookingNumberByAdmin
defAPI({
  name: `getAcceptedBookingNumberByAdmin`,
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    data: {
      acceptedBookingNumber: 123,
    },
  },
  fn(input, jwt) {
    let rows = db
      .prepare(
        /* sql */ `
            select
              count(*) as acceptedBookingNumber 
            from t_service_booking where booking_accept_time not null and booking_reject_time is null and booking_cancel_time is null;
            `
      )
      .all() as SelectAcceptedBookingNumberReportRow[];
    return {
      data: {
        acceptedBookingNumber: rows[0].acceptedBookingNumber,
      },
    };
  },
});

type SelectRejectedBookingNumberReportRow = {
  rejectedBookingNumber: number;
};

//Admin: getRejectedBookingNumberByAdmin
defAPI({
  name: `getRejectedBookingNumberByAdmin`,
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    data: {
      rejectedBookingNumber: 123,
    },
  },
  fn(input, jwt) {
    let rows = db
      .prepare(
        /* sql */ `
            select
              count(*) as rejectedBookingNumber 
            from t_service_booking where booking_accept_time is null and booking_reject_time not null and booking_cancel_time is null;
            `
      )
      .all() as SelectRejectedBookingNumberReportRow[];
    return {
      data: {
        rejectedBookingNumber: rows[0].rejectedBookingNumber,
      },
    };
  },
});

type SelectCancelledBookingNumberReportRow = {
  cancelledBookingNumber: number;
};

//Admin: getCancelledBookingNumberByAdmin
defAPI({
  name: `getCancelledBookingNumberByAdmin`,
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    data: {
      cancelledBookingNumber: 123,
    },
  },
  fn(input, jwt) {
    let rows = db
      .prepare(
        /* sql */ `
            select
              count(*) as cancelledBookingNumber 
            from t_service_booking where booking_accept_time is null and booking_reject_time is null and booking_cancel_time not null;
            `
      )
      .all() as SelectCancelledBookingNumberReportRow[];
    return {
      data: {
        cancelledBookingNumber: rows[0].cancelledBookingNumber,
      },
    };
  },
});

type csvUser = {
  username: string;
  password: string;
  email: string;
  is_vip: number;
  phone: string;
};

//Admin: UploadCustomerData
defAPI({
  name: "UploadCustomerData",
  sampleInput: { csv: "1.csv" },
  sampleOutput: {},
  role: "admin",
  async fn(input, jwt) {
    try {
      const parser = parse(
        { bom: true, columns: true, delimiter: "," },
        function (err, records: csvUser[]) {
          db.transaction(async () => {
            let usernameList = proxy.t_user.map((user) => user.email);
            let userEmailList = proxy.t_user.map((user) => user.username);
            for (let record of records) {
              usernameList = proxy.t_user.map((user) => user.email);
              userEmailList = proxy.t_user.map((user) => user.username);
              if (
                usernameList.includes(record.username) ||
                userEmailList.includes(record.email)
              )
                return;
              try {
                let id = proxy.t_user.push({
                  username: record.username,
                  password_hash: await hashPassword(record.password),
                  email: record.email,
                  role: "consumer",
                  is_vip: record.is_vip == 1 ? true : false,
                  pic: null,
                  phone: record.phone,
                  delete_time: null,
                  original_email: null,
                  color: null,
                });
              } catch (err) {
                continue;
              }
            }
          })();
        }
      );
      const csvFile = await open(path.resolve("uploads", input.csv));
      const stream = csvFile.createReadStream().pipe(parser);
      return {};
    } catch (error) {
      console.error(error);
    }
  },
});

//Admin: update service provider pic
let updateServiceProviderPic = defAPI({
  name: "updateServiceProviderPic",
  sampleInput: { user_id: 1, pic: "1.jpg" },
  sampleOutput: {},
  role: "admin",
  fn(input, jwt) {
    proxy.t_user[input.user_id].pic = input.pic;
    return {};
  },
});

//Admin: add service to a provider
defAPI({
  name: "addServiceToProvider",
  sampleInput: { provider_id: 1, service_id: 1, quota: 5 },
  sampleOutput: { id: 1 },
  role: "admin",
  fn(input, jwt) {
    let id = proxy.t_service_provider.push({
      service_id: input.service_id,
      provider_id: input.provider_id,
      booking_max: input.quota,
    });
    return { id };
  },
});

//Admin: remove service from a provider
let delete_service_provider = db.prepare(/* sql */ `
delete from t_service_provider
where provider_id = :provider_id
and service_id = :service_id
`);
defAPI({
  name: "removeServiceToProvider",
  sampleInput: { provider_id: 1, service_id: 1 },
  sampleOutput: {},
  role: "admin",
  fn(input, jwt) {
    // delete_service_provider.run(input);

    filter(proxy.t_service_provider, {
      provider_id: input.provider_id,
      service_id: input.service_id,
    }).forEach((row) => {
      delete proxy.t_service_provider[row.id!];
    });

    return {};
  },
});

//Root: setUserRoleBySuperAdmin
defAPI({
  name: "setUserRoleBySuperAdmin",
  inputParser: object({
    user_id: id(),
    role: values(["admin" as const, "consumer" as const]),
  }),
  sampleOutput: {},
  role: "super_admin",
  fn(input, jwt) {
    proxy.t_user[input.user_id].role = input.role;
    return {};
  },
});

//Admin: setUserRoleByAdmin
defAPI({
  name: "setUserRoleByAdmin",
  inputParser: object({
    user_id: id(),
    role: values(roles),
    is_vip: boolean(),
  }),
  sampleOutput: {},
  role: "admin",
  fn(input, jwt) {
    proxy.t_user[input.user_id].role = input.role;
    proxy.t_user[input.user_id].is_vip = input.is_vip;
    if (input.role === "service_provider") {
      let provider_id = input.user_id;
      for (let week_day = 0; week_day <= 6; week_day++) {
        if (!find(proxy.t_provider_working_hr, { provider_id, week_day })) {
          proxy.t_provider_working_hr.push({
            provider_id,
            week_day,
            from_time: "",
            to_time: "",
          });
        }
      }
    }
    return {};
  },
});

//Admin: setUserColorByAdmin
defAPI({
  name: "setUserColorByAdmin",
  inputParser: object({
    user_id: id(),
    color: string(),
  }),
  sampleOutput: {},
  role: "admin",
  fn(input, jwt) {
    proxy.t_user[input.user_id].color = input.color || null;
    return {};
  },
});

//Admin: getCompanySettings
defAPI({
  name: "getCompanySettings",
  role: "admin",
  sampleInput: {},
  outputParser: object({
    serviceTimes: array(
      object({
        id: id(),
        week_day: int(),
        from_time: nullable(string({ sampleValue: "09:00:00" })),
        to_time: nullable(string({ sampleValue: "18:00:00" })),
      })
    ),
    holidays: array(
      object({
        id: id(),
        remark: string(),
        from_time: int({ sampleValue: strToTime("2023-03-08 04:30:00") }),
        to_time: int({ sampleValue: strToTime("2023-03-13 05:30:00") }),
      })
    ),
    allow_cancel_booking_time: int(),
  }),
  fn(input, jwt) {
    return {
      serviceTimes: proxy.t_shop_working_hr.map((row) => ({
        id: row.id,
        week_day: row.week_day,
        from_time: row.from_time,
        to_time: row.to_time,
      })),
      holidays: proxy.t_special_rest.map((row) => ({
        id: row.id,
        remark: row.remark,
        from_time: row.from_time,
        to_time: row.to_time,
      })),
      allow_cancel_booking_time:
        proxy.t_shop_setting[1].allow_cancel_booking_time,
    };
  },
});

//Consumer: getCompanyOperationTime
defAPI({
  name: "getCompanyOperationTime",
  sampleInput: {},
  outputParser: object({
    serviceTimes: array(
      object({
        id: id(),
        week_day: int(),
        from_time: nullable(string({ sampleValue: "09:00:00" })),
        to_time: nullable(string({ sampleValue: "09:00:00" })),
      })
    ),
  }),
  role: "consumer",
  fn(input, jwt) {
    return {
      serviceTimes: proxy.t_shop_working_hr.map((row) => ({
        id: row.id,
        week_day: row.week_day,
        from_time: row.from_time,
        to_time: row.to_time,
      })),
    };
  },
});

//Admin: saveWorkingTimesForServiceProvider
defAPI({
  name: "saveWorkingTimesForServiceProvider",
  sampleInput: {
    provider_id: 1,
    serviceTimes: [
      {
        week_day: 1,
        from_time: "09:00:00",
        to_time: "18:00:00",
      },
    ],
  },
  sampleOutput: {},
  role: "admin",
  fn(input, jwt) {
    filter(proxy.t_provider_working_hr, {
      provider_id: input.provider_id,
    }).forEach((row) => {
      let id = row.id!;
      delete proxy.t_provider_working_hr[id];
    });

    for (let row of input.serviceTimes) {
      proxy.t_provider_working_hr.push({
        provider_id: input.provider_id,
        week_day: row.week_day,
        from_time: row.from_time,
        to_time: row.to_time,
      });
    }
    return {};
  },
});

//Admin: saveCompanyServiceTimes
defAPI({
  name: "saveCompanyServiceTimes",
  inputParser: object({
    serviceTimes: array(
      object({
        id: id(),
        week_day: int(),
        from_time: nullable(string({ sampleValue: "09:00:00" })),
        to_time: nullable(string({ sampleValue: "18:00:00" })),
      })
    ),
  }),
  sampleOutput: {},
  role: "admin",
  fn(input, jwt) {
    for (let row of input.serviceTimes) {
      proxy.t_shop_working_hr[row.id] = row;
    }
    return {};
  },
});

//Admin: saveCompanyHoliday
defAPI({
  name: "saveCompanyHoliday",
  sampleInput: {
    holiday: {
      id: 1,
      remark: "東主有喜",
      from_time: strToTime("2023-03-08 04:30:00"),
      to_time: strToTime("2023-03-08 04:30:00"),
    },
  },
  sampleOutput: { id: 1 },
  role: "admin",
  fn(input, jwt) {
    let row = input.holiday;
    if (row.from_time > row.to_time) {
      let t = row.to_time;
      row.to_time = row.from_time;
      row.from_time = t;
    }
    if (row.id) {
      proxy.t_special_rest[row.id] = row;
    } else {
      delete (row as any).id;
      proxy.t_special_rest.push(row);
    }
    return { id: row.id };
  },
});

//Admin: saveAllowCancelBookingTime
defAPI({
  name: "saveAllowCancelBookingTime",
  role: "admin",
  sampleInput: {
    allow_cancel_booking_time: 2 * DAY,
  },
  sampleOutput: {},
  fn(input, jwt) {
    proxy.t_shop_setting[1].allow_cancel_booking_time =
      input.allow_cancel_booking_time;
    return {};
  },
});

//Admin: delCompanyHoliday
defAPI({
  name: "delCompanyHoliday",
  sampleInput: {
    id: 1,
  },
  sampleOutput: {},
  role: "admin",
  fn(input, jwt) {
    delete proxy.t_special_rest[input.id];
    return {};
  },
});

//Admin: getAllServiceList
defAPI({
  name: "getAllServiceList",
  sampleInput: {},
  sampleOutput: {
    service_types: [
      {
        type_id: 1,
        type_name: "dancing",
        services: [
          {
            service_id: 1,
            service_name: "beginner dance",
            quota: 1,
            duration: 30, // minutes
          },
        ],
      },
    ],
  },
  fn(input) {
    let service_types = proxy.t_service_type.map((service_type) => ({
      type_id: service_type.id,
      type_name: service_type.name,
      services: filter(proxy.t_service, { type_id: service_type.id! }).map(
        (service) => ({
          service_id: service.id,
          service_name: service.name,
          quota: service.quota,
          duration: service.duration,
        })
      ),
    }));
    return { service_types };
  },
});

export type PaymentOrderRow = {
  t_shopping_order_id: number;
  checkout_time: null | number;
  full_pay_time: null | number;
  full_pay_amount: null | number;
  full_pay_deadline: null | number;
  deposit_time: null | number;
  deposit_amount: null | number;
  deposit_deadline: null | number;
  coupon_code: string;
  discount_amount: number;
  expired_time: number;
  promo_code_id: number;
  username: string;
  user_id: number;
  is_vip: boolean;
  pic: null | string;
};
let select_payment_order = db.prepare(/* sql */ `
select
  t_shopping_order.id as t_shopping_order_id
, t_shopping_order.checkout_time
, t_shopping_order.full_pay_time
, t_shopping_order.full_pay_amount
, t_shopping_order.full_pay_deadline
, t_shopping_order.deposit_time
, t_shopping_order.deposit_amount
, t_shopping_order.deposit_deadline
, promo_code.coupon_code
, promo_code.discount_amount
, promo_code.expired_time
, promo_code.id as promo_code_id
, user.username
, user.id as user_id
, user.is_vip
, user.pic
from t_shopping_order
left join t_coupon as promo_code on promo_code.id = t_shopping_order.promo_code_id
inner join t_user as user on user.id = t_shopping_order.user_id
where t_shopping_order.id = :id
`);

export type OrderPartRow = {
  t_order_part_id: number;
  product_id: number;
  name: string;
  pic: string;
  price: number;
  type_id: number;
  type: string;
};
let select_order_parts = db.prepare(/* sql */ `
select
  t_order_part.id as t_order_part_id
, product.id as product_id
, product.name
, product.pic
, product.price
, type.id as type_id
, type.type
from t_order_part
inner join t_shopping_order on t_shopping_order.id = t_order_part.order_id
inner join t_product as product on product.id = t_order_part.product_id
inner join t_product_type as type on type.id = product.type_id
where t_shopping_order.id = :id
`);

export type PaymentBookingRow = {
  t_service_booking_id: number;
  paid_deposit_time: null | number;
  paid_fully_time: null | number;
  promo_code_id: null | number;
  service_id: number;
  user_id: number;
  user_plan_id: null | number;
  username: string;
  is_vip: boolean;
  user_pic: null | string;
  coupon_code: string;
  discount_amount: number;
  expired_time: number;
  type_id: number;
  service_name: string;
  service_pic: null | string;
  price: null | number;
  expire_time: number;
  plan_id: number;
  type_name: string;
  quota: null | number;
  weekly_quota: null | number;
  title: string;
};
let select_payment_booking = db.prepare(/* sql */ `
select
  t_service_booking.id
, t_service_booking.paid_deposit_time
, t_service_booking.paid_fully_time
, t_service_booking.promo_code_id
, t_service_booking.service_id
, t_service_booking.user_id
, t_service_booking.user_plan_id
, user.username
, user.is_vip
, user.pic as user_pic
, promo_code.coupon_code
, promo_code.discount_amount
, promo_code.expired_time
, service.type_id
, service.name as service_name
, service.pic as service_pic
, service.price
, user_plan.expire_time
, user_plan.plan_id
, type.name as type_name
, plan.quota
, plan.weekly_quota
, plan.title
from t_service_booking
inner join t_user as user on user.id = t_service_booking.user_id
left join t_coupon as promo_code on promo_code.id = t_service_booking.promo_code_id
inner join t_service as service on service.id = t_service_booking.service_id
left join t_user_plan as user_plan on user_plan.id = t_service_booking.user_plan_id
inner join t_service_type as type on type.id = service.type_id
left join t_plan as plan on plan.id = user_plan.plan_id
`);

//Admin: getPaymentListForAdmin
defAPI({
  name: "getPaymentListForAdmin",
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    order_payments: [
      {
        payment: {
          id: 1,
          order_id: 1,
          booking_id: 0,
          remark: "remark text...",
          filename: "receipt.jpg",
          submit_time: strToTime("2023-05-18 13:00:00"),
        },
        order: {
          t_shopping_order_id: 1,
          checkout_time: strToTime("2023-05-18 13:00:00"),
          full_pay_time: strToTime("2023-05-18 13:00:00"),
          full_pay_amount: 1,
          full_pay_deadline: 1,
          deposit_time: strToTime("2023-05-18 13:00:00"),
          deposit_amount: 1,
          deposit_deadline: 1,
          coupon_code: "str",
          discount_amount: 1,
          expired_time: strToTime("2023-05-18 13:00:00"),
          promo_code_id: 1,
          username: "str",
          user_id: 1,
          is_vip: true,
          pic: "str",
        },
        parts: [
          {
            t_order_part_id: 1,
            product_id: 1,
            name: "str",
            pic: "str",
            price: 1,
            type_id: 1,
            type: "str",
          },
        ],
      },
    ],
    booking_payments: [
      {
        payment: {
          id: 1,
          order_id: 1,
          booking_id: 0,
          remark: "remark text...",
          filename: "receipt.jpg",
          submit_time: strToTime("2023-05-18 13:00:00"),
        },
        booking: {
          t_service_booking_id: 1,
          paid_deposit_time: strToTime("2023-05-18 13:00:00"),
          paid_fully_time: strToTime("2023-05-18 13:00:00"),
          promo_code_id: 1,
          service_id: 1,
          user_id: 1,
          user_plan_id: 1,
          username: "str",
          is_vip: true,
          user_pic: "str",
          coupon_code: "str",
          discount_amount: 1,
          expired_time: strToTime("2023-05-18 13:00:00"),
          type_id: 1,
          service_name: "str",
          service_pic: "str",
          price: 1,
          expire_time: strToTime("2023-05-18 13:00:00"),
          plan_id: 1,
          type_name: "str",
          quota: 1,
          weekly_quota: 1,
          title: "str",
        },
      },
    ],
  },
  fn(input, jwt) {
    let order_payments: Array<{
      payment: Pick<
        TPayment,
        "id" | "order_id" | "booking_id" | "remark" | "filename" | "submit_time"
      >;
      order: PaymentOrderRow;
      parts: OrderPartRow[];
    }> = [];
    let booking_payments: Array<{
      payment: Pick<
        TPayment,
        "id" | "order_id" | "booking_id" | "remark" | "filename" | "submit_time"
      >;
      booking: PaymentBookingRow;
    }> = [];

    filter(proxy.t_payment, {
      accept_time: null,
      reject_time: null,
    }).forEach((row) => {
      let payment = {
        id: row.id!,
        order_id: row.order_id,
        booking_id: row.booking_id,
        remark: row.remark,
        filename: row.filename,
        submit_time: row.submit_time,
      };
      if (row.order_id) {
        let order = select_payment_order.get({
          id: row.order_id,
        }) as PaymentOrderRow;
        let parts = select_order_parts.all({
          id: row.order_id,
        }) as OrderPartRow[];
        order_payments.push({
          payment,
          order,
          parts,
        });
      }
      if (row.booking_id) {
        let booking = select_payment_booking.get({
          id: row.booking_id,
        }) as PaymentBookingRow;
        booking_payments.push({
          payment,
          booking,
        });
      }
    });

    return {
      order_payments,
      booking_payments,
    };
  },
});

//Consumer: getOrderHistoryForConsumer
export type UserOrderRow = {
  t_shopping_order_id: number;
  checkout_time: null | number;
  full_pay_time: null | number;
  full_pay_amount: null | number;
  full_pay_deadline: null | number;
  deposit_time: null | number;
  deposit_amount: null | number;
  deposit_deadline: null | number;
  coupon_code: null | string;
  discount_amount: null | number;
  expired_time: null | number;
  promo_code_id: null | number;
};
let select_user_order = db.prepare(/* sql */ `
select
  t_shopping_order.id as t_shopping_order_id
, t_shopping_order.checkout_time
, t_shopping_order.full_pay_time
, t_shopping_order.full_pay_amount
, t_shopping_order.full_pay_deadline
, t_shopping_order.deposit_time
, t_shopping_order.deposit_amount
, t_shopping_order.deposit_deadline
, promo_code.coupon_code
, promo_code.discount_amount
, promo_code.expired_time
, promo_code.id as promo_code_id
from t_shopping_order
left join t_coupon as promo_code on promo_code.id = t_shopping_order.promo_code_id
where t_shopping_order.user_id = :user_id
  and t_shopping_order.checkout_time is not null
`);

defAPI({
  name: "getOrderHistoryForConsumer",
  role: "consumer",
  sampleInput: {},
  outputParser: object({
    orders: array(
      object({
        order: object({
          t_shopping_order_id: number(),
          checkout_time: nullable(timestamp()),
          full_pay_time: nullable(timestamp()),
          full_pay_amount: nullable(number()),
          full_pay_deadline: nullable(timestamp()),
          deposit_time: nullable(timestamp()),
          deposit_amount: nullable(number()),
          deposit_deadline: nullable(timestamp()),
          coupon_code: nullable(string()),
          discount_amount: nullable(number()),
          expired_time: nullable(timestamp()),
          promo_code_id: nullable(number()),
        }),
        parts: array(
          object({
            t_order_part_id: number(),
            product_id: number(),
            name: string(),
            pic: string(),
            price: number(),
            type_id: number(),
            type: string(),
          })
        ),
        payments: array(
          object({
            id: number(),
            remark: string(),
            submit_time: number(),
            filename: nullable(string()),
            accept_time: nullable(number()),
            reject_time: nullable(number()),
            method: nullable(string()),
            amount: nullable(number()),
          })
        ),
      })
    ),
  }),
  fn(input, jwt) {
    let orders = select_user_order.all({ user_id: jwt.id }) as UserOrderRow[];
    return {
      orders: orders.map((order) => {
        let parts = select_order_parts.all({
          id: order.t_shopping_order_id,
        }) as OrderPartRow[];
        let payments = filter(proxy.t_payment, {
          order_id: order.t_shopping_order_id,
        }) as any[];
        return { order, parts, payments };
      }),
    };
  },
});

export type OrderRowForAdmin = {
  t_shopping_order_id: number;
  checkout_time: null | number;
  full_pay_time: null | number;
  full_pay_amount: null | number;
  full_pay_deadline: null | number;
  deposit_time: null | number;
  deposit_amount: null | number;
  deposit_deadline: null | number;
  coupon_code: null | string;
  discount_amount: null | number;
  expired_time: null | number;
  promo_code_id: null | number;
  user_id: number;
  username: string;
  is_vip: boolean;
};
let select_all_order_for_admin = db.prepare(/* sql */ `
select
  t_shopping_order.id as t_shopping_order_id
, t_shopping_order.checkout_time
, t_shopping_order.full_pay_time
, t_shopping_order.full_pay_amount
, t_shopping_order.full_pay_deadline
, t_shopping_order.deposit_time
, t_shopping_order.deposit_amount
, t_shopping_order.deposit_deadline
, promo_code.coupon_code
, promo_code.discount_amount
, promo_code.expired_time
, promo_code.id as promo_code_id
, user.id as user_id
, user.username
, user.is_vip
from t_shopping_order
left join t_coupon as promo_code on promo_code.id = t_shopping_order.promo_code_id
inner join t_user as user on user.id = t_shopping_order.user_id
where t_shopping_order.checkout_time is not null
`);

//Admin: getOrderHistoryForAdmin
defAPI({
  name: "getOrderHistoryForAdmin",
  role: "admin",
  outputParser: object({
    orders: array(
      object({
        order: object({
          t_shopping_order_id: number(),
          checkout_time: nullable(number()),
          full_pay_time: nullable(number()),
          full_pay_amount: nullable(number()),
          full_pay_deadline: nullable(number()),
          deposit_time: nullable(number()),
          deposit_amount: nullable(number()),
          deposit_deadline: nullable(number()),
          coupon_code: nullable(string()),
          discount_amount: nullable(number()),
          expired_time: nullable(number()),
          promo_code_id: nullable(number()),
          user_id: number(),
          username: string(),
          is_vip: boolean(),
        }),
        parts: array(
          object({
            t_order_part_id: number(),
            product_id: number(),
            name: string(),
            pic: string(),
            price: number(),
            type_id: number(),
            type: string(),
          })
        ),
        payments: array(
          object({
            id: number(),
            remark: string(),
            submit_time: number(),
            filename: nullable(string()),
            accept_time: nullable(number()),
            reject_time: nullable(number()),
            method: nullable(string()),
            amount: nullable(number()),
          })
        ),
      })
    ),
  }),
  fn(input, jwt) {
    let orders = select_all_order_for_admin.all() as OrderRowForAdmin[];
    return {
      orders: orders.map((order) => {
        let parts = select_order_parts.all({
          id: order.t_shopping_order_id,
        }) as OrderPartRow[];
        let payments = filter(proxy.t_payment, {
          order_id: order.t_shopping_order_id,
        }) as any[];
        return { order, parts, payments };
      }),
    };
  },
});

export type PaymentOrderDetailRow = {
  order_id: null | number;
  checkout_time: null | number;
  full_pay_time: null | number;
  full_pay_amount: null | number;
  full_pay_deadline: null | number;
  deposit_time: null | number;
  deposit_amount: null | number;
  deposit_deadline: null | number;
  promo_code_id: null | number;
  user_id: number;
  coupon_code: string;
  discount_amount: null | number;
  expired_time: number;
  username: string;
  is_vip: boolean;
  pic: null | string;
};
let select_payment_order_detail = db.prepare(/* sql */ `
select
  t_payment.order_id
, t_shopping_order.checkout_time
, t_shopping_order.full_pay_time
, t_shopping_order.full_pay_amount
, t_shopping_order.full_pay_deadline
, t_shopping_order.deposit_time
, t_shopping_order.deposit_amount
, t_shopping_order.deposit_deadline
, t_shopping_order.promo_code_id
, t_shopping_order.user_id
, promo_code.coupon_code
, promo_code.discount_amount
, promo_code.expired_time
, user.username
, user.is_vip
, user.pic
from t_payment
inner join t_shopping_order on t_shopping_order.id = t_payment.order_id
left join t_coupon as promo_code on promo_code.id = t_shopping_order.promo_code_id
inner join t_user as user on user.id = t_shopping_order.user_id
where t_payment.id = ?
`);

export type PaymentOrderPartsRow = {
  product_id: number;
  name: string;
  pic: string;
  price: number;
  type_id: number;
  type: string;
};
let select_payment_order_parts = db.prepare(/* sql */ `
select
  t_order_part.product_id
, product.name
, product.pic
, product.price
, product.type_id
, type.type
from t_order_part
inner join t_product as product on product.id = t_order_part.product_id
inner join t_product_type as type on type.id = product.type_id
where t_order_part.order_id = ?
`);

export type PaymentBookingDetailRow = {
  booking_id: null | number;
  paid_deposit_time: null | number;
  paid_fully_time: null | number;
  promo_code_id: null | number;
  service_id: number;
  user_id: number;
  user_plan_id: null | number;
  username: string;
  is_vip: boolean;
  user_pic: null | string;
  coupon_code: string;
  discount_amount: number;
  expired_time: number;
  type_id: number;
  service_name: string;
  service_pic: null | string;
  price: null | number;
  expire_time: number;
  plan_id: number;
  type_name: string;
  quota: null | number;
  weekly_quota: null | number;
  title: string;
};
let select_payment_booking_detail = db.prepare(/* sql */ `
select
  t_payment.booking_id
, booking.paid_deposit_time
, booking.paid_fully_time
, booking.promo_code_id
, booking.service_id
, booking.user_id
, booking.user_plan_id
, user.username
, user.is_vip
, user.pic as user_pic
, promo_code.coupon_code
, promo_code.discount_amount
, promo_code.expired_time
, service.type_id
, service.name as service_name
, service.pic as service_pic
, service.price
, user_plan.expire_time
, user_plan.plan_id
, type.name as type_name
, plan.quota
, plan.weekly_quota
, plan.title
from t_payment
inner join t_service_booking as booking on booking.id = t_payment.booking_id
inner join t_user as user on user.id = booking.user_id
left join t_coupon as promo_code on promo_code.id = booking.promo_code_id
inner join t_service as service on service.id = booking.service_id
left join t_user_plan as user_plan on user_plan.id = booking.user_plan_id
inner join t_service_type as type on type.id = service.type_id
left join t_plan as plan on plan.id = user_plan.plan_id
where t_payment.id = ?
`);

//TODO need to test
//Admin: getPaymentDetailsByAdmin
defAPI({
  name: "getPaymentDetailsForAdmin",
  role: "admin",
  sampleInput: { payment_id: 1 },
  sampleOutput: {
    payment: {
      id: 1,
      order_id: 1,
      booking_id: 0,
      remark: "remark text...",
      filename: "receipt.jpg",
      submit_time: strToTime("2023-05-18 13:00:00"),
    },
    orders: [
      {
        order_id: 1,
        checkout_time: strToTime("2023-05-18 13:00:00"),
        full_pay_time: strToTime("2023-05-18 13:00:00"),
        full_pay_amount: 1,
        full_pay_deadline: strToTime("2023-05-18 13:00:00"),
        deposit_time: strToTime("2023-05-18 13:00:00"),
        deposit_amount: 1,
        deposit_deadline: strToTime("2023-05-18 13:00:00"),
        coupon_code: "str",
        discount_amount: 1,
        expired_time: strToTime("2023-05-18 13:00:00"),
        promo_code_id: 1,
        username: "str",
        user_id: 1,
        is_vip: true,
        pic: "str",
        parts: [
          {
            product_id: 1,
            name: "str",
            pic: "str",
            price: 1,
            type_id: 1,
            type: "str",
          },
        ],
      },
    ],
    bookings: [
      {
        booking_id: 1,
        paid_deposit_time: strToTime("2023-05-18 13:00:00"),
        paid_fully_time: strToTime("2023-05-18 13:00:00"),
        promo_code_id: 1,
        service_id: 1,
        user_id: 1,
        user_plan_id: 1,
        username: "str",
        is_vip: true,
        user_pic: "str",
        coupon_code: "str",
        discount_amount: 1,
        expired_time: strToTime("2023-05-18 13:00:00"),
        type_id: 1,
        service_name: "str",
        service_pic: "str",
        price: 1,
        expire_time: strToTime("2023-05-18 13:00:00"),
        plan_id: 1,
        type_name: "str",
        quota: 1,
        weekly_quota: 1,
        title: "str",
      },
    ],
  },
  fn(input, jwt) {
    let payment: TPayment = proxy.t_payment[input.payment_id];

    if (!payment) {
      throw new HttpError(HttpStatus.NOT_FOUND, "payment not found");
    }

    let order = select_payment_order_detail.all(
      payment.id
    ) as PaymentOrderDetailRow[];

    let bookings = select_payment_booking_detail.all(
      payment.id
    ) as PaymentBookingDetailRow[];

    return {
      payment: {
        id: payment.id!,
        order_id: payment.order_id!,
        booking_id: payment.booking_id!,
        remark: payment.remark,
        filename: payment.filename,
        submit_time: payment.submit_time,
      },
      orders: order.map((order) => ({
        ...order,
        parts: select_payment_order_parts.all(
          order.order_id
        ) as PaymentOrderPartsRow[],
      })),
      bookings,
    };
  },
});

//Admin: getServiceSetting
defAPI({
  name: "getServiceSetting",
  role: "admin",
  sampleInput: {},
  sampleOutput: {
    serviceTypes: [{ id: 1, name: "dance" }],
    services: [
      {
        id: 1,
        type_id: 1,
        name: "dance",
        quota: 12,
        pic: "1.jpg",
        duration: 30,
        price: 100,
        is_vip: false,
      },
    ],
  },
  fn() {
    return {
      serviceTypes: proxy.t_service_type.map((row) => ({
        id: row.id,
        name: row.name,
      })),
      services: proxy.t_service.map((service) => ({
        id: service.id!,
        type_id: service.type_id,
        name: service.name,
        quota: service.quota!,
        pic: service.pic!,
        duration: service.duration,
        price: service.price,
        is_vip: service.is_vip,
      })),
    };
  },
});

type AvailableServicePlan = {
  user_plan_id: number;
  plan_id: number;
  title: string;
  quota: null | number;
  weekly_quota: null | number;
  total_used: number;
  weekly_used: number;
};

let select_available_service_plan = db.prepare(/* sql */ `
with confirmed_booking as (
  select * from t_service_booking
  where booking_reject_time is null
    and booking_cancel_time is null
)
select
  t_user_plan.id as user_plan_id
, t_plan.id as plan_id
, t_plan.title
, t_plan.quota
, t_plan.weekly_quota
, (
  select count(id)
  from confirmed_booking
  where user_plan_id = t_user_plan.id
) as total_used
, (
  select count(id)
  from confirmed_booking
  where user_plan_id = t_user_plan.id
    and from_time >= :week_start_time
    and from_time <= :week_end_time
) as weekly_used
from t_user_plan
inner join t_plan on t_plan.id = t_user_plan.plan_id
left join t_service on t_service.type_id = t_plan.service_type_id
where t_plan.service_id = :service_id
   or t_service.id = :service_id
`);

//consumer: addProductToShoppingCart
defAPI({
  name: "addProductToShoppingCart",
  role: "consumer",
  sampleInput: {
    product_id: 1,
  },
  sampleOutput: { id: 1 },
  fn(input, jwt) {
    let product = proxy.t_product[input.product_id];
    if (!product)
      throw new HttpError(HttpStatus.NOT_FOUND, "product not found");

    let order_id =
      find(proxy.t_shopping_order, {
        user_id: jwt.id,
        checkout_time: null,
      })?.id ||
      proxy.t_shopping_order.push({
        user_id: jwt.id,
        promo_code_id: null,
        checkout_time: null,
        full_pay_time: null,
        full_pay_amount: null,
        full_pay_deadline: null,
        deposit_time: null,
        deposit_amount: null,
        deposit_deadline: null,
      });

    let id = proxy.t_order_part.push({
      product_id: input.product_id,
      order_id,
    });

    return { id };
  },
});

//TODO
//Consumer: getShoppingCartDataByConsumer
defAPI({
  name: "getShoppingCartDataByConsumer",
  role: "consumer",
  sampleInput: {},
  sampleOutput: {
    order_id: 1,
    selectedCouponCode: "xxx",
    availableCoupons: [
      {
        id: 1,
        coupon_code: "",
        discount_amount: 1,
        expired_time: strToTime("2023-03-08 04:30:00"),
      },
    ],
    orderParts: [
      {
        product_id: 1,
        product_name: "LOGITECH PRO X SUPERLIGHT Gaming Wireless Mice",
        pic: "product_02.jpg",
        price: 1299,
        addonProducts: [
          {
            id: 1,
            name: "product",
          },
        ],
      },
    ],
  },
  fn(input, jwt) {
    let order = find(proxy.t_shopping_order, { checkout_time: null, user_id: jwt.id });
    if (!order) {
      let id = proxy.t_shopping_order.push({
        user_id: jwt.id,
        promo_code_id: null,
        checkout_time: null,
        full_pay_time: null,
        full_pay_amount: null,
        full_pay_deadline: null,
        deposit_time: null,
        deposit_amount: null,
        deposit_deadline: null,
      })
      order = proxy.t_shopping_order[id]
    }
    return {
      order_id: order.id,
      selectedCouponCode: order.promo_code?.coupon_code || '',
      availableCoupons: !order
        ? []
        : proxy.t_coupon
          .filter((coupon) => canUseOrderCoupon(coupon, order!))
          .map((coupon) => ({
            id: coupon.id,
            coupon_code: coupon.coupon_code,
            discount_amount: coupon.discount_amount,
            expired_time: coupon.expired_time,
          })),
      orderParts: !order
        ? []
        : filter(proxy.t_order_part, { order_id: order.id! }).map((row) => {
          let product = row.product!;
          return {
            product_id: product.id,
            product_name: product.name,
            pic: product.pic,
            price: product.price,
            addonProducts: filter(proxy.t_addon_product, {
              from_product_id: row.product_id,
            }).map((addon) => ({
              id: addon.to_product_id,
              name: addon.to_product?.name,
            })),
          };
        }),
    };
  },
});

//Consumer: chooseShoppingCartCouponByConsumer
defAPI({
  name: "chooseShoppingCartCouponByConsumer",
  role: "consumer",
  sampleInput: {
    coupon_code: "xxx",
  },
  sampleOutput: {},
  fn(input, jwt) {
    const order = find(proxy.t_shopping_order, { checkout_time: null });
    if (!order)
      throw new HttpError(
        HttpStatus.NOT_ACCEPTABLE,
        "please add some products to the shopping cart first"
      );
    let coupon = find(proxy.t_coupon, { coupon_code: input.coupon_code });
    if (!coupon)
      throw new HttpError(HttpStatus.NOT_FOUND, "coupon code not matched");
    if (!canUseOrderCoupon(coupon, order))
      throw new HttpError(HttpStatus.NOT_ACCEPTABLE, "cannot use this coupon");
    order.promo_code = coupon;
    return {};
  },
});

function canUseOrderCoupon(coupon: TCoupon, order: TShoppingOrder): boolean {
  if (coupon.expired_time < Date.now()) return false;
  if (coupon.is_vip_only && !order.user?.is_vip) return false;
  if (!coupon.is_any_product) {
    let usableProducts = filter(proxy.t_coupon_product, {
      coupon_id: coupon.id!,
    });
    let cartProducts = filter(proxy.t_order_part, { order_id: order.id! });
    if (
      !usableProducts.some((p1) =>
        cartProducts.some((p2) => p2.product?.id === p1.id)
      )
    )
      return false;
  }
  return true;
}

//Consumer: removeProductFromCartByConsumer
defAPI({
  name: "removeProductFromCartByConsumer",
  role: "consumer",
  sampleInput: {
    product_id: 1,
  },
  sampleOutput: {},
  fn(input, jwt) {
    const order = find(proxy.t_shopping_order, { checkout_time: null });
    if (!order) return {};
    filter(proxy.t_order_part, {
      order_id: order.id!,
      product_id: input.product_id,
    }).forEach((row) => {
      delete proxy.t_order_part[row.id!];
    });
    return {};
  },
});

//Consumer: submitShoppingCartByConsumer
defAPI({
  name: "submitShoppingCartByConsumer",
  role: "consumer",
  sampleInput: {
    shopping_cart_id: 1,
  },
  sampleOutput: {
    checkout_time: strToTime("2023-03-08 04:30:00"),
  },
  fn(input, jwt) {
    let order = proxy.t_shopping_order[input.shopping_cart_id];
    if (!order)
      throw new HttpError(HttpStatus.NOT_FOUND, "shopping cart not found");
    if (order.user_id !== jwt.id)
      throw new HttpError(HttpStatus.FORBIDDEN, "this is not your order");

    let checkout_time = Date.now();
    order.checkout_time = checkout_time;
    return { checkout_time };
  },
});

function countServiceBooked(service_id: number): number {
  return count(proxy.t_service_booking, {
    service_id,
    booking_reject_time: null,
    booking_cancel_time: null,
  });
}

//consumer: getServiceList
defAPI({
  name: "getServiceList",
  role: "consumer",
  sampleInput: {},
  sampleOutput: {
    services: [
      {
        id: 1,
        name: "dance",
        quota: 10,
        booked: 3,
        price: 300,
        is_self_booked: false,
        type: "dance",
        pic: "1.jpg",
        duration: 30,
        providers: [{ id: 1, name: "alice" }],
        user_plans: [
          {
            user_plan_id: 1,
            plan_id: 1,
            title: "3 times per week",
            quota: 10,
            weekly_quota: 3,
            total_used: 5,
            weekly_used: 2,
          },
        ],
        addon_services: [
          {
            id: 1,
            name: "service",
          },
        ],
      },
    ],
  },
  fn(input, jwt) {
    let date = new TimezoneDate();
    date.timezone = 8;
    date.setHours(0, 0, 0, 0);
    let weekDay = date.getDay();
    let week_start_time = date.getTime() - weekDay * DAY;
    let week_end_time = week_start_time + 7 * DAY;
    return {
      services: proxy.t_service.map((service) => {
        let booked = countServiceBooked(service.id!);
        let is_self_booked = !!find(proxy.t_service_booking, {
          service_id: service.id!,
          user_id: jwt.id,
        });
        let available_service_plans = select_available_service_plan.all({
          service_id: service.id,
          week_start_time,
          week_end_time,
        }) as AvailableServicePlan[];
        return {
          id: service.id,
          name: service.name,
          quota: service.quota,
          booked,
          price: service.price,
          is_self_booked,
          type: service.type?.name,
          pic: service.pic,
          duration: service.duration,
          providers: filter(proxy.t_service_provider, {
            service_id: service.id!,
          }).map((row) => ({
            id: row.provider!.id,
            name: row.provider!.username,
          })),
          user_plans: available_service_plans,
          addon_services: filter(proxy.t_addon_service, {
            from_service_id: service.id!,
          }).map((addon) => ({
            id: addon.to_service_id,
            name: addon.to_service?.name,
          })),
        };
      }),
    };
  },
});

//Admin: saveService
defAPI({
  name: "saveService",
  role: "admin",
  sampleInput: {
    service: {
      id: 1,
      type_id: 1,
      name: "dance",
      quota: 12,
      pic: "1.jpg",
      duration: 30,
      price: 300,
      is_vip: false,
    },
  },
  sampleOutput: {
    id: 1,
  },
  fn(input, jwt) {
    let service = input.service;
    let id = service.id;
    if (id > 0) {
      proxy.t_service[id] = service;
    } else {
      delete (service as any).id;
      id = proxy.t_service.push(service);
    }
    return {
      id,
    };
  },
});

//Admin: saveServiceType
defAPI({
  name: "saveServiceType",
  role: "admin",
  inputParser: object({
    serviceType: object({ id: number(), name: string() }),
  }),
  outputParser: object({ id: id() }),
  fn(input, jwt) {
    let serviceType = proxy.t_service_type[input.serviceType.id];
    if (serviceType) {
      // update
      serviceType.name = input.serviceType.name;
      return { id: serviceType.id };
    } else {
      // insert
      let id = proxy.t_service_type.push({ name: input.serviceType.name });
      return { id };
    }
  },
});

//Admin: setDepositPaymentByAdmin
defAPI({
  name: "setDepositPaymentByAdmin",
  role: "admin",
  sampleInput: {
    shopping_cart_id: 1,
    deposit_amount: 400,
    deposit_deadline: strToTime("2023-03-08 04:30:00"),
  },
  sampleOutput: {},
  async fn(input, jwt) {
    let row = proxy.t_shopping_order[input.shopping_cart_id];
    if (!row)
      throw new HttpError(HttpStatus.NOT_FOUND, "shopping cart not found");
    (row.deposit_amount = input.deposit_amount),
      (row.deposit_deadline = input.deposit_deadline);
    return {};
  },
});

//Admin: setFullyPaymentByAdmin
defAPI({
  name: "setFullyPaymentByAdmin",
  role: "admin",
  sampleInput: {
    shopping_cart_id: 1,
    full_pay_amount: 400,
    full_pay_deadline: strToTime("2023-03-08 04:30:00"),
  },
  sampleOutput: {},
  async fn(input, jwt) {
    let row = proxy.t_shopping_order[input.shopping_cart_id];
    if (!row)
      throw new HttpError(HttpStatus.NOT_FOUND, "shopping cart not found");
    (row.deposit_amount = input.full_pay_amount),
      (row.deposit_deadline = input.full_pay_deadline);
    return {};
  },
});

function canUseServiceCoupon(
  coupon: TCoupon,
  service: TService,
  user: TUser
): boolean {
  if (coupon.expired_time < Date.now()) return false;
  if (coupon.is_vip_only && !user.is_vip) return false;
  if (!coupon.is_any_service) {
    if (
      !find(proxy.t_coupon_service, {
        coupon_id: coupon.id!,
        service_id: service.id!,
      })
    )
      return false;
  }
  return true;
}

//consumer: submitBooking
defAPI({
  name: "submitBooking",
  role: "consumer",
  sampleInput: {
    service_id: 1,
    provider_id: 1,
    from_time: strToTime("2023-05-20 14:00:00"),
    to_time: strToTime("2023-05-20 15:00:00"),
    user_plan_id: 0,
    promo_code: "xxx",
    addon_service_ids: [1, 2, 3],
  },
  sampleOutput: {
    id: 1,
  },
  async fn(input, jwt) {
    let service = proxy.t_service[input.service_id];
    if (!service)
      throw new HttpError(HttpStatus.NOT_FOUND, "service not found");
    if (service.is_vip && !jwt.is_vip)
      throw new HttpError(HttpStatus.FORBIDDEN, "This service is only for VIP");
    if (countServiceBooked(input.service_id) >= service.quota)
      throw new HttpError(
        HttpStatus.PRECONDITION_FAILED,
        "This service is fully booked"
      );

    let user = proxy.t_user[jwt.id];

    let coupon = find(proxy.t_coupon, { coupon_code: input.promo_code });
    if (coupon && !canUseServiceCoupon(coupon, service, user))
      throw new HttpError(HttpStatus.FORBIDDEN, "cannot use this coupon");

    let booking_id = proxy.t_service_booking.push({
      service_id: input.service_id,
      user_id: jwt.id,
      provider_id: input.provider_id,
      from_time: input.from_time,
      to_time: input.to_time,

      booking_submit_time: Date.now(),
      booking_accept_time: null,
      booking_reject_time: null,
      booking_cancel_time: null,

      paid_deposit_time: null,
      paid_fully_time: null,
      deposit_amount: null,
      full_pay_amount: null,
      full_pay_deadline: null,
      deposit_deadline: null,

      arrive_time: null,
      leave_time: null,

      refund_submit_time: null,
      refund_accept_time: null,
      refund_reject_time: null,
      refund_finish_time: null,

      promo_code_id: coupon?.id || null,

      user_plan_id: input.user_plan_id || null,
      remark: null,
    });
    input.addon_service_ids.forEach((service_id) => {
      proxy.t_addon_booking.push({ booking_id, service_id });
    });
    let row = proxy.t_service_booking[booking_id];
    await sendEmails(createSubmitBookingEmails(row));
    return {
      id: booking_id,
    };
  },
});

//Admin: changeBookingTimeByAdmin
defAPI({
  name: "changeBookingTimeByAdmin",
  role: "admin",
  sampleInput: {
    booking_id: 1,
    from_time: strToTime("2023-05-20 14:00:00"),
    to_time: strToTime("2023-05-20 15:00:00"),
  },
  sampleOutput: {},
  async fn(input, jwt) {
    let booking = proxy.t_service_booking[input.booking_id];
    booking.from_time = input.from_time;
    booking.to_time = input.to_time;
    await sendEmails(createRescheduledBookingByAdminEmails(booking));
    return {};
  },
});

//Admin: updateBookingRemarkByAdmin
defAPI({
  name: "updateBookingRemarkByAdmin",
  role: "admin",
  sampleInput: {
    booking_id: 1,
    remark: "testing remark",
  },
  sampleOutput: {},
  async fn(input, jwt) {
    let booking = proxy.t_service_booking[input.booking_id];
    booking.remark = input.remark;
    return {};
  },
});

//Consumer: getBookingListByConsumer
defAPI({
  name: "getBookingListByConsumer",
  role: "consumer",
  sampleInput: {},
  outputParser: object({
    bookings: array(
      object({
        id: id(),
        service: object({
          id: id(),
          name: string(),
          price: number({ min: 0 }),
        }),
        provider: object({ id: id(), name: string() }),
        from_time: timestamp(),
        to_time: timestamp(),
        booking_submit_time: timestamp(),
        booking_accept_time: nullable(timestamp()),
        booking_reject_time: nullable(timestamp()),
        paid_deposit_time: nullable(timestamp()),
        paid_fully_time: nullable(timestamp()),
        arrive_time: nullable(timestamp()),
        leave_time: nullable(timestamp()),
      })
    ),
  }),
  fn(input, jwt) {
    let consumer_id = jwt.id;
    return {
      bookings: filter(proxy.t_service_booking, { user_id: consumer_id }).map(
        (row) => ({
          id: row.id,
          service: {
            id: row.service_id,
            name: row.service!.name,
            price: row.service!.price,
          },
          provider: {
            id: row.provider_id,
            name: row.provider!.username,
          },
          from_time: row.from_time,
          to_time: row.to_time,
          booking_submit_time: row.booking_submit_time,
          booking_accept_time: row.booking_accept_time,
          booking_reject_time: row.booking_reject_time,
          paid_deposit_time: row.paid_deposit_time,
          paid_fully_time: row.paid_fully_time,
          arrive_time: row.arrive_time,
          leave_time: row.leave_time,
        })
      ),
    };
  },
});

//Consumer: GetBookingDetailsForConsumer
defAPI({
  name: "getBookingDetailsByConsumer",
  role: "consumer",
  sampleInput: { booking_id: 1 },
  outputParser: object({
    booking: object({
      id: id(),
      service: object({ id: id(), name: string(), price: number() }),
      provider: object({ id: id(), name: string() }),
      from_time: timestamp(),
      to_time: timestamp(),
      booking_submit_time: timestamp(),
      booking_accept_time: nullable(timestamp()),
      booking_reject_time: nullable(timestamp()),
      booking_cancel_time: nullable(timestamp()),
      paid_deposit_time: nullable(timestamp()),
      deposit_amount: nullable(number({ min: 0 })),
      deposit_deadline: nullable(timestamp()),
      paid_fully_time: nullable(timestamp()),
      full_pay_amount: nullable(number()),
      full_pay_deadline: nullable(timestamp()),
      arrive_time: nullable(timestamp()),
      leave_time: nullable(timestamp()),
      refund_submit_time: nullable(timestamp()),
      refund_accept_time: nullable(timestamp()),
      refund_reject_time: nullable(timestamp()),
      refund_finish_time: nullable(timestamp()),
      addon_services: array(object({ id: id(), name: string() })),
    }),
    allow_cancel_booking_time: int(),
  }),
  fn(input, jwt) {
    let row: TServiceBooking = proxy.t_service_booking[input.booking_id];
    return {
      booking: {
        id: row.id,
        service: {
          id: row.service_id,
          name: row.service!.name,
          price: row.service!.price,
        },
        provider: {
          id: row.provider_id,
          name: row.provider!.username,
        },
        from_time: row.from_time,
        to_time: row.to_time,
        booking_submit_time: row.booking_submit_time,
        booking_accept_time: row.booking_accept_time,
        booking_reject_time: row.booking_reject_time,
        booking_cancel_time: row.booking_cancel_time,
        paid_deposit_time: row.paid_deposit_time,
        deposit_amount: row.deposit_amount,
        deposit_deadline: row.deposit_deadline,
        paid_fully_time: row.paid_fully_time,
        full_pay_amount: row.full_pay_amount,
        full_pay_deadline: row.full_pay_deadline,
        arrive_time: row.arrive_time,
        leave_time: row.leave_time,
        refund_submit_time: row.refund_submit_time,
        refund_accept_time: row.refund_accept_time,
        refund_reject_time: row.refund_reject_time,
        refund_finish_time: row.refund_finish_time,
        addon_services: filter(proxy.t_addon_booking, {
          booking_id: input.booking_id,
        }).map((addon) => ({
          id: addon.service_id,
          name: addon.service?.name,
        })),
      },
      allow_cancel_booking_time:
        proxy.t_shop_setting[1].allow_cancel_booking_time,
    };
  },
});

//Consumer: changeBookingTimeByConsumer
defAPI({
  name: "changeBookingTimeByConsumer",
  role: "consumer",
  sampleInput: {
    booking_id: 1,
    from_time: strToTime("2023-05-20 14:00:00"),
    to_time: strToTime("2023-05-20 15:00:00"),
  },
  sampleOutput: {},
  async fn(input, jwt) {
    let booking = proxy.t_service_booking[input.booking_id];
    if (booking.user_id !== jwt.id)
      throw new HttpError(
        HttpStatus.FORBIDDEN,
        "Cannot change other customer's booking time"
      );
    if (booking.booking_accept_time)
      throw new HttpError(
        HttpStatus.FORBIDDEN,
        "Cannot change booking after accepted"
      );
    if (booking.booking_reject_time)
      throw new HttpError(
        HttpStatus.FORBIDDEN,
        "Cannot change booking after rejected"
      );
    booking.from_time = input.from_time;
    booking.to_time = input.to_time;
    await sendEmails(createRescheduledBookingByUserEmails(booking));
    return {};
  },
});

//Consumer: cancelBookingByConsumer
defAPI({
  name: "cancelBookingByConsumer",
  role: "consumer",
  sampleInput: {
    booking_id: 1,
  },
  sampleOutput: {
    booking_cancel_time: strToTime("2023-03-08 04:30:00"),
    refund_submit_time: strToTime("2023-03-08 04:30:00"),
  },
  async fn(input, jwt) {
    let row = proxy.t_service_booking[input.booking_id];
    if (!row) throw new HttpError(HttpStatus.NOT_FOUND, "booking not found");
    if (row.user_id !== jwt.id)
      throw new HttpError(
        HttpStatus.FORBIDDEN,
        "Cannot cancel other customer's booking"
      );
    if (Date.now() >= row.from_time - 24 * HOUR)
      throw new HttpError(
        HttpStatus.NOT_ACCEPTABLE,
        "Cannot cancel booking less than 24 hours from booked start time"
      );
    let booking_cancel_time = Date.now();
    let refund_submit_time = Date.now();
    row.booking_cancel_time = booking_cancel_time;
    row.refund_submit_time = refund_submit_time;
    row.booking_accept_time = null;
    await sendEmails(createCancelBookingEmails(row));
    return { booking_cancel_time, refund_submit_time };
  },
});

//Consumer: getProductListForConsumer
defAPI({
  name: "getProductListForConsumer",
  role: "consumer",
  sampleInput: {},
  sampleOutput: {
    product: [
      {
        id: 1,
        product_type: { id: 1, type: "screen" },
        name: "mon",
        desc: "Useful and eye-protected",
        pic: "/mrboogie_logo.jpg",
        price: 300,
      },
    ],
  },
  fn(input, jwt) {
    return {
      product: proxy.t_product.map((row) => ({
        product_type: {
          id: row.type_id,
          type: row.type!.type,
        },
        id: row.id,
        name: row.name,
        desc: row.desc,
        pic: row.pic,
        price: row.price,
      })),
    };
  },
});

// getProductList
defAPI({
  name: "getProductList",
  sampleInput: {},
  sampleOutput: {
    product: [
      {
        id: 1,
        product_type: { id: 1, type: "screen" },
        name: "mon",
        desc: "Useful and eye-protected",
        pic: "/mrboogie_logo.jpg",
        price: 300,
      },
    ],
  },
  fn(input) {
    return {
      product: proxy.t_product.map((row) => ({
        product_type: {
          id: row.type_id,
          type: row.type!.type,
        },
        id: row.id,
        name: row.name,
        desc: row.desc,
        pic: row.pic,
        price: row.price,
      })),
    };
  },
});

// getCalendarView
defAPI({
  name: "getCalendarView",
  role: "consumer",
  inputParser: object({
    service_id: id(),
    provider_id: id(),
    first_day: string({ sampleValue: "2023-04-25" }),
    range: values(["day" as const, "week" as const, "month" as const]),
  }),
  sampleOutput: {
    days: [
      {
        date: "2023-04-25",
        can_book_slots: [
          { start: "18:00", end: "19:30" },
          { start: "20:30", end: "22:00" },
        ],
        na_slots: [
          { start: "00:00", end: "18:00" },
          { start: "19:30", end: "20:30" },
          { start: "22:00", end: "24:00" },
        ],
      },
    ],
  },
  fn(input, jwt) {
    let { start_time, n_day } = countCalendarRange(
      input.first_day,
      input.range
    );
    start_time -= DAY;
    let days = Array.from({ length: n_day } as any, () => {
      start_time += DAY;
      let date = new TimezoneDate(start_time);
      let y = d2(date.getFullYear());
      let m = d2(date.getMonth() + 1);
      let d = d2(date.getDate());
      return {
        date: [y, m, d].join("-"),
        ...calcSlot({
          service_id: input.service_id,
          provider_id: input.provider_id,
          day_start_time: start_time,
        }),
      };
    });
    return { days };
  },
});

function countCalendarRange(first_day: string, range: string) {
  let date = new TimezoneDate(strToTime(first_day));
  date.timezone = 8;
  date.setHours(0, 0, 0, 0);
  switch (range) {
    case "day":
      return { start_time: date.getTime(), n_day: 1 };
    case "week":
      date.setDate(date.getDate() - date.getDay());
      return { start_time: date.getTime(), n_day: 7 };
    case "month":
      date.setDate(1);
      return {
        start_time: date.getTime(),
        n_day: countDaysInMonth(date.getTime()),
      };
    default:
      throw new HttpError(
        HttpStatus.BAD_REQUEST,
        "invalid range: should be day/week/month, got: " + range
      );
  }
}

function countDaysInMonth(time: number) {
  let date = new TimezoneDate(time);
  date.timezone = 8;
  date.setDate(1);
  let start = date.getTime();
  date.setMonth(date.getMonth() + 1);
  let end = date.getTime();
  let days = (end - start) / DAY;
  return days;
}

type SelectConfirmedBookingTimeslotRow = {
  from_time: number;
  to_time: number;
};
let select_confirmed_booking_timeslot = db.prepare(/* sql */ `
select
  from_time
, to_time
from t_service_booking
where from_time >= :day_start_time
  and to_time <= :day_end_time
  and service_id = :service_id
  and provider_id = :provider_id
  and booking_accept_time is not null
  and booking_cancel_time is null
`);

function calcSlot(input: {
  service_id: number; // e.g. 8
  provider_id: number; // e.g. 7, work hour: 6pm - 10pm
  // booked: 7:30pm - 8:30pm
  day_start_time: number; // e.g. (tue) strToTime("2023-05-23")
}) {
  let day_start_time = input.day_start_time;
  let day_end_time = day_start_time + 24 * HOUR;
  let date = new TimezoneDate(day_start_time);
  date.timezone = 8;
  let week_day = date.getDay();

  let whitelistSlots: StartEnd[] = [];
  let blacklistSlots: StartEnd[] = [];

  // black: confirmed booking
  let bookings = select_confirmed_booking_timeslot.all({
    day_start_time,
    day_end_time,
    service_id: input.service_id,
    provider_id: input.provider_id,
  }) as SelectConfirmedBookingTimeslotRow[];

  bookings.forEach((row) => {
    let date = new TimezoneDate(row.from_time);
    date.timezone = 8;
    let h = d2(date.getHours());
    let m = d2(date.getMinutes());
    let start = h + ":" + m;

    date.setTime(row.to_time);
    h = d2(date.getHours());
    m = d2(date.getMinutes());
    let end = h + ":" + m;

    blacklistSlots.push({
      start,
      end,
      quota: 1,
    });
  });

  // white: service provider working hour
  let quotas = filter(proxy.t_service_provider, {
    provider_id: input.provider_id,
    service_id: input.service_id,
  });
  let working_hrs = filter(proxy.t_provider_working_hr, {
    provider_id: input.provider_id,
    week_day,
  });
  for (let quota of quotas) {
    for (let working_hr of working_hrs) {
      whitelistSlots.push({
        start: working_hr.from_time,
        end: working_hr.to_time,
        quota: quota.booking_max,
      });
    }
  }

  let can_book_slots = compactSlots({
    whitelistSlots,
    blacklistSlots,
    interval: MINUTE,
    defaultState: "black",
  });

  let na_slots = compactSlots({
    blacklistSlots: can_book_slots,
    interval: MINUTE,
    defaultState: "white",
  });

  return { can_book_slots, na_slots };
}

/* Calendar Service (begin) */

//Admin: updateServiceBookingTimeByAdmin
defAPI({
  name: "updateServiceBookingTimeByAdmin",
  role: "admin",
  inputParser: object({ booking_id: id(), from_time: int(), to_time: int() }),
  fn(input, jwt) {
    proxy.t_service_booking[input.booking_id].from_time = input.from_time;
    proxy.t_service_booking[input.booking_id].to_time = input.to_time;
    return {};
  },
});

export type ServiceForCalendarViewRow = {
  service_id: number;
  service_name: string;
  quota: number;
  type_id: number;
  type_name: string;
  used_quota: number;
  week_day: number;
  timeslot: string;
};
let select_service_for_calendar_view = db.prepare(/* sql */ `
with service_list as (
  select
    t_service_provider.service_id
  , t_provider_working_hr.week_day
  , json_group_array(json_object('from_time', from_time, 'to_time', to_time)) as timeslot
  from t_provider_working_hr
  inner join t_service_provider on t_service_provider.provider_id = t_provider_working_hr.provider_id
  where from_time <> '' and to_time <> ''
  group by t_service_provider.service_id
         , t_provider_working_hr.week_day
)
select
  service.id as service_id
, service.name as service_name
, service.quota
, service.type_id
, type.name as type_name
, ifnull(count(booking.id),0) as used_quota
, service_list.week_day
, service_list.timeslot
from t_service as service
left join t_service_booking as booking on booking.service_id = service.id
inner join t_service_type as type on type.id = service.type_id
inner join service_list on service_list.service_id = service.id
where booking.booking_accept_time is not null
   or booking.id is null
group by service.id, service_list.week_day
`);
let timeslotParser = array(object({ from_time: string(), to_time: string() }));

//Consumer: getCalendarViewByConsumer
defAPI({
  name: "getCalendarViewByConsumer",
  role: "consumer",
  inputParser: object({
    // e.g. from 2023-05-01 (inclusive)
    from_time: int(),
    // e.g. to 2023-06-01 (exclusive)
    to_time: int(),
  }),
  sampleOutput: {
    items: [
      {
        date: "2023-05-01",
        services: [
          {
            service_id: 1,
            service_name: "IT Consultant Service",
            type_name: "IT Service",
            type_id: 1,
            quota: 12,
            used_quota: 10,
            week_day: 0,
            timeslot: [{ from_time: "09:00:00", to_time: "18:00:00" }],
          },
        ],
      },
    ],
  },
  fn(input, jwt) {
    let openWeekDays = new Set(
      filter(proxy.t_shop_working_hr, { from_time: notNull }).map(
        (row) => row.week_day
      )
    );

    let dates: TimezoneDate[] = [];

    for (let time = input.from_time; time < input.to_time; time += DAY) {
      let date = new TimezoneDate(time);
      date.timezone = 8;
      if (openWeekDays.has(date.getDay())) dates.push(date);
    }

    let serviceRows =
      select_service_for_calendar_view.all() as ServiceForCalendarViewRow[];

    let services = serviceRows.map((service) => {
      let timeslot = Array.from(
        new Map(
          timeslotParser
            .parse(JSON.parse(service.timeslot))
            .map((slot) => [slot.from_time + "-" + slot.to_time, slot])
        ).values()
      );
      return {
        ...service,
        timeslot,
      };
    });

    return {
      items: dates.map((date) => {
        let y = date.getFullYear();
        let m = format_2_digit(date.getMonth() + 1);
        let dateStr = y + "-" + m;
        let week_day = date.getDay();
        return {
          date: dateStr,
          services: services.filter((service) => service.week_day == week_day),
        };
      }),
    };
  },
});

//getServiceTypesForCalendar
defAPI({
  name: "getServiceTypesForCalendar",
  role: "consumer",
  sampleOutput: { serviceTypes: [{ id: 1, name: "IT Service" }] },
  fn(input, jwt) {
    return {
      serviceTypes: proxy.t_service_type.map((serviceType) => ({
        id: serviceType.id!,
        name: serviceType.name,
      })),
    };
  },
});

//getServicesByTypeForCalendar
defAPI({
  name: "getServicesByTypeForCalendar",
  role: "consumer",
  sampleInput: { type_id: 1 },
  sampleOutput: {
    services: [{ id: 1, name: "IT Service", booked: 2, quota: 10 }],
  },
  fn(input, jwt) {
    return {
      services: filter(proxy.t_service, { type_id: input.type_id }).map(
        (service) => ({
          id: service.id!,
          name: service.name,
          booked: countServiceBooked(service.id!),
          quota: service.quota,
        })
      ),
    };
  },
});

//getProvidersByServiceForCalendar
defAPI({
  name: "getProvidersByServiceForCalendar",
  role: "consumer",
  sampleInput: { service_id: 1 },
  sampleOutput: { providers: [{ id: 1, name: "Alice" }] },
  fn(input, jwt) {
    return {
      providers: filter(proxy.t_service_provider, {
        service_id: input.service_id,
      }).map((row) => ({ id: row.provider_id, name: row.provider?.username })),
    };
  },
});

/* Calendar Service (end) */

/* email template */
defAPI({
  name: "getEmailTemplatesForAdmin",
  role: "admin",
  outputParser: object({
    templates: array(
      object({
        id: id(),
        name_en: string(),
        name_zh: string(),
        variables: array(string()),
        content: string(),
        default_content: string(),
      })
    ),
  }),
  fn(input, jwt) {
    return {
      templates: proxy.t_email_template.map((template) => ({
        id: template.id!,
        name_en: template.name_en,
        name_zh: template.name_zh,
        variables: template.variables
          .split(",")
          .filter((variable) => variable.length > 0),
        content: template.content || template.default_content,
        default_content: template.default_content,
      })),
    };
  },
});

// Admin: resetEmailTemplateForAdmin
defAPI({
  name: "resetEmailTemplateForAdmin",
  role: "admin",
  inputParser: object({
    id: id(),
  }),
  fn(input, jwt) {
    let template = proxy.t_email_template[input.id];
    if (!template) throw new HttpError(404, "Template not found");
    template.content = null;
    return {};
  },
});

// Admin: updateEmailTemplateForAdmin
defAPI({
  name: "updateEmailTemplateForAdmin",
  role: "admin",
  inputParser: object({
    id: id(),
    content: string(),
  }),
  fn(input, jwt) {
    let template = proxy.t_email_template[input.id];
    if (!template) throw new HttpError(404, "Template not found");
    if (template.variables) {
      for (let key of template.variables.split(",")) {
        if (!input.content.includes(`{${key}}`)) {
          throw new HttpError(400, `missing variable: {${key}}`);
        }
      }
    }
    template.content = input.content;
    return {};
  },
});

export type EventsForCalendarByAdminRow = {
  t_service_booking_id: number;
  service_id: number;
  provider_id: number;
  user_id: number;
  t_service_booking_from_time: number;
  t_service_booking_to_time: number;
  service_name: string;
  color: string;
  provider_username: string;
  user_username: string;
};

let select_events_for_calendar_by_admin = db.prepare(/* sql */ `
select
  t_service_booking.id as t_service_booking_id
, t_service_booking.service_id
, t_service_booking.provider_id
, t_service_booking.user_id
, t_service_booking.from_time as t_service_booking_from_time
, t_service_booking.to_time as t_service_booking_to_time
, service.name as service_name
, provider.color
, provider.username as provider_username
, user.username as user_username
from t_service_booking
inner join t_service as service on service.id = t_service_booking.service_id
inner join t_user as provider on provider.id = t_service_booking.provider_id
inner join t_user as user on user.id = t_service_booking.user_id
where booking_accept_time is not null
  and from_time >= :first_time
  and to_time < :last_time
`);

// Admin: getEventsForCalendarByAdmin
defAPI({
  name: "getEventsForCalendarByAdmin",
  role: "admin",
  inputParser: object({
    first_time: number(),
    last_time: number(),
  }),
  outputParser: object({
    events: array(
      object({
        t_service_booking_id: number(),
        service_id: number(),
        provider_id: number(),
        user_id: number(),
        t_service_booking_from_time: number(),
        t_service_booking_to_time: number(),
        service_name: string(),
        color: string(),
        provider_username: string(),
        user_username: string(),
      })
    ),
  }),
  fn(input, jwt) {
    let events = select_events_for_calendar_by_admin.all({
      first_time: input.first_time,
      last_time: input.last_time,
    }) as EventsForCalendarByAdminRow[];
    return { events };
  },
});

export type EventsForCalendarByConsumerRow = {
  t_service_booking_id: number;
  service_id: number;
  provider_id: number;
  user_id: number;
  t_service_booking_from_time: number;
  t_service_booking_to_time: number;
  t_check_in_time: number;
  t_check_out_time: number;
  service_name: string;
  provider_username: string;
  user_username: string;
};

let select_events_for_calendar_by_consumer = db.prepare(/* sql */ `
select
  t_service_booking.id as t_service_booking_id
, t_service_booking.service_id
, t_service_booking.provider_id
, t_service_booking.user_id
, t_service_booking.from_time as t_service_booking_from_time
, t_service_booking.to_time as t_service_booking_to_time
, t_service_booking.arrive_time as t_check_in_time
, t_service_booking.leave_time as t_check_out_time
, service.name as service_name
, provider.username as provider_username
, user.username as user_username
from t_service_booking
inner join t_service as service on service.id = t_service_booking.service_id
inner join t_user as provider on provider.id = t_service_booking.provider_id
inner join t_user as user on user.id = t_service_booking.user_id
where t_service_booking.user_id = :user_id
`);

// Consumer: getEventsForCalendarByConsumer
defAPI({
  name: "getEventsForCalendarByConsumer",
  role: "consumer",
  inputParser: object({
    show_finished_only: boolean(),
  }),
  outputParser: object({
    events: array(
      object({
        t_service_booking_id: number(),
        service_id: number(),
        provider_id: number(),
        user_id: number(),
        t_service_booking_from_time: number(),
        t_service_booking_to_time: number(),
        t_check_in_time: nullable(number()),
        t_check_out_time: nullable(number()),
        service_name: string(),
        provider_username: string(),
        user_username: string(),
      })
    ),
  }),
  fn(input, jwt) {
    let events = select_events_for_calendar_by_consumer.all({
      user_id: jwt.id,
    }) as EventsForCalendarByConsumerRow[];
    if (input.show_finished_only) {
      events = events.filter((event) => event.t_check_out_time);
    }
    return { events };
  },
});

// copy-paste this into new API
defAPI({
  name: "demo",
  sampleInput: {},
  sampleOutput: {},
  // fn(input) {
  //   return {};
  // },
});

//******When deploy, the env need to change to production
if (env.NODE_ENV === "development") {
  core.saveSDK();
}
