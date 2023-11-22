import { proxySchema } from 'better-sqlite3-proxy'
import { db } from './db'

export type TUser = {
  id?: number | null
  username: string
  password_hash: string
  email: string
  role: ('super_admin' | 'admin' | 'service_provider' | 'consumer')
  is_vip: boolean
  pic: string | null
  phone: string | null
  delete_time: number | null
  original_email: string | null
  color: string | null
}

export type TServiceType = {
  id?: number | null
  name: string
}

export type TService = {
  id?: number | null
  type_id: number
  type?: TServiceType
  name: string
  quota: number
  pic: string | null
  duration: number
  price: number
  is_vip: boolean | null
}

export type TProviderWorkingHr = {
  id?: number | null
  provider_id: number
  provider?: TUser
  week_day: number
  from_time: string
  to_time: string
}

export type TServiceProvider = {
  id?: number | null
  provider_id: number
  provider?: TUser
  service_id: number
  service?: TService
  booking_max: number
}

export type TShopWorkingHr = {
  id?: number | null
  week_day: number
  from_time: string | null
  to_time: string | null
}

export type TSpecialRest = {
  id?: number | null
  remark: string
  from_time: number
  to_time: number
}

export type TCoupon = {
  id?: number | null
  coupon_code: string
  discount_amount: number
  expired_time: number
  is_any_product: boolean | null
  is_any_service: boolean | null
  is_vip_only: boolean | null
  quota: number | null
}

export type TEvent = {
  id?: number | null
  name: string
  remark: string
  quota: number | null
  cancel_time: number | null
}

export type TShopSetting = {
  id?: number | null
  ppl_max: number
  break_unit: number
  rest_remark: string
  remind_booking_interval: number | null
  allow_cancel_booking_time: number | null
}

export type TPlan = {
  id?: number | null
  service_id: number | null
  service?: TService
  service_type_id: number | null
  service_type?: TServiceType
  weekly_quota: number | null
  quota: number | null
  expire_month: number | null
  desc: string
  title: string
  price: number | null
  cancel_time: number | null
}

export type TCouponService = {
  id?: number | null
  coupon_id: number
  coupon?: TCoupon
  service_id: number
  service?: TService
}

export type TProductType = {
  id?: number | null
  type: string
}

export type TUserPlan = {
  id?: number | null
  user_id: number
  user?: TUser
  plan_id: number
  plan?: TPlan
  expire_time: number
  payment_time: number | null
}

export type TServiceBooking = {
  id?: number | null
  user_id: number
  user?: TUser
  service_id: number
  service?: TService
  provider_id: number
  provider?: TUser
  promo_code_id: number | null
  promo_code?: TCoupon
  from_time: number
  to_time: number
  booking_submit_time: number
  booking_accept_time: number | null
  booking_reject_time: number | null
  booking_cancel_time: number | null
  paid_deposit_time: number | null
  paid_fully_time: number | null
  full_pay_amount: number | null
  deposit_amount: number | null
  full_pay_deadline: number | null
  deposit_deadline: number | null
  arrive_time: number | null
  leave_time: number | null
  refund_submit_time: number | null
  refund_accept_time: number | null
  refund_reject_time: number | null
  refund_finish_time: number | null
  user_plan_id: number | null
  user_plan?: TUserPlan
  remark: string | null
}

export type TProduct = {
  id?: number | null
  type_id: number
  type?: TProductType
  name: string
  desc: string
  pic: string
  price: number
  is_vip: boolean | null
}

export type TCouponProduct = {
  id?: number | null
  coupon_id: number
  coupon?: TCoupon
  product_id: number
  product?: TProduct
}

export type TShoppingOrder = {
  id?: number | null
  user_id: number
  user?: TUser
  promo_code_id: number | null
  promo_code?: TCoupon
  checkout_time: number | null
  full_pay_time: number | null
  full_pay_amount: number | null
  full_pay_deadline: number | null
  deposit_time: number | null
  deposit_amount: number | null
  deposit_deadline: number | null
}

export type TPayment = {
  id?: number | null
  remark: string
  submit_time: number
  filename: string | null
  stripe_id: string | null
  accept_time: number | null
  reject_time: number | null
  method: string | null
  amount: number | null
  order_id: number | null
  order?: TShoppingOrder
  booking_id: number | null
  booking?: TServiceBooking
}

export type TOrderPart = {
  id?: number | null
  product_id: number
  product?: TProduct
  order_id: number
  order?: TShoppingOrder
}

export type TAddonService = {
  id?: number | null
  from_service_id: number
  from_service?: TService
  to_service_id: number
  to_service?: TService
}

export type TRemindBooking = {
  id?: number | null
  user_id: number
  user?: TUser
  notice_time: number
}

export type TAddonBooking = {
  id?: number | null
  service_id: number
  service?: TService
  booking_id: number
  booking?: TServiceBooking
}

export type TAddonProduct = {
  id?: number | null
  from_product_id: number
  from_product?: TProduct
  to_product_id: number
  to_product?: TProduct
}

