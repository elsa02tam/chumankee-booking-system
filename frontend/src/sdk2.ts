import { ApiService } from './app/api.service'

export let api_origin = 'https://chumankee.xyz/api'

let store = typeof window == 'undefined' ? null : localStorage

let token = store?.getItem('token')

export function getToken() {
  return token
}

export function clearToken() {
  token = null
  store?.removeItem('token')
}

function post(url: string, body: object, token_?: string) {
  return fetch(api_origin + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token_
    },
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .catch(err => ({ error: String(err) }))
    .then(json => {
      if (json.error) {
        return Promise.reject(json.error)
      }
      if (json.token) {
        token = json.token as string
        store?.setItem('token', token)
      }
      if (!url.includes('get')) {
        ApiService.instance?.triggerUpdate()
      }
      return json
    })
}

export type LoginInput = {
  loginId: string;
  password: string;
}
export type LoginOutput = {
  token: string;
}
export function login(input: LoginInput): Promise<LoginOutput & { error?: string }> {
	return post('/login', input)
}

export type LoginWithFacebookInput = {
  loginId: string;
  password: string;
}
export type LoginWithFacebookOutput = {
  token: string;
}
export function loginWithFacebook(input: LoginWithFacebookInput): Promise<LoginWithFacebookOutput & { error?: string }> {
	return post('/loginWithFacebook', input)
}

export type RegisterInput = {
  username: string;
  phone: string;
  email: string;
  password: string;
}
export type RegisterOutput = {
  token: string;
}
export function register(input: RegisterInput): Promise<RegisterOutput & { error?: string }> {
	return post('/register', input)
}

export type CreateUserByAdminInput = {
  username: string;
  phone: string;
  email: string;
  password: string;
}
export type CreateUserByAdminOutput = {
}
export function createUserByAdmin(input: CreateUserByAdminInput): Promise<CreateUserByAdminOutput & { error?: string }> {
	return post('/createUserByAdmin', input)
}

export type DeleteAccountInput = {
}
export type DeleteAccountOutput = {
}
export function deleteAccount(input: DeleteAccountInput & { token: string }): Promise<DeleteAccountOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/deleteAccount', body, token)
}

export type GetServiceProviderProfileInput = {
}
export type GetServiceProviderProfileOutput = {
  profile: {
    id: number;
    username: string;
    email: string;
    role: string;
    is_vip: boolean;
    phone: string;
    pic: string | null;
  };
  shopSetting: Array<{
    rest_remark: string;
  }>;
  serviceTimes: Array<{
    week_day: number;
    from_time: string;
    to_time: string;
  }>;
  services: Array<{
    booking_max: number;
    service_name: string;
    service_id: number;
  }>;
}
export function getServiceProviderProfile(input: GetServiceProviderProfileInput & { token: string }): Promise<GetServiceProviderProfileOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getServiceProviderProfile', body, token)
}

export type GetConsumerProfileInput = {
}
export type GetConsumerProfileOutput = {
  profile: {
    id: number;
    username: string;
    email: string;
    role: string;
    is_vip: boolean;
    phone: string;
    pic: string | null;
  };
}
export function getConsumerProfile(input: GetConsumerProfileInput & { token: string }): Promise<GetConsumerProfileOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getConsumerProfile', body, token)
}

export type GetBookingListsByServiceProviderInput = {
}
export type GetBookingListsByServiceProviderOutput = {
  booking: Array<{
    user: {
      id: number;
      username: string;
    };
    service: {
      id: number;
      name: string;
    };
    from_time: number;
    to_time: number;
    booking_submit_time: number | null;
    booking_accept_time: number | null;
    booking_reject_time: number | null;
    booking_cancel_time: number | null;
    arrive_time: number | null;
    leave_time: number | null;
  }>;
}
export function getBookingListsByServiceProvider(input: GetBookingListsByServiceProviderInput & { token: string }): Promise<GetBookingListsByServiceProviderOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getBookingListsByServiceProvider', body, token)
}

export type GetBookingListsByAdminInput = {
}
export type GetBookingListsByAdminOutput = {
  booking: Array<{
    id: number;
    user: {
      id: number;
      username: string;
    };
    service: {
      id: number;
      name: string;
      quota: number;
    };
    from_time: number;
    to_time: number;
    booking_submit_time: number | null;
    booking_accept_time: number | null;
    booking_reject_time: number | null;
    booking_cancel_time: number | null;
    paid_deposit_time: number | null;
    paid_fully_time: number | null;
    refund_submit_time: number | null;
  }>;
}
export function getBookingListsByAdmin(input: GetBookingListsByAdminInput & { token: string }): Promise<GetBookingListsByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getBookingListsByAdmin', body, token)
}

export type GetBookingDetailsByAdminInput = {
  booking_id: number | null;
}
export type GetBookingDetailsByAdminOutput = {
  booking: {
    id: number;
    user: {
      id: number;
      username: string;
    };
    service: {
      id: number;
      name: string;
      quota: number;
    };
    service_provider: {
      id: number;
      name: string;
    };
    from_time: number;
    to_time: number;
    booking_submit_time: number | null;
    booking_accept_time: number | null;
    booking_reject_time: number | null;
    booking_cancel_time: number | null;
    paid_deposit_time: number | null;
    paid_fully_time: number | null;
    arrive_time: number | null;
    leave_time: number | null;
    refund_submit_time: number | null;
    refund_accept_time: number | null;
    refund_reject_time: number | null;
    refund_finish_time: number | null;
    deposit_deadline: number | null;
    deposit_amount: number | null;
    full_pay_deadline: number | null;
    full_pay_amount: number | null;
    remark: string;
  };
}
export function getBookingDetailsByAdmin(input: GetBookingDetailsByAdminInput & { token: string }): Promise<GetBookingDetailsByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getBookingDetailsByAdmin', body, token)
}

export type RequestOrderPaymentByAdminInput = {
  order_id: number
  full_pay_amount: number
  full_pay_deadline: number
  deposit_amount: number
  deposit_deadline: number
}
export type RequestOrderPaymentByAdminOutput = {
}
export function requestOrderPaymentByAdmin(input: RequestOrderPaymentByAdminInput & { token: string }): Promise<RequestOrderPaymentByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/requestOrderPaymentByAdmin', body, token)
}

export type AcceptBookingByAdminInput = {
  booking_id: number
  full_pay_amount: number
  full_pay_deadline: number
  deposit_amount: number
  deposit_deadline: number
}
export type AcceptBookingByAdminOutput = {
  booking_accept_time: number | null;
}
export function acceptBookingByAdmin(input: AcceptBookingByAdminInput & { token: string }): Promise<AcceptBookingByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/acceptBookingByAdmin', body, token)
}

export type RejectBookingByAdminInput = {
  booking_id: number | null;
}
export type RejectBookingByAdminOutput = {
  booking_reject_time: number | null;
}
export function rejectBookingByAdmin(input: RejectBookingByAdminInput & { token: string }): Promise<RejectBookingByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/rejectBookingByAdmin', body, token)
}

