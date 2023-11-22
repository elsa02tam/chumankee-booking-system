import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { EventSettingPage } from './event-setting.page'

const routes: Routes = [
  {
    path: '',
    component: EventSettingPage,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventSettingPageRoutingModule {}
