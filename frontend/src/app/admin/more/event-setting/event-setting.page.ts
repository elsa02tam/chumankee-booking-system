import {
  getEventList,
  GetEventListOutput,
  getToken,
  saveEvent,
} from './../../../../sdk2'
import { Component, OnInit } from '@angular/core'
import { ApiService } from '../../../api.service'
import { LangService } from 'src/app/lang.service'

type Event = GetEventListOutput['events'][number]

@Component({
  selector: 'app-event-setting',
  templateUrl: './event-setting.page.html',
  styleUrls: ['./event-setting.page.scss'],
})
export class EventSettingPage implements OnInit {
  data?: GetEventListOutput

  constructor(public api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    const token = getToken()
    if (!token) return

    try {
      this.data = await getEventList({ token })
    } catch (error) {
      this.api.showError(error)
    }
  }

  async saveEvent(event: Event) {
    let token = getToken()
    if (!token) return
    try {
      let json = await saveEvent({ event, token })
      this.api.showSuccess('Save Event Successfully')

      event.id = json.id
      //new add
      event.cancel_time = null
    } catch (error) {
      this.api.showError(error)
    }
  }

  addNewEvent() {
    this.data?.events.unshift({ id: -Math.random() } as any)
  }
}