export type PromoteCouponCodeEmailByAdminInput = {
  coupon_id: number;
  email: string;
}
export type PromoteCouponCodeEmailByAdminOutput = {
}
export function promoteCouponCodeEmailByAdmin(input: PromoteCouponCodeEmailByAdminInput & { token: string }): Promise<PromoteCouponCodeEmailByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/promoteCouponCodeEmailByAdmin', body, token)
}

export type ReceiveBookingPaymeByAdminInput = {
  booking_id: number | null;
  pay_for: string;
  received_amount: number | null;
}
export type ReceiveBookingPaymeByAdminOutput = {
  payment_id: number;
  submit_time: number | null;
}
export function receiveBookingPaymeByAdmin(input: ReceiveBookingPaymeByAdminInput & { token: string }): Promise<ReceiveBookingPaymeByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/receiveBookingPaymeByAdmin', body, token)
}

export type ReceiveOrderPaymeByAdminInput = {
  order_id: number;
  pay_for: string;
  received_amount: number | null;
}
export type ReceiveOrderPaymeByAdminOutput = {
  payment_id: number;
  submit_time: number | null;
}
export function receiveOrderPaymeByAdmin(input: ReceiveOrderPaymeByAdminInput & { token: string }): Promise<ReceiveOrderPaymeByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/receiveOrderPaymeByAdmin', body, token)
}

export type RequestStripePaymentByConsumerInput = {
  order_id?: number
  booking_id?: number
  pay_for: "deposit" | "full-pay"
}
export type RequestStripePaymentByConsumerOutput = {
  payment_url: string;
}
export function requestStripePaymentByConsumer(input: RequestStripePaymentByConsumerInput & { token: string }): Promise<RequestStripePaymentByConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/requestStripePaymentByConsumer', body, token)
}

export type CheckInBookingByAdminInput = {
  booking_id: number | null;
}
export type CheckInBookingByAdminOutput = {
  arrive_time: number | null;
}
export function checkInBookingByAdmin(input: CheckInBookingByAdminInput & { token: string }): Promise<CheckInBookingByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/checkInBookingByAdmin', body, token)
}

export type CheckOutBookingByAdminInput = {
  booking_id: number | null;
}
export type CheckOutBookingByAdminOutput = {
  leave_time: number | null;
}
export function checkOutBookingByAdmin(input: CheckOutBookingByAdminInput & { token: string }): Promise<CheckOutBookingByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/checkOutBookingByAdmin', body, token)
}

export type GetNoticeListForConsumerInput = {
}
export type GetNoticeListForConsumerOutput = {
  notice: Array<{
    id: number;
    title: string;
    content: string;
    publish_time: number | null;
  }>;
}
export function getNoticeListForConsumer(input: GetNoticeListForConsumerInput & { token: string }): Promise<GetNoticeListForConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getNoticeListForConsumer', body, token)
}

export type GetNoticeListForAdminInput = {
}
export type GetNoticeListForAdminOutput = {
  notice: Array<{
    id: number;
    title: string;
    content: string;
    publish_time: number | null;
  }>;
}
export function getNoticeListForAdmin(input: GetNoticeListForAdminInput & { token: string }): Promise<GetNoticeListForAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getNoticeListForAdmin', body, token)
}

export type SaveNoticeByAdminInput = {
  notice: {
    id: number;
    title: string;
    content: string;
    publish_time: number | null;
  };
}
export type SaveNoticeByAdminOutput = {
  id: number;
}
export function saveNoticeByAdmin(input: SaveNoticeByAdminInput & { token: string }): Promise<SaveNoticeByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/saveNoticeByAdmin', body, token)
}

export type DeleteNoticeByAdminInput = {
  notice_id: number;
}
export type DeleteNoticeByAdminOutput = {
}
export function deleteNoticeByAdmin(input: DeleteNoticeByAdminInput & { token: string }): Promise<DeleteNoticeByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/deleteNoticeByAdmin', body, token)
}

export type GetPlanListForAdminInput = {
}
export type GetPlanListForAdminOutput = {
  plans: Array<{
    id: number;
    service_id: number;
    service_type_id: number;
    weekly_quota: number;
    quota: number;
    expire_month: number;
    desc: string;
    title: string;
    price: number;
    cancel_time: number | null;
  }>;
  service_types: Array<{
    id: number;
    name: string;
  }>;
  services: Array<{
    id: number;
    name: string;
  }>;
}
export function getPlanListForAdmin(input: GetPlanListForAdminInput & { token: string }): Promise<GetPlanListForAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getPlanListForAdmin', body, token)
}

export type GetPlanListForConsumerInput = {
}
export type GetPlanListForConsumerOutput = {
  plans: Array<{
    user_plan_id: number;
    user_plan_expire_time: number | null;
    user_plan_payment_time: number | null;
    plan_id: number;
    service_id: number;
    service_name: string;
    service_type_id: number;
    service_type_name: string;
    weekly_quota: number;
    used_weekly_quota: number;
    quota: number;
    used_quota: number;
    expire_month: number;
    desc: string;
    title: string;
    price: number;
  }>;
}
export function getPlanListForConsumer(input: GetPlanListForConsumerInput & { token: string }): Promise<GetPlanListForConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getPlanListForConsumer', body, token)
}

export type SavePlanInput = {
  plan: {
    id: number;
    service_id: number;
    service_type_id: number;
    weekly_quota: number;
    quota: number;
    expire_month: number;
    desc: string;
    title: string;
    price: number;
    cancel_time: number | null;
  };
}
export type SavePlanOutput = {
  id: number;
}
export function savePlan(input: SavePlanInput & { token: string }): Promise<SavePlanOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/savePlan', body, token)
}

export type GetAddonServiceListByAdminInput = {
}
export type GetAddonServiceListByAdminOutput = {
  services: Array<{
    id: number;
    name: string;
  }>;
  addon_services: Array<{
    from_service_id: number;
    to_service_id: number;
  }>;
}
export function getAddonServiceListByAdmin(input: GetAddonServiceListByAdminInput & { token: string }): Promise<GetAddonServiceListByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getAddonServiceListByAdmin', body, token)
}

export type SaveAddonServiceByAdminInput = {
  addon_services: Array<{
    from_service_id: number
    to_service_id: number
  }>
}
export type SaveAddonServiceByAdminOutput = {
}
export function saveAddonServiceByAdmin(input: SaveAddonServiceByAdminInput & { token: string }): Promise<SaveAddonServiceByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/saveAddonServiceByAdmin', body, token)
}

export type GetAddonProductListByAdminInput = {
}
export type GetAddonProductListByAdminOutput = {
  products: Array<{
    id: number;
    name: string;
  }>;
  addon_products: Array<{
    from_product_id: number;
    to_product_id: number;
  }>;
}
export function getAddonProductListByAdmin(input: GetAddonProductListByAdminInput & { token: string }): Promise<GetAddonProductListByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getAddonProductListByAdmin', body, token)
}

export type SaveAddonProductByAdminInput = {
  addon_products: Array<{
    from_product_id: number
    to_product_id: number
  }>
}
export type SaveAddonProductByAdminOutput = {
}
export function saveAddonProductByAdmin(input: SaveAddonProductByAdminInput & { token: string }): Promise<SaveAddonProductByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/saveAddonProductByAdmin', body, token)
}

export type GetEventListInput = {
}
export type GetEventListOutput = {
  events: Array<{
    id: number;
    name: string;
    remark: string;
    quota: number;
    cancel_time: number | null;
  }>;
}
export function getEventList(input: GetEventListInput & { token: string }): Promise<GetEventListOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getEventList', body, token)
}

export type GetCouponListByAdminInput = {
}
export type GetCouponListByAdminOutput = {
  services: Array<{
    id: number;
    service_name: string;
    type_name: string;
  }>;
  products: Array<{
    id: number;
    product_name: string;
    type_name: string;
  }>;
  coupons: Array<{
    id: number;
    coupon_code: string;
    quota: number;
    discount_amount: number | null;
    expired_time: number | null;
    is_any_product: boolean;
    is_any_service: boolean;
    is_vip_only: boolean;
    service_ids: Array<number>;
    product_ids: Array<number>;
  }>;
}
export function getCouponListByAdmin(input: GetCouponListByAdminInput & { token: string }): Promise<GetCouponListByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getCouponListByAdmin', body, token)
}

export type SaveCouponByAdminInput = {
  coupon: {
    id: number;
    coupon_code: string;
    quota: number;
    discount_amount: number | null;
    expired_time: number | null;
    is_any_product: boolean;
    is_any_service: boolean;
    is_vip_only: boolean;
    service_ids: Array<number>;
    product_ids: Array<number>;
  };
}
export type SaveCouponByAdminOutput = {
  id: number;
}
export function saveCouponByAdmin(input: SaveCouponByAdminInput & { token: string }): Promise<SaveCouponByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/saveCouponByAdmin', body, token)
}

export type GetCouponDetailsByAdminInput = {
  coupon_id: number;
}
export type GetCouponDetailsByAdminOutput = {
  coupon: {
    id: number;
    coupon_code: string;
    discount_amount: number | null;
    expired_time: number | null;
    is_any_product: boolean;
    is_any_service: boolean;
    is_vip_only: boolean;
    services: Array<{
      id: number;
      service_name: string;
      type_name: string;
    }>;
    products: Array<{
      id: number;
      product_name: string;
    }>;
  };
}
export function getCouponDetailsByAdmin(input: GetCouponDetailsByAdminInput & { token: string }): Promise<GetCouponDetailsByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getCouponDetailsByAdmin', body, token)
}

export type SaveEventInput = {
  event: {
    id: number;
    name: string;
    remark: string;
    quota: number;
    cancel_time: number | null;
  };
}
export type SaveEventOutput = {
  id: number;
}
export function saveEvent(input: SaveEventInput & { token: string }): Promise<SaveEventOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/saveEvent', body, token)
}

export type GetUserListForSuperAdminInput = {
}
export type GetUserListForSuperAdminOutput = {
  users: Array<{
    id: number
    username: string
    email: string
    role: "super_admin" | "admin" | "service_provider" | "consumer"
  }>
}
export function getUserListForSuperAdmin(input: GetUserListForSuperAdminInput & { token: string }): Promise<GetUserListForSuperAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getUserListForSuperAdmin', body, token)
}

export type GetUserListForAdminInput = {
}
export type GetUserListForAdminOutput = {
  users: Array<{
    id: number
    username: string
    email: string
    role: "super_admin" | "admin" | "service_provider" | "consumer"
    is_vip: boolean
    color: string
  }>
}
export function getUserListForAdmin(input: GetUserListForAdminInput & { token: string }): Promise<GetUserListForAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getUserListForAdmin', body, token)
}

export type GetUserDetailsForAdminInput = {
  user_id: number;
}
export type GetUserDetailsForAdminOutput = {
  userDetails: {
    id: number;
    username: string;
    email: string;
    pic: string | null;
    role: string;
    phone: string;
    is_vip: boolean;
  };
  restTime: {
    rest_remark: string;
  };
  services: Array<{
    id: number;
    service_name: string;
    type_name: string;
    quota: number;
  }>;
  providerWorkingTime: Array<{
    provider_id: number;
    week_day: number;
    from_time: string;
    to_time: string;
  }>;
}
export function getUserDetailsForAdmin(input: GetUserDetailsForAdminInput & { token: string }): Promise<GetUserDetailsForAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getUserDetailsForAdmin', body, token)
}

export type GetProviderListForAdminInput = {
}
export type GetProviderListForAdminOutput = {
  providers: Array<{
    id: number;
    username: string;
  }>;
}
export function getProviderListForAdmin(input: GetProviderListForAdminInput & { token: string }): Promise<GetProviderListForAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getProviderListForAdmin', body, token)
}

export type GetYearlyBookingReportByAdminInput = {
}
export type GetYearlyBookingReportByAdminOutput = {
  labels: Array<string>;
  data: {
    "Numbers of Bookings": Array<number>;
  };
}
export function getYearlyBookingReportByAdmin(input: GetYearlyBookingReportByAdminInput & { token: string }): Promise<GetYearlyBookingReportByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getYearlyBookingReportByAdmin', body, token)
}

export type GetMonthlyBookingReportByAdminInput = {
  year: string;
}
export type GetMonthlyBookingReportByAdminOutput = {
  labels: Array<string>;
  data: {
    "Numbers of Bookings": Array<number>;
  };
}
export function getMonthlyBookingReportByAdmin(input: GetMonthlyBookingReportByAdminInput & { token: string }): Promise<GetMonthlyBookingReportByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getMonthlyBookingReportByAdmin', body, token)
}

export type GetDailyBookingReportByAdminInput = {
  date: string;
}
export type GetDailyBookingReportByAdminOutput = {
  labels: Array<string>;
  data: {
    "Numbers of Bookings": Array<number>;
  };
}
export function getDailyBookingReportByAdmin(input: GetDailyBookingReportByAdminInput & { token: string }): Promise<GetDailyBookingReportByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getDailyBookingReportByAdmin', body, token)
}

export type GetYearlySalesReportByAdminInput = {
  providerId: number;
}
export type GetYearlySalesReportByAdminOutput = {
  labels: Array<string>;
  data: {
    Sales: Array<number>;
  };
}
export function getYearlySalesReportByAdmin(input: GetYearlySalesReportByAdminInput & { token: string }): Promise<GetYearlySalesReportByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getYearlySalesReportByAdmin', body, token)
}

export type GetMonthlySalesReportByAdminInput = {
  year: string;
  providerId: number;
}
export type GetMonthlySalesReportByAdminOutput = {
  labels: Array<string>;
  data: {
    Sales: Array<number>;
  };
}
export function getMonthlySalesReportByAdmin(input: GetMonthlySalesReportByAdminInput & { token: string }): Promise<GetMonthlySalesReportByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getMonthlySalesReportByAdmin', body, token)
}

