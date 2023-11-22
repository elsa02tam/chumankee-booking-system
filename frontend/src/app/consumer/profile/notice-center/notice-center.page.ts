import {
  getNoticeListForConsumer,
  GetNoticeListForConsumerOutput,
  getToken,
} from './../../../../sdk2'
import { Component, OnInit } from '@angular/core'
import { ApiService } from 'src/app/api.service'
import { LangService } from 'src/app/lang.service'
import { timeToDateTime } from 'src/helpers/format'

@Component({
  selector: 'app-notice-center',
  templateUrl: './notice-center.page.html',
  styleUrls: ['./notice-center.page.scss'],
})
export class NoticeCenterPage implements OnInit {
  dateFormat = 'yyyy-MM-dd HH:mm'

  data?: GetNoticeListForConsumerOutput

  constructor(public api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    let token = getToken()
    if (!token) return
    try {
      this.data = await getNoticeListForConsumer({ token })
      this.data.notice.forEach((notice) => {
        if (notice.publish_time) {
          notice.publish_time = timeToDateTime(notice.publish_time) as any
        }
      })
    } catch (error) {
      this.api.showError(error)
    }
  }
}
