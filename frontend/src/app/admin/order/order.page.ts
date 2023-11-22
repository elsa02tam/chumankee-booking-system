import { Component, OnInit } from '@angular/core'
import { ApiService, toImageSrc } from 'src/app/api.service'
import { LangService } from 'src/app/lang.service'
import { dateTimeToTime } from 'src/helpers/format'
import {
  getOrderHistoryForAdmin,
  GetOrderHistoryForAdminOutput,
  getToken,
  receiveOrderPaymeByAdmin,
  requestOrderPaymentByAdmin,
} from 'src/sdk2'

type Item = GetOrderHistoryForAdminOutput['orders'][number]

type UIItem = Item & {}

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {
  dateFormat = 'yyyy-MM-dd HH:mm'

  filter: 'pending' | 'to-pay' | 'paid' = 'pending'

  data?: GetOrderHistoryForAdminOutput

  items?: UIItem[]

  //for request payment data
  showPaymentForm?: UIItem
  deposit_deadline?: string
  deposit_amount?: number
  full_pay_deadline?: string
  full_pay_amount?: number

  toImageSrc = toImageSrc

  constructor(private api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    await this.loadData()
  }

  async loadData() {
    try {
      let token = getToken()
      if (!token) return
      this.data = await getOrderHistoryForAdmin({ token })
      console.log(this.data)
      this.applyFilter()
    } catch (error) {
      this.api.showError(error)
    }
  }

  async applyFilter() {
    if (!this.data) return
    switch (this.filter) {
      case 'pending':
        this.items = this.data.orders.filter(
          ({ order }) =>
            // pending deposit info
            (!order.deposit_deadline && !order.full_pay_time) ||
            // pending full pay info
            (!order.full_pay_deadline && order.deposit_time),
        )
        break
      case 'to-pay':
        this.items = this.data.orders.filter(
          ({ order }) =>
            (order.deposit_deadline && !order.deposit_time) ||
            (order.full_pay_deadline && !order.full_pay_time),
        )
        break
      case 'paid':
        this.items = this.data.orders
          .filter(
            ({ order }) =>
              // paid once, only full pay
              (order.full_pay_time && !order.deposit_deadline) ||
              // paid twice, deposit and full pay
              (order.deposit_time && order.full_pay_time),
          )
          .sort((a, b) => a.order.full_pay_time! - b.order!.full_pay_time!)
        break
      default:
        console.error('unknown filter:', this.filter)
        return
    }
  }

  async submitPaymentRequest(item: UIItem) {
    try {
      let token = getToken()
      if (!token) return
      console.log('booking...', this)
      let full_pay_deadline = dateTimeToTime(this.full_pay_deadline || '')
      let deposit_deadline = dateTimeToTime(this.deposit_deadline || '')
      let json = await requestOrderPaymentByAdmin({
        token,
        order_id: item.order.t_shopping_order_id,
        full_pay_amount: this.full_pay_amount || 0,
        full_pay_deadline,
        deposit_amount: this.deposit_amount || 0,
        deposit_deadline,
      })
      console.log('request payment data: ', json)
      this.api.showSuccess('submitted payment request!')
      delete this.showPaymentForm
      await this.loadData()
    } catch (error) {
      this.api.showError(error)
    }
  }

  async receivePayme(item: UIItem, pay_for: string, received_amount: number) {
    try {
      let token = getToken()
      if (!token) return
      let json = await receiveOrderPaymeByAdmin({
        token,
        order_id: item.order.t_shopping_order_id,
        pay_for,
        received_amount,
      })
      this.api.showSuccess('Received Payme for ' + pay_for)
      await this.loadData()
    } catch (error) {
      this.api.showError(error)
    }
  }
}
