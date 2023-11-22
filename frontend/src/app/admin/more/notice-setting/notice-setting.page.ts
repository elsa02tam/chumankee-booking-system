import { timeToDateTime } from 'src/helpers/format'
import {
  deleteNoticeByAdmin,
  getNoticeListForAdmin,
  GetNoticeListForAdminOutput,
  getToken,
  saveNoticeByAdmin,
} from './../../../../sdk2'
import { Component, OnInit } from '@angular/core'
import { ApiService } from 'src/app/api.service'
import { LangService } from 'src/app/lang.service'

@Component({
  selector: 'app-notice-setting',
  templateUrl: './notice-setting.page.html',
  styleUrls: ['./notice-setting.page.scss'],
})
export class NoticeSettingPage implements OnInit {
  data?: GetNoticeListForAdminOutput

  constructor(public api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    let token = getToken()
    if (!token) return
    try {
      this.data = await getNoticeListForAdmin({ token })
      this.data.notice.forEach((notice) => {
        if (notice.publish_time) {
          notice.publish_time = timeToDateTime(notice.publish_time) as any
        }
      })
    } catch (error) {
      this.api.showError(error)
    }
  }

  async updateNotice(notice: GetNoticeListForAdminOutput['notice'][number]) {
    let token = getToken()
    if (!token) return
    if (!this.data) return
    try {
      let json = await saveNoticeByAdmin({ token, notice })
      this.api.showSuccess('Updated Notice Successfully')
    } catch (error) {
      this.api.showError(error)
    }
  }

  async addNewNotice() {
    this.data?.notice.unshift({ id: -Math.random() } as any)
  }

  async deleteNotice(notice_id: number) {
    let token = getToken()
    if (!token) return
    try {
      await deleteNoticeByAdmin({ token, notice_id })
      this.api.showSuccess('Deleted Notice Successfully')
    } catch (error) {
      this.api.showError(error)
    }
  }
}
