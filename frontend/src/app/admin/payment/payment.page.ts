import {
  getPaymentListForAdmin,
  GetPaymentListForAdminOutput,
  getToken,
} from './../../../sdk2'
import { Component, OnInit } from '@angular/core'
import { ApiService, toImageSrc } from '../../api.service'
import { Router } from '@angular/router'
import { LangService } from 'src/app/lang.service'

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {
  dateFormat = 'yyyy-MM-dd HH:mm'

  paymentId = ''

  tab: 'booking' | 'order' = 'booking'

  //get payment array
  data?: GetPaymentListForAdminOutput
  matchedResult?: GetPaymentListForAdminOutput

  constructor(
    public api: ApiService,
    public router: Router,
    public langService: LangService,
  ) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  //save img
  toImageSrc = toImageSrc

  async ngOnInit() {
    try {
      let token = getToken()
      if (!token) return
      console.log('token: ', token)

      let json = await getPaymentListForAdmin({ token })
      this.data = json
      console.log('json: ', json)

      this.searchBar()
      console.log('json:', json)
    } catch (error) {
      this.api.showError(error)
    }
  }

  async searchBar() {
    console.log('Searching...')
    if (!this.data) return

    this.matchedResult = {
      booking_payments: this.data.booking_payments.filter((booking) =>
        String(booking.payment.id).includes(this.paymentId),
      ),
      order_payments: this.data.order_payments.filter((order) =>
        String(order.payment.id).includes(this.paymentId),
      ),
    }
  }

  goToPaymentDetailsPage(paymentId?: any) {
    if (paymentId) {
      this.router.navigateByUrl(`/admin/payment/payment-details/${paymentId}`)
    } else {
      console.log('Payment is null or undefined')
    }
  }
}
