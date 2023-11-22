import { DAY } from '@beenotung/tslib/time'
import {
  cancelBookingByConsumer,
  changeBookingTimeByConsumer,
  getBookingDetailsByConsumer,
  GetBookingDetailsByConsumerOutput,
  getToken,
  requestStripePaymentByConsumer,
  RequestStripePaymentByConsumerInput,
} from './../../../../sdk2'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ApiService } from '../../../api.service'
import { HOUR } from '@beenotung/tslib/time'
import QRCode from 'qrcode'
import { toQRCode } from 'src/helpers/qr-code'
import { LangService } from 'src/app/lang.service'
import { getNowDateStr, strToDate } from 'src/helpers/format'
import { Capacitor } from '@capacitor/core'

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.page.html',
  styleUrls: ['./booking-details.page.scss'],
})
export class BookingDetailsPage implements OnInit {
  dateFormat = 'yyyy-MM-dd HH:mm'

  id?: number
  data?: GetBookingDetailsByConsumerOutput

  //for change booking time
  selectedDate: string = getNowDateStr()
  selectedStartTime: string = '10:00'
  selectedFinishTime: string = '11:00'

  isShowReschedule = false

  //for alert input
  public alertButtons = ['OK']
  public alertInputs = [
    {
      placeholder: 'Name',
    },
    {
      placeholder: 'Nickname (max 8 characters)',
      attributes: {
        maxlength: 8,
      },
    },
    {
      type: 'number',
      placeholder: 'Age',
      min: 1,
      max: 100,
    },
    {
      type: 'textarea',
      placeholder: 'A little about yourself',
    },
  ]

  //for qrCode
  showQrCode = true
  qrCodeDataUrl: string | null = null

  constructor(
    private activatedRoute: ActivatedRoute,
    public api: ApiService,
    private langService: LangService,
  ) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    let id = parseInt(this.activatedRoute.snapshot.paramMap.get('id') ?? '0')
    console.log('booking id:', id)
    if (!id) return
    this.id = id
    try {
      let token = getToken()
      if (!token) return
      let json = await getBookingDetailsByConsumer({ token, booking_id: id })
      this.data = json
      this.qrCodeDataUrl = await toQRCode(this.id)
    } catch (error) {
      this.api.showError(error)
    }
  }

  async cancelBooking(booking: GetBookingDetailsByConsumerOutput['booking']) {
    try {
      let token = getToken()
      if (!token) return
      console.log('Cancelling booking...')
      console.log('date now', Date.now())
      console.log('Booking from time', booking.from_time)
      console.log(
        'Booking allow_cancel_booking_time',
        this.data?.allow_cancel_booking_time,
      )

      let json = await cancelBookingByConsumer({
        token,
        booking_id: booking.id,
      })
      booking.booking_cancel_time = json.booking_cancel_time
      this.api.showSuccess('Cancelled Booking')
      console.log('Cancelled booking:', booking)

      console.log('Cancellation time:', booking.booking_cancel_time)
    } catch (error) {
      this.api.showError(error)
    }
  }

  //logic: cannot re-arrange the time when admin accepted/rejected the booking
  async updateBookingTimeByConsumer(
    booking: GetBookingDetailsByConsumerOutput['booking'],
  ) {
    let token = getToken()
    if (!token) return
    let from_time = strToDate(
      this.selectedDate,
      this.selectedStartTime,
    ).getTime()
    let to_time = strToDate(
      this.selectedDate,
      this.selectedFinishTime,
    ).getTime()

    try {
      let json = await changeBookingTimeByConsumer({
        token,
        booking_id: booking.id,
        from_time,
        to_time,
      })
      console.log('update booking result: ', json)
      //update UI after submit successfully
      booking.from_time = from_time
      booking.to_time = to_time
      this.api.showSuccess('Change Booking Time Successfully')
    } catch (error) {
      this.api.showError(error)
    }
  }

  //TODO need testing
  //logic: cannot cancel the booking before starting less then 24 hours
  isCancelDisabled(): boolean {
    if (!this.data) {
      return true
    }
    return (
      Date.now() >=
      this.data.booking.from_time - this.data.allow_cancel_booking_time
    )
  }

  async pay(pay_for: RequestStripePaymentByConsumerInput['pay_for']) {
    try {
      let token = getToken()
      if (!token) return
      if (!this.data) return
      let json = await requestStripePaymentByConsumer({
        booking_id: this.data.booking.id,
        token,
        pay_for,
      })
      location.href = json.payment_url
    } catch (error) {
      this.api.showError(error)
    }
  }

  shouldHide() {
    return Capacitor.getPlatform() == 'ios'
  }
}
