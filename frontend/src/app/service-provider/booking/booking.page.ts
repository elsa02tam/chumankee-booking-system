import { Component, OnInit } from '@angular/core'
import { ApiService } from 'src/app/api.service'
import {
  getToken,
  getBookingListsByServiceProvider,
  GetBookingListsByServiceProviderOutput,
} from 'src/sdk2'
import { LangService } from 'src/app/lang.service'

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
})
export class BookingPage implements OnInit {
  data?: GetBookingListsByServiceProviderOutput['booking'] = []
  matchedResult = this.data

  serviceName = ''
  ConsumerName = ''

  constructor(private api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    try {
      let token = getToken()
      if (!token) return
      let json = await getBookingListsByServiceProvider({ token })
      this.data = json.booking
      this.searchBar()
      console.log('booking: ', this.data)
    } catch (error) {
      this.api.showError(error)
    }
  }

  //search function
  async searchBar() {
    if (!this.data) return
    this.matchedResult = this.data.filter(
      (dataResult) =>
        dataResult.service.name.includes(this.serviceName) &&
        dataResult.user.username.includes(this.ConsumerName),
    )
  }
}
