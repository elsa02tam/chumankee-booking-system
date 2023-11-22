import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { UploadSettingPage } from './upload-setting.page'

const routes: Routes = [
  {
    path: '',
    component: UploadSettingPage,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UploadSettingPageRoutingModule {}
