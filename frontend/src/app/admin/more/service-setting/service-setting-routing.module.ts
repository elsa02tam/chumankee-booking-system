import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { ServiceSettingPage } from './service-setting.page'

const routes: Routes = [
  {
    path: '',
    component: ServiceSettingPage,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceSettingPageRoutingModule {}
