import { Injectable } from '@angular/core'

/* use poe to auto translate with below prompt:

Complete language object with tailing comma, for example:
const zh_hk = {
  'Logout': '登出',
  'Delete Account': '刪除帳號',
}

clear the object, add:

*/

const zh_hk = {
  /* Admin Tabs */
  'Users': '用戶',
  'Booking': '預訂',
  'Payment': '付款',
  'Order': '訂單',
  'More': '更多',

  /* Admin Users Tab */
  'Manage User': '管理用戶',
  'Admin': '管理員',
  'Search Username': '搜索用戶名',
  'Role': '角色',
  'CREATE NEW USER': '創建新用戶',
  'New User': '新用戶',
  'Password': '密碼',
  'CREATE USER': '添加新用戶',
  'The username must be at least 5 characters and no more than 20 characters long, contain at least one uppercase characters, at least one lowercase characters and at least one number.':
    '用戶名長度必須至少為 5 個字符且不超過 20 個字符，且包含至少 1 個大寫字符、至少 1 個小寫字符和至少 1 個數字。',
  'The password must be at least 7 characters and no more than 16 characters long, contain at least one number.':
    '密碼長度必須至少為 7 個字符且不超過 16 個字符，且至少包含 1 個數字。',

  /* Admin Calendar Tab */
  'Month': '月份',
  'Week': '星期',
  'Day': '日子',
  'Prev': '之前',
  'Next': '之後',
  'Sun': '日',
  'Mon': '一',
  'Tue': '二',
  'Wed': '三',
  'Thu': '四',
  'Fri': '五',
  'Sat': '六',
  'Consumer': '客戶',

  /* Admin Booking Tab */
  'Manage Booking': '管理預訂',
  'Search Booking ID or Username': '搜索預訂ID或用戶名',
  'Change Role': '更改角色',
  'Set VIP': '設定 VIP',
  'FILTER BY BOOKING STATUS': '按預訂狀態篩選',

  /* Admin Booking Detail Page */
  'Edit': '編輯',
  'Booked by': '預訂人',
  'Booking quota': '預訂配額',
  'Accept Booking Time': '接受預訂時間',
  'Reject Booking Time': '拒絕預訂時間',
  'Cancelled by Client on': '客戶於取消',
  'Accept': '接受',
  'Reject': '拒絕',
  'Set up payment': '設定付款方式',
  'please set up the payment details and click "confirm" button':
    '請設定付款詳情，然後點擊“確認”按鈕',
  'Pay Deposit Amount': '支付訂金金額',
  'Pay Deposit Deadline': '支付訂金截止日期',
  'Pay Fully Amount': '支付全款金額',
  'Pay Fully Deadline': '支付全款截止日期',
  'Confirm': '確認',
  'Booked on': '預訂日期',
  'Closed Reschedule': '關閉改期',
  'Update Time': '更新時間',
  "Didn't pay": '未支付',
  'Paid Deposit Only': '僅支付訂金',
  'Paid Fully': '已全額支付',
  'Receive Deposit': '收到訂金',
  'Receive Full Pay': '收到全額付款',
  'Check-in Status': '報到狀態',
  'Already Check-in': '已報到',
  'Already Check-out': '已離開',
  'Save': '儲存',
  'Check-in': '報到',
  'input remark': '輸入備註',
  'Save Remark': '更新備註',

  /* Admin User Detail Page */
  'Color': '顏色',
  'Loading user profile': '載入用戶檔案中',
  "'s Profile": '的簡介',
  'Close': '關閉',
  'Add Service': '新增服務',
  'Class Quota': '課堂配額',
  'Rest Time': '休息時間',
  'No need to work': '無需工作',
  'Start': '開始',
  'tap to select time': '點擊選擇時間',
  'No work': '未工作',
  'Update': '更新',
  'Start Time': '開始時間',
  'End Time': '結束時間',

  /* Admin Addon Service Page */
  'Add-On Service Setting': '附加服務設定',
  'Loading data': '載入中',
  'Add': '新增',
  'From Service': '起始服務',
  'To Service': '目標服務',
  'save all add-on services': '儲存所有附加服務',

  /* Admin Addon Product Page */
  'Add-On Product Setting': '附加產品設定',
  'From Product': '起始產品',
  'To Product': '目標產品',
  'save all add-on products': '儲存所有附加產品',
  'Add-on Product': '附加產品',

  /* Admin Company Setting Page */
  'Loading company details': '載入公司詳情中',
  'Add Holiday': '新增假期',
  'Holiday': '假期',
  'Holiday Name': '假期名稱',
  'Delete': '刪除',
  'Set Operation Time': '設定營業時間',
  'End': '結束',
  'Set N/A': '設為 N/A',

  /* Admin Coupon Setting Page */
  'All': '全部',
  'For Booking': '預訂專用',
  'For Product': '產品專用',
  'No Matched': '無符合項目',
  'Coupons': '優惠券',
  'Coupon ID': '優惠券編號',
  'Discount Amount': '折扣數額',
  'Expire Time': '過期時間',
  'Only for VIP': '僅適用於 VIP',
  'For all products': '適用於所有產品',
  'For all service': '適用於所有服務',
  'Add Coupon': '新增優惠券',
  'Sent Email': '發送電郵',

  /* Admin Package Setting page */
  'Loading Plan': '載入方案中',
  'Add Plan': '新增方案',
  'Specific Service': '特定服務',
  'Plan Type': '方案類型',
  'Title': '標題',
  'Expire Month': '到期月份',

  /* Admin Report Page */
  'Charts': '圖表',
  'Daily Booking': '每日預訂',
  'Coming Week Booking': '下周預訂',
  'Booking Number': '預訂數量',
  'Sales': '銷售額',
  'Attendance': '出勤率',
  'Service Hotness': '服務熱門度',
  'All Time Chart': '所有時間圖表',
  'Year Chart': '年度圖表',
  'Week Chart': '週度圖表',
  'All Provider': '所有服務提供者',
  'Username': '用戶名稱',
  'Service Name': '服務名稱',
  'Provider Name': '服務提供者名稱',
  'Used Promo Code': '已使用優惠碼',
  'Plan Title': '方案標題',
  'Yes': '是',
  'No': '否',
  'Up To': '截至',

  /* Admin Service Setting Page */
  'Loading service information': '載入服務資訊中',
  'Service Type List': '服務類型列表',
  'Add More Service Type': '新增更多服務類型',
  'Below is the Service List': '以下是服務列表',
  'All Types': '所有類型',
  'Add More Service': '新增更多服務',
  'Max Booking Quota': '最大預訂配額',
  'Service Duration (minutes)': '服務時長（分鐘）',
  'Service Picture': '服務圖片',

  /* Admin Upload Setting Page */
  'Download Example CSV File': '下載示範 CSV 檔案',

  /* Admin Payment Tab */
  'Manage Payment': '管理付款',
  'Search Payment ID': '搜索付款ID',
  'Product': '產品',

  /* Admin Order Tab */
  'Order Management': '訂單管理',
  'Pending': '待處理',
  'Need to Pay': '待付款',
  'Paid': '已付款',

  /* Admin Order Detail Page */
  'User': '用戶',
  'Fill-in Payment Request': '填寫付款申請',
  'Submit Payment Request': '提交付款申請',
  'Full Paid Time': '全額支付時間',
  'Full Paid Amount': '全額支付金額',
  'Full Paid Deadline': '全額支付截止日期',
  'Waiting admin to set deposit amount': '等待管理員設置押金金額',
  'Deposit Paid Time': '押金支付時間',
  'Coupon': '優惠券',
  'Expired on': '過期於',
  'Submit Time': '提交時間',
  'by': '以',
  'Accepted on': '接受於',
  'Rejected on': '拒絕於',

  /* Admin More Tab */
  'Cancel Booking Time Setting': '設定取消預約的期限',
  'Set Cancel Time': '設定取消期限',
  'Add-on Service': '附加服務',
  'Interface Language': '界面語言',
  'More Settings': '更多設置',
  'Company Setting': '公司設置',
  'Service Setting': '服務設置',
  'Add-on Service Setting': '附加服務設置',
  'Add-on Product Setting': '附加產品設置',
  'Event Setting': '活動設置',
  'Plan Setting': '計劃設置',
  'Coupon Setting': '優惠券設置',
  'Upload Setting': '上載設置',
  'Notice Setting': '通知設置',
  'Email Notice Setting': '電子郵件通知設置',
  'Report': '報告',
  'Logout': '登出',

  /* Admin Event Setting Page */
  'Loading Events': '載入活動',
  'Add Event': '新增活動',
  'Name': '名稱',
  'Quota': '配額',

  /* Admin Report Sheet Page */
  'Report Sheet': '數據分析表',

  /* Admin Email Setting Page */
  'Email Setting': '電郵設定',
  'Variables': '元件',
  'No Variables': '無元件',

  /* Admin Notice Setting Page */
  'Content': '內容',
  'Publish Time': '發佈時間',
  'Reset': '重置',

  /* Consumer Tabs */
  'Home': '主頁',
  'Calendar': '日曆',

  /* Consumer Home Tab */
  'All Service': '所有服務',
  'Available': '有空位',
  'Fully Booked': '已滿額',
  'No Matched Services': '沒有符合的服務',
  'Duration': '時長',
  'minutes': '分鐘',
  'Price': '價格',
  'N/A': '無',
  'Service Provider': '服務提供者',
  'Book': '預約',
  'Dismiss': '關閉',
  'Booking Service': '預訂服務',
  'Selected Service': '已選擇的服務',
  'Selected Provider': '已選擇的服務提供者',
  'Service Date': '服務日期',
  'Starting Time': '開始時間',
  'Finish Time': '結束時間',
  'Promo Code': '優惠碼',
  'Using Package': '使用套票',
  'No user plan available': '沒有可用的用戶方案',
  'Weekly Quota': '每週額度',
  'Total Quota': '總額度',
  'Cancel': '取消',
  'Submit': '提交',
  'Status': '狀態',

  /* Consumer Plan Page */
  'Package': '套票',
  'Loading User Packages': '正在載入用戶方案',
  'Max. weekly quota': '每週最大額度',
  'Used total quota': '已用總額度',
  'Used weekly quota': '已用每週額度',
  'Expiry Time': '到期時間',

  /* Consumer Shopping Page */
  'Shopping Cart': '購物車',
  'Loading Shopping Cart': '正在載入購物車',
  'Discount': '折扣',
  'No items in the shopping cart': '購物車中沒有物品',
  'Add More Booking': '添加更多預訂',
  'Add More Product': '添加更多產品',
  'Check-out': '結帳',

  /* Consumer Product Page */
  'Description': '描述',
  'Add to Cart': '加入購物車',

  /* Consumer (Company) Information Page */
  'Company Information': '公司資訊',
  'Phone': '電話',
  'Email': '電郵',
  'Address': '地址',
  'Operation Time': '營業時間',
  'From': '由',
  'To': '至',

  /* Consumer Order History */
  'Print': '打印',
  'Waiting admin to set full pay amount': '等待管理員設定全額付款金額',
  'Order ID': '訂單編號',
  'Checkout on': '結帳日期',
  'Deposit Amount': '訂金金額',
  'Received Deposit Time': '收到訂金時間',
  'Pay Deposit (Cash)': '現金支付訂金',
  'Pay Deposit (Payme)': 'Payme支付訂金',
  'Pay Deposit (Stripe)': 'Stripe 支付訂金',
  'Deposit Deadline': '訂金截止時間',
  'Received Full Pay Time': '收到全額付款時間',
  'Full Pay Deadline': '全額付款截止日期',
  'Full Pay (Cash)': '現金支付全額',
  'Full Pay (Payme)': 'Payme支付全額',
  'Full Pay (Stripe)': 'Stripe 支付全額',
  'Full Pay Amount': '全額付款金額',
  'Coupon Code': '優惠碼',
  'Coupon Discount': '優惠折扣',
  'Order Part': '訂單部分',
  'Product Price': '產品價格',
  'Product Type': '產品類型',
  'Receipt': '收據',
  'Remark': '備註',
  'Submit Order Time': '提交訂單時間',
  'Accept Order Time': '接受訂單時間',
  'Reject Order Time': '拒絕訂單時間',

  /* Consumer Booking Tab */
  'Search Booking ID': '搜索預訂編號',
  'Booking ID': '預訂編號',
  'Provider': '服務提供者',
  'Submit Booking Time': '提交預訂時間',
  'Booked Time': '預訂時間',
  'Rejected': '拒絕',
  'Waiting admin to accept': '等待管理員接受',
  'Need to pay deposit': '需要支付訂金',
  'Need to full pay': '需要全額支付',
  'Payment Status': '付款狀態',
  'Hong Kong Time Zone': '香港時區',

  /* Consumer Booking Details Page */
  'Booking Details': '預訂詳情',
  'Loading Booking Details': '正在加載預訂詳情',
  'Pay Deposit': '支付訂金',
  'Payme': 'Payme',
  'Cash': '現金',
  'Full Pay': '支付全額',
  'Booking Status': '預訂狀態',
  'Processing': '處理中',
  'Accepted': '已接受',
  'Cancelled': '已取消',
  'Booking Cancelled and Processing Refund': '取消預訂並正在處理退款',
  'Reschedule': '改期',
  'Booking Date': '預訂時間',
  'Confirm Re-arrange': '確認重新安排',
  'Cancel Booking': '取消預訂',

  /* Consumer Report Sheet Page */
  'User Details': '用戶資料',
  'Registered Consumer': '已註冊的客戶',
  'Total User': '總用戶數量',
  'Pending Booking': '待辦的預約',
  'Accepted Booking': '已接受的預訂',
  'Rejected Booking': '已拒絕的預訂',
  'Cancelled Booking': '已取消的預訂',
  'Total Booking': '總預訂數量',
  'Sales Details': '營業額資料',
  'Total Service Sales': '所有服務已成交營業額',
  'Total Product Sales': '所有產品已成交營業額',

  /* Consumer Calendar Tab*/
  'Filter by service type': '按服務類別篩選',
  'Filter by service': '按服務篩選',
  'Filter by service provider': '按服務提供者篩選',
  'Service Type': '服務類型',
  'Date': '日期',
  'Time': '時間',
  'Upcoming Week': '下週',
  'Finished Booking': '已完成預約',
  'Finished': '已出席',

  /* Consumer More Tab*/
  'Loading profile': '加載中',
  'Contact Us': '聯繫我們',
  'Order History': '訂單記錄',
  'Notice': '通知',
  'Notice List': '消息列表',

  /* Consumer Profile Tab */
  'Delete Account': '刪除帳號',
  'Confirm to delete account? This account is not reversible.':
    '確認刪除帳號？此操作無法撤回。',
  'Deleted Account': '已刪除帳號',
  'Notice Center': '通知中心',

  /* Service Provider Booking Tab*/
  'Loading booking': '加載中',
  'Search Service Name': '搜索服務名',
  'Search Consumer Name': '搜索客戶名',
  'Admin Action': '管理員行動',
  'Accepted by Admin': '管理員已批准',

  /* Service Provider Setting Tab*/
  'Profile': '用戶簡介',

  /* Service Provider Profile Page*/
  'Service': '服務',
  'Available Quota': '可提供配額',
  'Rest': '休息時間',
  'Working Time': '工作時間',

  /* Search bar placeholder */
  'Search Email': '搜尋電子郵件',
  'Enter Your Password': '輸入您的密碼',
  'Enter Your Email': '輸入您的電子郵件',
  'Enter Your Phone': '輸入您的電話號碼',
  'Enter Your Username': '輸入您的用戶名稱',
  'Enter number': '輸入數字',
  'Enter text': '輸入文字',
  'Loading user packages': '載入用戶套餐中',
  'Search Product Name': '搜尋產品名稱',
  'Select Service': '選擇服務',
  'Select Service Type': '選擇服務類型',
  'No Matched Coupons': '沒有相關優惠券',

  /* TODO */
  '': '',
}

