import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { AddonProductPage } from './addon-product.page'

const routes: Routes = [
  {
    path: '',
    component: AddonProductPage,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddonProductPageRoutingModule {}
