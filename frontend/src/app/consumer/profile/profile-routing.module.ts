import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { ProfilePage } from './profile.page'

const routes: Routes = [
  {
    path: '',
    component: ProfilePage,
  },
  {
    path: 'information',
    loadChildren: () =>
      import('./information/information.module').then(
        (m) => m.InformationPageModule,
      ),
  },
  {
    path: 'shopping-cart',
    loadChildren: () =>
      import('./shopping-cart/shopping-cart.module').then(
        (m) => m.ShoppingCartPageModule,
      ),
  },
  {
    path: 'plan',
    loadChildren: () =>
      import('./plan/plan.module').then((m) => m.PlanPageModule),
  },
  {
    path: 'order-history',
    loadChildren: () =>
      import('./order-history/order-history.module').then(
        (m) => m.OrderHistoryPageModule,
      ),
  },
  {
    path: 'notice-center',
    loadChildren: () =>
      import('./notice-center/notice-center.module').then(
        (m) => m.NoticeCenterPageModule,
      ),
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
