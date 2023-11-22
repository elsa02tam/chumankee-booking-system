import { Component, OnInit } from '@angular/core'
import { ApiService, toImageSrc } from '../../../api.service'
import { ActivatedRoute } from '@angular/router'
import { AuthService } from '../../../auth/auth.service'
import {
  getServiceProviderProfile,
  GetServiceProviderProfileOutput,
  getToken,
} from 'src/sdk2'
import { LangService } from 'src/app/lang.service'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user?: GetServiceProviderProfileOutput
  pic?: string | null

  constructor(
    public api: ApiService,
    private activatedRoute: ActivatedRoute,
    private apiService: AuthService,
    private langService: LangService,
  ) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  weekdayLabels = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]

  async ngOnInit() {
    //get id and username from token
    try {
      let token = getToken()
      console.log({ token })
      if (!token) return
      let profile = await getServiceProviderProfile({ token })
      this.pic = toImageSrc(profile.profile.pic)
      console.log('Profile:', profile)
      let serviceTimes = [...profile.serviceTimes]
      console.log('times:', serviceTimes)
      for (let week_day = 0; week_day < 7; week_day++) {
        let row = serviceTimes.find((s) => s.week_day === week_day)
        profile.serviceTimes[week_day] = {
          week_day,
          from_time: row?.from_time || '',
          to_time: row?.to_time || '',
        }
      }
      this.user = profile
    } catch (error) {
      this.api.showError(error)
    }
  }
}