const en = {
  ...zh_hk,
}
Object.keys(en).forEach((key) => (en[key as keyof typeof en] = key))

const langs = { en, zh_hk }
type Langs = typeof langs
export type Lang = keyof Langs
export type Word = keyof Langs[Lang]

function checkLang(lang: Lang): Lang {
  if (lang in langs) return lang
  return 'zh_hk'
}

@Injectable({
  providedIn: 'root',
})
export class LangService {
  private _lang: Lang

  constructor() {
    this._lang = checkLang(localStorage.getItem('lang') as Lang)
    this.translate = this.translate.bind(this)
  }

  get lang() {
    return this._lang
  }

  set lang(lang: Lang) {
    this._lang = checkLang(lang)
    localStorage.setItem('lang', lang)
  }

  // translate = this.translate_dev
  translate = this.translate_safe

  translate_dev(word: Word | string): string {
    let value = langs[this._lang][word as Word]
    if (!value) {
      addUnknownWord(word)
      return 'TODO: ' + word
    }
    return value
  }

  translate_safe(word: Word): string {
    return langs[this._lang][word]
  }
}

let unknownWords = new Set<string>()

let timer = setTimeout(reportUnknownWords, 1000)

function addUnknownWord(word: string) {
  unknownWords.add(word)
  clearTimeout(timer)
  timer = setTimeout(reportUnknownWords, 1000)
}

function reportUnknownWords() {
  if (unknownWords.size === 0) {
    console.log('no unknown words')
    return
  }
  console.log(
    `clear the object, add ` +
      Array.from(unknownWords, (word) => `'${word}'`).join(', '),
  )
}
