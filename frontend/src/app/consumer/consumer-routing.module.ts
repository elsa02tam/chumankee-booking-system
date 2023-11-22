import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { dev } from 'src/config'

import { ConsumerPage } from './consumer.page'

const routes: Routes = [
  {
    path: '',
    component: ConsumerPage,
    children: [
      {
        path: 'profile',
        loadChildren: () =>
          import('./profile/profile.module').then((m) => m.ProfilePageModule),
      },
      {
        path: 'booking',
        loadChildren: () =>
          import('./booking/booking.module').then((m) => m.BookingPageModule),
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'calendar',
        loadChildren: () =>
          import('./calendar/calendar.module').then(
            (m) => m.CalendarPageModule,
          ),
      },
      {
        path: 'product',
        loadChildren: () =>
          import('./product/product.module').then((m) => m.ProductPageModule),
      },
      {
        path: '',
        redirectTo: dev
          ? // '/consumer/booking'
            // '/consumer/profile/order-history'
            // '/consumer/profile'
            // '/consumer/home'
            '/consumer/calendar'
          : '/consumer/home',
        pathMatch: 'full',
      },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsumerPageRoutingModule {}