export type GetDailySalesReportByAdminInput = {
  date: string;
  providerId: number;
}
export type GetDailySalesReportByAdminOutput = {
  labels: Array<string>;
  data: {
    Sales: Array<number>;
  };
}
export function getDailySalesReportByAdmin(input: GetDailySalesReportByAdminInput & { token: string }): Promise<GetDailySalesReportByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getDailySalesReportByAdmin', body, token)
}

export type GetYearlyAttendanceReportByAdminInput = {
}
export type GetYearlyAttendanceReportByAdminOutput = {
  labels: Array<string>;
  data: {
    "Numbers of Accepted Bookings": Array<number>;
    "Numbers of no Arriving": Array<number>;
  };
}
export function getYearlyAttendanceReportByAdmin(input: GetYearlyAttendanceReportByAdminInput & { token: string }): Promise<GetYearlyAttendanceReportByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getYearlyAttendanceReportByAdmin', body, token)
}

export type GetMonthlyAttendanceReportByAdminInput = {
  year: string;
}
export type GetMonthlyAttendanceReportByAdminOutput = {
  labels: Array<string>;
  data: {
    "Numbers of Accepted Bookings": Array<number>;
    "Numbers of no Arriving": Array<number>;
  };
}
export function getMonthlyAttendanceReportByAdmin(input: GetMonthlyAttendanceReportByAdminInput & { token: string }): Promise<GetMonthlyAttendanceReportByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getMonthlyAttendanceReportByAdmin', body, token)
}

export type GetDailyAttendanceReportByAdminInput = {
  date: string;
}
export type GetDailyAttendanceReportByAdminOutput = {
  labels: Array<string>;
  data: {
    "Numbers of Accepted Bookings": Array<number>;
    "Numbers of no Arriving": Array<number>;
  };
}
export function getDailyAttendanceReportByAdmin(input: GetDailyAttendanceReportByAdminInput & { token: string }): Promise<GetDailyAttendanceReportByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getDailyAttendanceReportByAdmin', body, token)
}

export type GetYearlyServiceHotnessReportByAdminInput = {
}
export type GetYearlyServiceHotnessReportByAdminOutput = {
  labels: Array<string>;
  data: {
    data: Array<number>;
  };
}
export function getYearlyServiceHotnessReportByAdmin(input: GetYearlyServiceHotnessReportByAdminInput & { token: string }): Promise<GetYearlyServiceHotnessReportByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getYearlyServiceHotnessReportByAdmin', body, token)
}

export type GetMonthlyServiceHotnessReportByAdminInput = {
  year: string;
}
export type GetMonthlyServiceHotnessReportByAdminOutput = {
  labels: Array<string>;
  data: {
    data: Array<number>;
  };
}
export function getMonthlyServiceHotnessReportByAdmin(input: GetMonthlyServiceHotnessReportByAdminInput & { token: string }): Promise<GetMonthlyServiceHotnessReportByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getMonthlyServiceHotnessReportByAdmin', body, token)
}

export type GetDailyServiceHotnessReportByAdminInput = {
  date: string;
}
export type GetDailyServiceHotnessReportByAdminOutput = {
  labels: Array<string>;
  data: {
    data: Array<number>;
  };
}
export function getDailyServiceHotnessReportByAdmin(input: GetDailyServiceHotnessReportByAdminInput & { token: string }): Promise<GetDailyServiceHotnessReportByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getDailyServiceHotnessReportByAdmin', body, token)
}

export type GetBookingListByDateByAdminInput = {
  date: string;
}
export type GetBookingListByDateByAdminOutput = Array<{
  id: number;
  user_id: number;
  username: string;
  service_id: number;
  name: string;
  provider_id: number;
  provider_name: string;
  promo_code_id: number;
  booking_submit_time: number | null;
  booking_accept_time: number | null;
  booking_reject_time: number | null;
  booking_cancel_time: number | null;
  paid_deposit_time: number | null;
  paid_fully_time: number | null;
  user_plan_id: number;
  title: string;
}>
export function getBookingListByDateByAdmin(input: GetBookingListByDateByAdminInput & { token: string }): Promise<GetBookingListByDateByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getBookingListByDateByAdmin', body, token)
}

export type GetNextWeekBookingListByAdminInput = {
}
export type GetNextWeekBookingListByAdminOutput = Array<{
  id: number;
  user_id: number;
  username: string;
  service_id: number;
  name: string;
  provider_id: number;
  provider_name: string;
  promo_code_id: number;
  booking_submit_time: number | null;
  booking_accept_time: number | null;
  booking_reject_time: number | null;
  booking_cancel_time: number | null;
  paid_deposit_time: number | null;
  paid_fully_time: number | null;
  user_plan_id: number;
  title: string;
}>
export function getNextWeekBookingListByAdmin(input: GetNextWeekBookingListByAdminInput & { token: string }): Promise<GetNextWeekBookingListByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getNextWeekBookingListByAdmin', body, token)
}

export type GetUserNumberByAdminInput = {
}
export type GetUserNumberByAdminOutput = {
  data: {
    userNumber: number;
  };
}
export function getUserNumberByAdmin(input: GetUserNumberByAdminInput & { token: string }): Promise<GetUserNumberByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getUserNumberByAdmin', body, token)
}

export type GetNonAdminUserNumberByAdminInput = {
}
export type GetNonAdminUserNumberByAdminOutput = {
  data: {
    nonAdminUserNumber: number;
  };
}
export function getNonAdminUserNumberByAdmin(input: GetNonAdminUserNumberByAdminInput & { token: string }): Promise<GetNonAdminUserNumberByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getNonAdminUserNumberByAdmin', body, token)
}

export type GetAdminNumberByAdminInput = {
}
export type GetAdminNumberByAdminOutput = {
  data: {
    adminNumber: number;
  };
}
export function getAdminNumberByAdmin(input: GetAdminNumberByAdminInput & { token: string }): Promise<GetAdminNumberByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getAdminNumberByAdmin', body, token)
}

export type GetBookingSalesByAdminInput = {
}
export type GetBookingSalesByAdminOutput = {
  data: {
    bookingSales: number;
  };
}
export function getBookingSalesByAdmin(input: GetBookingSalesByAdminInput & { token: string }): Promise<GetBookingSalesByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getBookingSalesByAdmin', body, token)
}

export type GetOrderSalesByAdminInput = {
}
export type GetOrderSalesByAdminOutput = {
  data: {
    orderSales: number;
  };
}
export function getOrderSalesByAdmin(input: GetOrderSalesByAdminInput & { token: string }): Promise<GetOrderSalesByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getOrderSalesByAdmin', body, token)
}

export type GetBookingNumberByAdminInput = {
}
export type GetBookingNumberByAdminOutput = {
  data: {
    bookingNumber: number;
  };
}
export function getBookingNumberByAdmin(input: GetBookingNumberByAdminInput & { token: string }): Promise<GetBookingNumberByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getBookingNumberByAdmin', body, token)
}

