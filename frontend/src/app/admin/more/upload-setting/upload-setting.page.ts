import { Component, OnInit } from '@angular/core'
import { ApiService, toImageSrc, uploadFiles } from '../../../api.service'
import { selectFile } from '@beenotung/tslib/file'
import { UploadCustomerData, getToken } from 'src/sdk2'
import { LangService } from 'src/app/lang.service'

@Component({
  selector: 'app-upload-setting',
  templateUrl: './upload-setting.page.html',
  styleUrls: ['./upload-setting.page.scss'],
})
export class UploadSettingPage {
  constructor(public api: ApiService, private langService: LangService) {}

  t = this.langService.translate

  async uploadFile() {
    try {
      let token = getToken()
      if (!token) return
      let files = await selectFile({ multiple: true, accept: 'text/csv' })
      let file = files[0]
      if (!file) return
      let [filename] = await uploadFiles([file])
      await UploadCustomerData({ token, csv: filename })
    } catch (error) {
      console.error(error)
      this.api.showError(error)
    }
  }
}
