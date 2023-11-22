import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { BookingPage } from './booking.page'

const routes: Routes = [
  {
    path: '',
    component: BookingPage,
  },
  {
    path: 'booking-details/:id',
    loadChildren: () =>
      import('./booking-details/booking-details.module').then(
        (m) => m.BookingDetailsPageModule,
      ),
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingPageRoutingModule {}