export type GetPendingBookingNumberByAdminInput = {
}
export type GetPendingBookingNumberByAdminOutput = {
  data: {
    pendingBookingNumber: number;
  };
}
export function getPendingBookingNumberByAdmin(input: GetPendingBookingNumberByAdminInput & { token: string }): Promise<GetPendingBookingNumberByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getPendingBookingNumberByAdmin', body, token)
}

export type GetAcceptedBookingNumberByAdminInput = {
}
export type GetAcceptedBookingNumberByAdminOutput = {
  data: {
    acceptedBookingNumber: number;
  };
}
export function getAcceptedBookingNumberByAdmin(input: GetAcceptedBookingNumberByAdminInput & { token: string }): Promise<GetAcceptedBookingNumberByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getAcceptedBookingNumberByAdmin', body, token)
}

export type GetRejectedBookingNumberByAdminInput = {
}
export type GetRejectedBookingNumberByAdminOutput = {
  data: {
    rejectedBookingNumber: number;
  };
}
export function getRejectedBookingNumberByAdmin(input: GetRejectedBookingNumberByAdminInput & { token: string }): Promise<GetRejectedBookingNumberByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getRejectedBookingNumberByAdmin', body, token)
}

export type GetCancelledBookingNumberByAdminInput = {
}
export type GetCancelledBookingNumberByAdminOutput = {
  data: {
    cancelledBookingNumber: number;
  };
}
export function getCancelledBookingNumberByAdmin(input: GetCancelledBookingNumberByAdminInput & { token: string }): Promise<GetCancelledBookingNumberByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getCancelledBookingNumberByAdmin', body, token)
}

export type UploadCustomerDataInput = {
  csv: string;
}
export type UploadCustomerDataOutput = {
}
export function UploadCustomerData(input: UploadCustomerDataInput & { token: string }): Promise<UploadCustomerDataOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/UploadCustomerData', body, token)
}

export type UpdateServiceProviderPicInput = {
  user_id: number;
  pic: string | null;
}
export type UpdateServiceProviderPicOutput = {
}
export function updateServiceProviderPic(input: UpdateServiceProviderPicInput & { token: string }): Promise<UpdateServiceProviderPicOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/updateServiceProviderPic', body, token)
}

export type AddServiceToProviderInput = {
  provider_id: number;
  service_id: number;
  quota: number;
}
export type AddServiceToProviderOutput = {
  id: number;
}
export function addServiceToProvider(input: AddServiceToProviderInput & { token: string }): Promise<AddServiceToProviderOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/addServiceToProvider', body, token)
}

export type RemoveServiceToProviderInput = {
  provider_id: number;
  service_id: number;
}
export type RemoveServiceToProviderOutput = {
}
export function removeServiceToProvider(input: RemoveServiceToProviderInput & { token: string }): Promise<RemoveServiceToProviderOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/removeServiceToProvider', body, token)
}

export type SetUserRoleBySuperAdminInput = {
  user_id: number
  role: "admin" | "consumer"
}
export type SetUserRoleBySuperAdminOutput = {
}
export function setUserRoleBySuperAdmin(input: SetUserRoleBySuperAdminInput & { token: string }): Promise<SetUserRoleBySuperAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/setUserRoleBySuperAdmin', body, token)
}

export type SetUserRoleByAdminInput = {
  user_id: number
  role: "super_admin" | "admin" | "service_provider" | "consumer"
  is_vip: boolean
}
export type SetUserRoleByAdminOutput = {
}
export function setUserRoleByAdmin(input: SetUserRoleByAdminInput & { token: string }): Promise<SetUserRoleByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/setUserRoleByAdmin', body, token)
}

export type SetUserColorByAdminInput = {
  user_id: number
  color: string
}
export type SetUserColorByAdminOutput = {
}
export function setUserColorByAdmin(input: SetUserColorByAdminInput & { token: string }): Promise<SetUserColorByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/setUserColorByAdmin', body, token)
}

export type GetCompanySettingsInput = {
}
export type GetCompanySettingsOutput = {
  serviceTimes: Array<{
    id: number
    week_day: number
    from_time: null | (string)
    to_time: null | (string)
  }>
  holidays: Array<{
    id: number
    remark: string
    from_time: number
    to_time: number
  }>
  allow_cancel_booking_time: number
}
export function getCompanySettings(input: GetCompanySettingsInput & { token: string }): Promise<GetCompanySettingsOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getCompanySettings', body, token)
}

export type GetCompanyOperationTimeInput = {
}
export type GetCompanyOperationTimeOutput = {
  serviceTimes: Array<{
    id: number
    week_day: number
    from_time: null | (string)
    to_time: null | (string)
  }>
}
export function getCompanyOperationTime(input: GetCompanyOperationTimeInput & { token: string }): Promise<GetCompanyOperationTimeOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getCompanyOperationTime', body, token)
}

export type SaveWorkingTimesForServiceProviderInput = {
  provider_id: number;
  serviceTimes: Array<{
    week_day: number;
    from_time: string;
    to_time: string;
  }>;
}
export type SaveWorkingTimesForServiceProviderOutput = {
}
export function saveWorkingTimesForServiceProvider(input: SaveWorkingTimesForServiceProviderInput & { token: string }): Promise<SaveWorkingTimesForServiceProviderOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/saveWorkingTimesForServiceProvider', body, token)
}

export type SaveCompanyServiceTimesInput = {
  serviceTimes: Array<{
    id: number
    week_day: number
    from_time: null | (string)
    to_time: null | (string)
  }>
}
export type SaveCompanyServiceTimesOutput = {
}
export function saveCompanyServiceTimes(input: SaveCompanyServiceTimesInput & { token: string }): Promise<SaveCompanyServiceTimesOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/saveCompanyServiceTimes', body, token)
}

export type SaveCompanyHolidayInput = {
  holiday: {
    id: number;
    remark: string;
    from_time: number;
    to_time: number;
  };
}
export type SaveCompanyHolidayOutput = {
  id: number;
}
export function saveCompanyHoliday(input: SaveCompanyHolidayInput & { token: string }): Promise<SaveCompanyHolidayOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/saveCompanyHoliday', body, token)
}

export type SaveAllowCancelBookingTimeInput = {
  allow_cancel_booking_time: number | null;
}
export type SaveAllowCancelBookingTimeOutput = {
}
export function saveAllowCancelBookingTime(input: SaveAllowCancelBookingTimeInput & { token: string }): Promise<SaveAllowCancelBookingTimeOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/saveAllowCancelBookingTime', body, token)
}

export type DelCompanyHolidayInput = {
  id: number;
}
export type DelCompanyHolidayOutput = {
}
export function delCompanyHoliday(input: DelCompanyHolidayInput & { token: string }): Promise<DelCompanyHolidayOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/delCompanyHoliday', body, token)
}

export type GetAllServiceListInput = {
}
export type GetAllServiceListOutput = {
  service_types: Array<{
    type_id: number;
    type_name: string;
    services: Array<{
      service_id: number;
      service_name: string;
      quota: number;
      duration: number;
    }>;
  }>;
}
export function getAllServiceList(input: GetAllServiceListInput): Promise<GetAllServiceListOutput & { error?: string }> {
	return post('/getAllServiceList', input)
}

