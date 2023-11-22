import { getOrderHistoryForConsumer, getToken } from 'src/sdk2'
import { GetOrderHistoryForConsumerOutput } from './../../../../sdk2'
import { AfterViewChecked, Component, OnInit } from '@angular/core'
import { ApiService, toImageSrc } from 'src/app/api.service'
import { toQRCode } from 'src/helpers/qr-code'
import {
  requestStripePaymentByConsumer,
  RequestStripePaymentByConsumerInput,
} from '../../../../sdk2'
import { LangService } from 'src/app/lang.service'
import { Capacitor } from '@capacitor/core'

type Item = GetOrderHistoryForConsumerOutput['orders'][number]

type UIItem = Item & {
  qrCode?: string
  showQrCode?: boolean
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss'],
})
export class OrderHistoryPage implements OnInit, AfterViewChecked {
  dateFormat = 'yyyy-MM-dd HH:mm'

  filter: 'pending' | 'to-pay' | 'paid' = 'pending'

  data?: GetOrderHistoryForConsumerOutput

  items?: UIItem[]

  constructor(private api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  toImageSrc = toImageSrc

  printItem?: Item

  async ngOnInit() {
    try {
      let token = getToken()
      if (!token) return
      this.data = await getOrderHistoryForConsumer({ token })
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
    for (let item of this.items) {
      item.qrCode = await toQRCode(item.order.t_shopping_order_id)
    }
  }

  async pay(
    order_id: number,
    pay_for: RequestStripePaymentByConsumerInput['pay_for'],
  ) {
    try {
      let token = getToken()
      if (!token) return
      let json = await requestStripePaymentByConsumer({
        order_id,
        token,
        pay_for,
      })
      location.href = json.payment_url
    } catch (error) {
      this.api.showError(error)
    }
  }

  print(item: Item) {
    this.printItem = item
  }

  ngAfterViewChecked(): void {
    if (this.printItem) {
      window.print()
      delete this.printItem
    }
  }

  shouldHide() {
    return Capacitor.getPlatform() == 'ios'
  }
}
