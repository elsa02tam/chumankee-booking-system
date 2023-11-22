import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { PaymentPage } from './payment.page'

const routes: Routes = [
  {
    path: '',
    component: PaymentPage,
  },
  {
    path: 'payment-details/:id',
    loadChildren: () =>
      import('./payment-details/payment-details.module').then(
        (m) => m.PaymentDetailsPageModule,
      ),
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentPageRoutingModule {}