export type GetPaymentListForAdminInput = {
}
export type GetPaymentListForAdminOutput = {
  order_payments: Array<{
    payment: {
      id: number;
      order_id: number;
      booking_id: number | null;
      remark: string;
      filename: string;
      submit_time: number | null;
    };
    order: {
      t_shopping_order_id: number;
      checkout_time: number | null;
      full_pay_time: number | null;
      full_pay_amount: number | null;
      full_pay_deadline: number | null;
      deposit_time: number | null;
      deposit_amount: number | null;
      deposit_deadline: number | null;
      coupon_code: string;
      discount_amount: number | null;
      expired_time: number | null;
      promo_code_id: number;
      username: string;
      user_id: number;
      is_vip: boolean;
      pic: string | null;
    };
    parts: Array<{
      t_order_part_id: number;
      product_id: number;
      name: string;
      pic: string | null;
      price: number;
      type_id: number;
      type: string;
    }>;
  }>;
  booking_payments: Array<{
    payment: {
      id: number;
      order_id: number;
      booking_id: number | null;
      remark: string;
      filename: string;
      submit_time: number | null;
    };
    booking: {
      t_service_booking_id: number | null;
      paid_deposit_time: number | null;
      paid_fully_time: number | null;
      promo_code_id: number;
      service_id: number;
      user_id: number;
      user_plan_id: number;
      username: string;
      is_vip: boolean;
      user_pic: string | null;
      coupon_code: string;
      discount_amount: number | null;
      expired_time: number | null;
      type_id: number;
      service_name: string;
      service_pic: string | null;
      price: number;
      expire_time: number | null;
      plan_id: number;
      type_name: string;
      quota: number;
      weekly_quota: number;
      title: string;
    };
  }>;
}
export function getPaymentListForAdmin(input: GetPaymentListForAdminInput & { token: string }): Promise<GetPaymentListForAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getPaymentListForAdmin', body, token)
}

export type GetOrderHistoryForConsumerInput = {
}
export type GetOrderHistoryForConsumerOutput = {
  orders: Array<{
    order: {
      t_shopping_order_id: number
      checkout_time: null | (number)
      full_pay_time: null | (number)
      full_pay_amount: null | (number)
      full_pay_deadline: null | (number)
      deposit_time: null | (number)
      deposit_amount: null | (number)
      deposit_deadline: null | (number)
      coupon_code: null | (string)
      discount_amount: null | (number)
      expired_time: null | (number)
      promo_code_id: null | (number)
    }
    parts: Array<{
      t_order_part_id: number
      product_id: number
      name: string
      pic: string
      price: number
      type_id: number
      type: string
    }>
    payments: Array<{
      id: number
      remark: string
      submit_time: number
      filename: null | (string)
      accept_time: null | (number)
      reject_time: null | (number)
      method: null | (string)
      amount: null | (number)
    }>
  }>
}
export function getOrderHistoryForConsumer(input: GetOrderHistoryForConsumerInput & { token: string }): Promise<GetOrderHistoryForConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getOrderHistoryForConsumer', body, token)
}

export type GetOrderHistoryForAdminInput = {
}
export type GetOrderHistoryForAdminOutput = {
  orders: Array<{
    order: {
      t_shopping_order_id: number
      checkout_time: null | (number)
      full_pay_time: null | (number)
      full_pay_amount: null | (number)
      full_pay_deadline: null | (number)
      deposit_time: null | (number)
      deposit_amount: null | (number)
      deposit_deadline: null | (number)
      coupon_code: null | (string)
      discount_amount: null | (number)
      expired_time: null | (number)
      promo_code_id: null | (number)
      user_id: number
      username: string
      is_vip: boolean
    }
    parts: Array<{
      t_order_part_id: number
      product_id: number
      name: string
      pic: string
      price: number
      type_id: number
      type: string
    }>
    payments: Array<{
      id: number
      remark: string
      submit_time: number
      filename: null | (string)
      accept_time: null | (number)
      reject_time: null | (number)
      method: null | (string)
      amount: null | (number)
    }>
  }>
}
export function getOrderHistoryForAdmin(input: GetOrderHistoryForAdminInput & { token: string }): Promise<GetOrderHistoryForAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getOrderHistoryForAdmin', body, token)
}

export type GetPaymentDetailsForAdminInput = {
  payment_id: number;
}
export type GetPaymentDetailsForAdminOutput = {
  payment: {
    id: number;
    order_id: number;
    booking_id: number | null;
    remark: string;
    filename: string;
    submit_time: number | null;
  };
  orders: Array<{
    order_id: number;
    checkout_time: number | null;
    full_pay_time: number | null;
    full_pay_amount: number | null;
    full_pay_deadline: number | null;
    deposit_time: number | null;
    deposit_amount: number | null;
    deposit_deadline: number | null;
    coupon_code: string;
    discount_amount: number | null;
    expired_time: number | null;
    promo_code_id: number;
    username: string;
    user_id: number;
    is_vip: boolean;
    pic: string | null;
    parts: Array<{
      product_id: number;
      name: string;
      pic: string | null;
      price: number;
      type_id: number;
      type: string;
    }>;
  }>;
  bookings: Array<{
    booking_id: number | null;
    paid_deposit_time: number | null;
    paid_fully_time: number | null;
    promo_code_id: number;
    service_id: number;
    user_id: number;
    user_plan_id: number;
    username: string;
    is_vip: boolean;
    user_pic: string | null;
    coupon_code: string;
    discount_amount: number | null;
    expired_time: number | null;
    type_id: number;
    service_name: string;
    service_pic: string | null;
    price: number;
    expire_time: number | null;
    plan_id: number;
    type_name: string;
    quota: number;
    weekly_quota: number;
    title: string;
  }>;
}
export function getPaymentDetailsForAdmin(input: GetPaymentDetailsForAdminInput & { token: string }): Promise<GetPaymentDetailsForAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getPaymentDetailsForAdmin', body, token)
}

export type GetServiceSettingInput = {
}
export type GetServiceSettingOutput = {
  serviceTypes: Array<{
    id: number;
    name: string;
  }>;
  services: Array<{
    id: number;
    type_id: number;
    name: string;
    quota: number;
    pic: string | null;
    duration: number;
    price: number;
    is_vip: boolean;
  }>;
}
export function getServiceSetting(input: GetServiceSettingInput & { token: string }): Promise<GetServiceSettingOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getServiceSetting', body, token)
}

export type AddProductToShoppingCartInput = {
  product_id: number;
}
export type AddProductToShoppingCartOutput = {
  id: number;
}
export function addProductToShoppingCart(input: AddProductToShoppingCartInput & { token: string }): Promise<AddProductToShoppingCartOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/addProductToShoppingCart', body, token)
}

