import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { NoticeCenterPage } from './notice-center.page'

const routes: Routes = [
  {
    path: '',
    component: NoticeCenterPage,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoticeCenterPageRoutingModule {}
