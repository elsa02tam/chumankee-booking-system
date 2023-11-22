import {
  getCouponListByAdmin,
  getToken,
  promoteCouponCodeEmailByAdmin,
  saveCouponByAdmin,
} from 'src/sdk2'
import { GetCouponListByAdminOutput } from './../../../../sdk2'
import { Component, OnInit } from '@angular/core'
import { ApiService } from '../../../api.service'
import { dateTimeToTime, timeToDateTime } from 'src/helpers/format'
import { LangService } from 'src/app/lang.service'

type Coupon = GetCouponListByAdminOutput['coupons'][number]

@Component({
  selector: 'app-coupon-setting',
  templateUrl: './coupon-setting.page.html',
  styleUrls: ['./coupon-setting.page.scss'],
})
export class CouponSettingPage implements OnInit {
  //for date formatting
  dateFormat = 'yyyy-MM-dd HH:mm'

  //for selected tab
  tab: 'all' | 'booking' | 'order' = 'all'

  //get the data array
  data?: GetCouponListByAdminOutput
  coupons?: Coupon[]

  // for sent email function
  email: string = ''

  constructor(public api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    try {
      let token = getToken()
      if (!token) return
      let json = await getCouponListByAdmin({ token })
      this.data = json
      this.data.coupons.forEach((coupon) => {
        if (coupon.expired_time) {
          coupon.expired_time = timeToDateTime(coupon.expired_time) as any
        }
        coupon.service_ids = Object.fromEntries(
          coupon.service_ids.map((id) => [id, true]),
        ) as any
        coupon.product_ids = Object.fromEntries(
          coupon.product_ids.map((id) => [id, true]),
        ) as any
      })
      this.applyFilter()
    } catch (error) {
      this.api.showError(error)
    }
  }

  applyFilter() {
    switch (this.tab) {
      case 'all':
        this.coupons = this.data?.coupons
        break
      case 'booking':
        this.coupons = this.data?.coupons.filter(
          (coupon) => coupon.service_ids.length > 0 || coupon.is_any_service,
        )
        break
      case 'order':
        this.coupons = this.data?.coupons.filter(
          (coupon) => coupon.product_ids.length > 0 || coupon.is_any_product,
        )
    }
  }

  async saveCoupon(coupon: Coupon) {
    let token = getToken()
    if (!token) return
    try {
      let json = await saveCouponByAdmin({
        token,
        coupon: {
          ...coupon,

          expired_time: dateTimeToTime(coupon.expired_time as any),

          product_ids: Object.entries(coupon.product_ids)
            .filter(([id, checked]) => checked)
            .map(([id, checked]) => +id),

          service_ids: Object.entries(coupon.service_ids)
            .filter(([id, checked]) => checked)
            .map(([id, checked]) => +id),
        },
      })
      coupon.id = json.id
      this.api.showSuccess('saved coupon')
    } catch (error) {
      this.api.showError(error)
    }
  }

  addCoupon() {
    this.data?.coupons.unshift({ id: -Math.random() } as any)
  }
  json(x: any) {
    return JSON.stringify(x, null, 2)
  }

  async sendPromoteEmail(coupon: Coupon) {
    let token = getToken()
    if (!token) return
    try {
      await promoteCouponCodeEmailByAdmin({
        token,
        coupon_id: coupon.id,
        email: this.email,
      })
      this.api.showSuccess('Sent Email Successfully!')
    } catch (error) {
      this.api.showError(error)
    }
  }
}