export type GetShoppingCartDataByConsumerInput = {
}
export type GetShoppingCartDataByConsumerOutput = {
  order_id: number;
  selectedCouponCode: string;
  availableCoupons: Array<{
    id: number;
    coupon_code: string;
    discount_amount: number | null;
    expired_time: number | null;
  }>;
  orderParts: Array<{
    product_id: number;
    product_name: string;
    pic: string | null;
    price: number;
    addonProducts: Array<{
      id: number;
      name: string;
    }>;
  }>;
}
export function getShoppingCartDataByConsumer(input: GetShoppingCartDataByConsumerInput & { token: string }): Promise<GetShoppingCartDataByConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getShoppingCartDataByConsumer', body, token)
}

export type ChooseShoppingCartCouponByConsumerInput = {
  coupon_code: string;
}
export type ChooseShoppingCartCouponByConsumerOutput = {
}
export function chooseShoppingCartCouponByConsumer(input: ChooseShoppingCartCouponByConsumerInput & { token: string }): Promise<ChooseShoppingCartCouponByConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/chooseShoppingCartCouponByConsumer', body, token)
}

export type RemoveProductFromCartByConsumerInput = {
  product_id: number;
}
export type RemoveProductFromCartByConsumerOutput = {
}
export function removeProductFromCartByConsumer(input: RemoveProductFromCartByConsumerInput & { token: string }): Promise<RemoveProductFromCartByConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/removeProductFromCartByConsumer', body, token)
}

export type SubmitShoppingCartByConsumerInput = {
  shopping_cart_id: number;
}
export type SubmitShoppingCartByConsumerOutput = {
  checkout_time: number | null;
}
export function submitShoppingCartByConsumer(input: SubmitShoppingCartByConsumerInput & { token: string }): Promise<SubmitShoppingCartByConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/submitShoppingCartByConsumer', body, token)
}

export type GetServiceListInput = {
}
export type GetServiceListOutput = {
  services: Array<{
    id: number;
    name: string;
    quota: number;
    booked: number;
    price: number;
    is_self_booked: boolean;
    type: string;
    pic: string | null;
    duration: number;
    providers: Array<{
      id: number;
      name: string;
    }>;
    user_plans: Array<{
      user_plan_id: number;
      plan_id: number;
      title: string;
      quota: number;
      weekly_quota: number;
      total_used: number;
      weekly_used: number;
    }>;
    addon_services: Array<{
      id: number;
      name: string;
    }>;
  }>;
}
export function getServiceList(input: GetServiceListInput & { token: string }): Promise<GetServiceListOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getServiceList', body, token)
}

export type SaveServiceInput = {
  service: {
    id: number;
    type_id: number;
    name: string;
    quota: number;
    pic: string | null;
    duration: number;
    price: number;
    is_vip: boolean;
  };
}
export type SaveServiceOutput = {
  id: number;
}
export function saveService(input: SaveServiceInput & { token: string }): Promise<SaveServiceOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/saveService', body, token)
}

export type SaveServiceTypeInput = {
  serviceType: {
    id: number
    name: string
  }
}
export type SaveServiceTypeOutput = {
  id: number
}
export function saveServiceType(input: SaveServiceTypeInput & { token: string }): Promise<SaveServiceTypeOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/saveServiceType', body, token)
}

export type SetDepositPaymentByAdminInput = {
  shopping_cart_id: number;
  deposit_amount: number | null;
  deposit_deadline: number | null;
}
export type SetDepositPaymentByAdminOutput = {
}
export function setDepositPaymentByAdmin(input: SetDepositPaymentByAdminInput & { token: string }): Promise<SetDepositPaymentByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/setDepositPaymentByAdmin', body, token)
}

export type SetFullyPaymentByAdminInput = {
  shopping_cart_id: number;
  full_pay_amount: number | null;
  full_pay_deadline: number | null;
}
export type SetFullyPaymentByAdminOutput = {
}
export function setFullyPaymentByAdmin(input: SetFullyPaymentByAdminInput & { token: string }): Promise<SetFullyPaymentByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/setFullyPaymentByAdmin', body, token)
}

export type SubmitBookingInput = {
  service_id: number;
  provider_id: number;
  from_time: number;
  to_time: number;
  user_plan_id: number;
  promo_code: string;
  addon_service_ids: Array<number>;
}
export type SubmitBookingOutput = {
  id: number;
}
export function submitBooking(input: SubmitBookingInput & { token: string }): Promise<SubmitBookingOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/submitBooking', body, token)
}

export type ChangeBookingTimeByAdminInput = {
  booking_id: number | null;
  from_time: number;
  to_time: number;
}
export type ChangeBookingTimeByAdminOutput = {
}
export function changeBookingTimeByAdmin(input: ChangeBookingTimeByAdminInput & { token: string }): Promise<ChangeBookingTimeByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/changeBookingTimeByAdmin', body, token)
}

export type UpdateBookingRemarkByAdminInput = {
  booking_id: number | null;
  remark: string;
}
export type UpdateBookingRemarkByAdminOutput = {
}
export function updateBookingRemarkByAdmin(input: UpdateBookingRemarkByAdminInput & { token: string }): Promise<UpdateBookingRemarkByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/updateBookingRemarkByAdmin', body, token)
}

export type GetBookingListByConsumerInput = {
}
export type GetBookingListByConsumerOutput = {
  bookings: Array<{
    id: number
    service: {
      id: number
      name: string
      price: number
    }
    provider: {
      id: number
      name: string
    }
    from_time: number
    to_time: number
    booking_submit_time: number
    booking_accept_time: null | (number)
    booking_reject_time: null | (number)
    paid_deposit_time: null | (number)
    paid_fully_time: null | (number)
    arrive_time: null | (number)
    leave_time: null | (number)
  }>
}
export function getBookingListByConsumer(input: GetBookingListByConsumerInput & { token: string }): Promise<GetBookingListByConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getBookingListByConsumer', body, token)
}

export type GetBookingDetailsByConsumerInput = {
  booking_id: number | null;
}
export type GetBookingDetailsByConsumerOutput = {
  booking: {
    id: number
    service: {
      id: number
      name: string
      price: number
    }
    provider: {
      id: number
      name: string
    }
    from_time: number
    to_time: number
    booking_submit_time: number
    booking_accept_time: null | (number)
    booking_reject_time: null | (number)
    booking_cancel_time: null | (number)
    paid_deposit_time: null | (number)
    deposit_amount: null | (number)
    deposit_deadline: null | (number)
    paid_fully_time: null | (number)
    full_pay_amount: null | (number)
    full_pay_deadline: null | (number)
    arrive_time: null | (number)
    leave_time: null | (number)
    refund_submit_time: null | (number)
    refund_accept_time: null | (number)
    refund_reject_time: null | (number)
    refund_finish_time: null | (number)
    addon_services: Array<{
      id: number
      name: string
    }>
  }
  allow_cancel_booking_time: number
}
export function getBookingDetailsByConsumer(input: GetBookingDetailsByConsumerInput & { token: string }): Promise<GetBookingDetailsByConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getBookingDetailsByConsumer', body, token)
}

