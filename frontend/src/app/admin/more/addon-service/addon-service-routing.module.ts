import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { AddonServicePage } from './addon-service.page'

const routes: Routes = [
  {
    path: '',
    component: AddonServicePage,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddonServicePageRoutingModule {}
