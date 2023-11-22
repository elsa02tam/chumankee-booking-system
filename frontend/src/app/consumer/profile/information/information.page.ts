import { Component, OnInit } from '@angular/core'
import { ApiService } from 'src/app/api.service'
import { LangService } from 'src/app/lang.service'
import {
  getToken,
  getCompanyOperationTime,
  GetCompanyOperationTimeOutput,
} from 'src/sdk2'

@Component({
  selector: 'app-information',
  templateUrl: './information.page.html',
  styleUrls: ['./information.page.scss'],
})
export class InformationPage implements OnInit {
  company?: GetCompanyOperationTimeOutput

  weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  constructor(private api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    try {
      let token = getToken()
      if (!token) return
      let json = await getCompanyOperationTime({ token })
      this.company = json
    } catch (error) {
      this.api.showError(error)
    }
  }
}
