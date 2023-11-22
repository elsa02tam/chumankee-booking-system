import { Component, OnInit } from '@angular/core'
import { ApiService } from 'src/app/api.service'
import { LangService } from 'src/app/lang.service'
import {
  getPlanListForConsumer,
  getToken,
  GetPlanListForConsumerOutput,
} from 'src/sdk2'

@Component({
  selector: 'app-plan',
  templateUrl: './plan.page.html',
  styleUrls: ['./plan.page.scss'],
})
export class PlanPage implements OnInit {
  dateFormat = 'yyyy-MM-dd HH:mm'

  data?: GetPlanListForConsumerOutput

  constructor(private api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    try {
      let token = getToken()
      if (!token) return
      let json = await getPlanListForConsumer({ token })
      this.data = json
      console.log('json: ', this.data)
    } catch (error) {
      this.api.showError(error)
    }
  }
}