export type ChangeBookingTimeByConsumerInput = {
  booking_id: number | null;
  from_time: number;
  to_time: number;
}
export type ChangeBookingTimeByConsumerOutput = {
}
export function changeBookingTimeByConsumer(input: ChangeBookingTimeByConsumerInput & { token: string }): Promise<ChangeBookingTimeByConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/changeBookingTimeByConsumer', body, token)
}

export type CancelBookingByConsumerInput = {
  booking_id: number | null;
}
export type CancelBookingByConsumerOutput = {
  booking_cancel_time: number | null;
  refund_submit_time: number | null;
}
export function cancelBookingByConsumer(input: CancelBookingByConsumerInput & { token: string }): Promise<CancelBookingByConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/cancelBookingByConsumer', body, token)
}

export type GetProductListForConsumerInput = {
}
export type GetProductListForConsumerOutput = {
  product: Array<{
    id: number;
    product_type: {
      id: number;
      type: string;
    };
    name: string;
    desc: string;
    pic: string | null;
    price: number;
  }>;
}
export function getProductListForConsumer(input: GetProductListForConsumerInput & { token: string }): Promise<GetProductListForConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getProductListForConsumer', body, token)
}

export type GetProductListInput = {
}
export type GetProductListOutput = {
  product: Array<{
    id: number;
    product_type: {
      id: number;
      type: string;
    };
    name: string;
    desc: string;
    pic: string | null;
    price: number;
  }>;
}
export function getProductList(input: GetProductListInput): Promise<GetProductListOutput & { error?: string }> {
	return post('/getProductList', input)
}

export type GetCalendarViewInput = {
  service_id: number
  provider_id: number
  first_day: string
  range: "day" | "week" | "month"
}
export type GetCalendarViewOutput = {
  days: Array<{
    date: string;
    can_book_slots: Array<{
      start: string;
      end: string;
    }>;
    na_slots: Array<{
      start: string;
      end: string;
    }>;
  }>;
}
export function getCalendarView(input: GetCalendarViewInput & { token: string }): Promise<GetCalendarViewOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getCalendarView', body, token)
}

export type UpdateServiceBookingTimeByAdminInput = {
  booking_id: number
  from_time: number
  to_time: number
}
export type UpdateServiceBookingTimeByAdminOutput = {
}
export function updateServiceBookingTimeByAdmin(input: UpdateServiceBookingTimeByAdminInput & { token: string }): Promise<UpdateServiceBookingTimeByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/updateServiceBookingTimeByAdmin', body, token)
}

export type GetCalendarViewByConsumerInput = {
  from_time: number
  to_time: number
}
export type GetCalendarViewByConsumerOutput = {
  items: Array<{
    date: string;
    services: Array<{
      service_id: number;
      service_name: string;
      type_name: string;
      type_id: number;
      quota: number;
      used_quota: number;
      week_day: number;
      timeslot: Array<{
        from_time: string;
        to_time: string;
      }>;
    }>;
  }>;
}
export function getCalendarViewByConsumer(input: GetCalendarViewByConsumerInput & { token: string }): Promise<GetCalendarViewByConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getCalendarViewByConsumer', body, token)
}

export type GetServiceTypesForCalendarInput = {
}
export type GetServiceTypesForCalendarOutput = {
  serviceTypes: Array<{
    id: number;
    name: string;
  }>;
}
export function getServiceTypesForCalendar(input: GetServiceTypesForCalendarInput & { token: string }): Promise<GetServiceTypesForCalendarOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getServiceTypesForCalendar', body, token)
}

export type GetServicesByTypeForCalendarInput = {
  type_id: number;
}
export type GetServicesByTypeForCalendarOutput = {
  services: Array<{
    id: number;
    name: string;
    booked: number;
    quota: number;
  }>;
}
export function getServicesByTypeForCalendar(input: GetServicesByTypeForCalendarInput & { token: string }): Promise<GetServicesByTypeForCalendarOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getServicesByTypeForCalendar', body, token)
}

export type GetProvidersByServiceForCalendarInput = {
  service_id: number;
}
export type GetProvidersByServiceForCalendarOutput = {
  providers: Array<{
    id: number;
    name: string;
  }>;
}
export function getProvidersByServiceForCalendar(input: GetProvidersByServiceForCalendarInput & { token: string }): Promise<GetProvidersByServiceForCalendarOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getProvidersByServiceForCalendar', body, token)
}

export type GetEmailTemplatesForAdminInput = {
}
export type GetEmailTemplatesForAdminOutput = {
  templates: Array<{
    id: number
    name_en: string
    name_zh: string
    variables: Array<string>
    content: string
    default_content: string
  }>
}
export function getEmailTemplatesForAdmin(input: GetEmailTemplatesForAdminInput & { token: string }): Promise<GetEmailTemplatesForAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getEmailTemplatesForAdmin', body, token)
}

export type ResetEmailTemplateForAdminInput = {
  id: number
}
export type ResetEmailTemplateForAdminOutput = {
}
export function resetEmailTemplateForAdmin(input: ResetEmailTemplateForAdminInput & { token: string }): Promise<ResetEmailTemplateForAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/resetEmailTemplateForAdmin', body, token)
}

export type UpdateEmailTemplateForAdminInput = {
  id: number
  content: string
}
export type UpdateEmailTemplateForAdminOutput = {
}
export function updateEmailTemplateForAdmin(input: UpdateEmailTemplateForAdminInput & { token: string }): Promise<UpdateEmailTemplateForAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/updateEmailTemplateForAdmin', body, token)
}

export type GetEventsForCalendarByAdminInput = {
  first_time: number
  last_time: number
}
export type GetEventsForCalendarByAdminOutput = {
  events: Array<{
    t_service_booking_id: number
    service_id: number
    provider_id: number
    user_id: number
    t_service_booking_from_time: number
    t_service_booking_to_time: number
    service_name: string
    color: string
    provider_username: string
    user_username: string
  }>
}
export function getEventsForCalendarByAdmin(input: GetEventsForCalendarByAdminInput & { token: string }): Promise<GetEventsForCalendarByAdminOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getEventsForCalendarByAdmin', body, token)
}

export type GetEventsForCalendarByConsumerInput = {
  show_finished_only: boolean
}
export type GetEventsForCalendarByConsumerOutput = {
  events: Array<{
    t_service_booking_id: number
    service_id: number
    provider_id: number
    user_id: number
    t_service_booking_from_time: number
    t_service_booking_to_time: number
    t_check_in_time: null | (number)
    t_check_out_time: null | (number)
    service_name: string
    provider_username: string
    user_username: string
  }>
}
export function getEventsForCalendarByConsumer(input: GetEventsForCalendarByConsumerInput & { token: string }): Promise<GetEventsForCalendarByConsumerOutput & { error?: string }> {
  let { token, ...body } = input
	return post('/getEventsForCalendarByConsumer', body, token)
}

export type DemoInput = {
}
export type DemoOutput = {
}
export function demo(input: DemoInput): Promise<DemoOutput & { error?: string }> {
	return post('/demo', input)
}