export type TAddonOrder = {
  id?: number | null
  product_id: number
  product?: TProduct
  shopping_order_id: number
  shopping_order?: TShoppingOrder
}

export type TEmailTemplate = {
  id?: number | null
  name_en: string | null
  name_zh: string | null
  content: string | null
  default_content: string
  variables: string
}

export type TNotice = {
  id?: number | null
  title: string
  content: string
  publish_time: number | null
}

export type DBProxy = {
  t_user: TUser[]
  t_service_type: TServiceType[]
  t_service: TService[]
  t_provider_working_hr: TProviderWorkingHr[]
  t_service_provider: TServiceProvider[]
  t_shop_working_hr: TShopWorkingHr[]
  t_special_rest: TSpecialRest[]
  t_coupon: TCoupon[]
  t_event: TEvent[]
  t_shop_setting: TShopSetting[]
  t_plan: TPlan[]
  t_coupon_service: TCouponService[]
  t_product_type: TProductType[]
  t_user_plan: TUserPlan[]
  t_service_booking: TServiceBooking[]
  t_product: TProduct[]
  t_coupon_product: TCouponProduct[]
  t_shopping_order: TShoppingOrder[]
  t_payment: TPayment[]
  t_order_part: TOrderPart[]
  t_addon_service: TAddonService[]
  t_remind_booking: TRemindBooking[]
  t_addon_booking: TAddonBooking[]
  t_addon_product: TAddonProduct[]
  t_addon_order: TAddonOrder[]
  t_email_template: TEmailTemplate[]
  t_notice: TNotice[]
}

export let proxy = proxySchema<DBProxy>({
  db,
  tableFields: {
    t_user: [],
    t_service_type: [],
    t_service: [
      /* foreign references */
      ['type', { field: 'type_id', table: 't_service_type' }],
    ],
    t_provider_working_hr: [
      /* foreign references */
      ['provider', { field: 'provider_id', table: 't_user' }],
    ],
    t_service_provider: [
      /* foreign references */
      ['provider', { field: 'provider_id', table: 't_user' }],
      ['service', { field: 'service_id', table: 't_service' }],
    ],
    t_shop_working_hr: [],
    t_special_rest: [],
    t_coupon: [],
    t_event: [],
    t_shop_setting: [],
    t_plan: [
      /* foreign references */
      ['service', { field: 'service_id', table: 't_service' }],
      ['service_type', { field: 'service_type_id', table: 't_service_type' }],
    ],
    t_coupon_service: [
      /* foreign references */
      ['coupon', { field: 'coupon_id', table: 't_coupon' }],
      ['service', { field: 'service_id', table: 't_service' }],
    ],
    t_product_type: [],
    t_user_plan: [
      /* foreign references */
      ['user', { field: 'user_id', table: 't_user' }],
      ['plan', { field: 'plan_id', table: 't_plan' }],
    ],
    t_service_booking: [
      /* foreign references */
      ['user', { field: 'user_id', table: 't_user' }],
      ['service', { field: 'service_id', table: 't_service' }],
      ['provider', { field: 'provider_id', table: 't_user' }],
      ['promo_code', { field: 'promo_code_id', table: 't_coupon' }],
      ['user_plan', { field: 'user_plan_id', table: 't_user_plan' }],
    ],
    t_product: [
      /* foreign references */
      ['type', { field: 'type_id', table: 't_product_type' }],
    ],
    t_coupon_product: [
      /* foreign references */
      ['coupon', { field: 'coupon_id', table: 't_coupon' }],
      ['product', { field: 'product_id', table: 't_product' }],
    ],
    t_shopping_order: [
      /* foreign references */
      ['user', { field: 'user_id', table: 't_user' }],
      ['promo_code', { field: 'promo_code_id', table: 't_coupon' }],
    ],
    t_payment: [
      /* foreign references */
      ['order', { field: 'order_id', table: 't_shopping_order' }],
      ['booking', { field: 'booking_id', table: 't_service_booking' }],
    ],
    t_order_part: [
      /* foreign references */
      ['product', { field: 'product_id', table: 't_product' }],
      ['order', { field: 'order_id', table: 't_shopping_order' }],
    ],
    t_addon_service: [
      /* foreign references */
      ['from_service', { field: 'from_service_id', table: 't_service' }],
      ['to_service', { field: 'to_service_id', table: 't_service' }],
    ],
    t_remind_booking: [
      /* foreign references */
      ['user', { field: 'user_id', table: 't_user' }],
    ],
    t_addon_booking: [
      /* foreign references */
      ['service', { field: 'service_id', table: 't_service' }],
      ['booking', { field: 'booking_id', table: 't_service_booking' }],
    ],
    t_addon_product: [
      /* foreign references */
      ['from_product', { field: 'from_product_id', table: 't_product' }],
      ['to_product', { field: 'to_product_id', table: 't_product' }],
    ],
    t_addon_order: [
      /* foreign references */
      ['product', { field: 'product_id', table: 't_product' }],
      ['shopping_order', { field: 'shopping_order_id', table: 't_shopping_order' }],
    ],
    t_email_template: [],
    t_notice: [],
  },
})
