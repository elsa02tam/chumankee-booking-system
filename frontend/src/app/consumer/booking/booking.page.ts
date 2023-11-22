import {
  getBookingListByConsumer,
  GetBookingListByConsumerOutput,
  getToken,
} from './../../../sdk2'
import { Component, OnInit } from '@angular/core'
import { ApiService } from 'src/app/api.service'
import { Router } from '@angular/router'
import { LangService } from 'src/app/lang.service'

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
})
export class BookingPage implements OnInit {
  dateFormat = 'yyyy-MM-dd HH:mm'
  hkTimeZone = ''

  data?: GetBookingListByConsumerOutput['bookings'] = []
  matchedResult = this.data

  bookingId = ''

  constructor(
    private api: ApiService,
    public router: Router,
    private langService: LangService,
  ) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    try {
      let token = getToken()
      if (!token) return
      let json = await getBookingListByConsumer({ token })
      this.data = json.bookings
      console.log('booking: ', this.data)

      this.searchBar()
    } catch (error) {
      this.api.showError(error)
    }
  }

  searchBar() {
    console.log('Searching...')
    if (!this.data) return
    try {
      this.matchedResult = this.data.filter((booking) => {
        return booking.id?.toString().includes(this.bookingId)
      })
    } catch (error) {
      console.log('Error filtering bookings:', error)
    }
  }
  goToBookingDetailsPage(bookingId?: any) {
    if (bookingId) {
      this.router.navigateByUrl(
        `/consumer/booking/booking-details/${bookingId}`,
      )
    } else {
      console.log('Booking is null or undefined')
    }
  }
}
