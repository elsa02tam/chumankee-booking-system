import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { PackageSettingPage } from './package-setting.page'

const routes: Routes = [
  {
    path: '',
    component: PackageSettingPage,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackageSettingPageRoutingModule {}
