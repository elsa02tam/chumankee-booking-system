import {
  GetPaymentDetailsForAdminOutput,
  getToken,
  getPaymentDetailsForAdmin,
} from './../../../../sdk2'
import { Component, OnInit } from '@angular/core'
import { ApiService, toImageSrc } from '../../../api.service'
import { ActivatedRoute } from '@angular/router'

type Order = GetPaymentDetailsForAdminOutput['orders'][number]

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.page.html',
  styleUrls: ['./payment-details.page.scss'],
})
export class PaymentDetailsPage implements OnInit {
  dateFormat = 'yyyy-MM-dd HH:mm'

  id?: number
  data?: GetPaymentDetailsForAdminOutput
  // order: Array<{ order: OrderArray }> = []

  constructor(private activatedRoute: ActivatedRoute, public api: ApiService) {
    api.wrapAutoUpdate(this)
  }

  //save img
  toImageSrc = toImageSrc

  async ngOnInit() {
    let id = parseInt(this.activatedRoute.snapshot.paramMap.get('id') ?? '0')
    console.log('booking id:', id)
    if (!id) return
    this.id = id
    try {
      let token = getToken()
      if (!token) return
      let json = await getPaymentDetailsForAdmin({ token, payment_id: id })
      this.data = json
      // this.order = this.data['order'].map((order) => {
      //   return { order: order }
      // })
    } catch (error) {
      this.api.showError(error)
    }
  }

  //for booking: admin had accepted booking and client didn't cancel
  //then cfm payment method (payme or paypal)
  //if pay deposit, set the deposit amount
  //full pay as the same

  // TODO: can delete this page?
  confirmOrderFullPay(order: Order) {}
}
