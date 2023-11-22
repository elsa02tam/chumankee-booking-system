import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { dev } from 'src/config'

import { AdminPage } from './admin.page'

const routes: Routes = [
  {
    path: '',
    component: AdminPage,
    children: [
      {
        path: 'more',
        loadChildren: () =>
          import('./more/more.module').then((m) => m.MorePageModule),
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'booking',
        loadChildren: () =>
          import('./booking/booking.module').then((m) => m.BookingPageModule),
      },
      {
        path: 'payment',
        loadChildren: () =>
          import('./payment/payment.module').then((m) => m.PaymentPageModule),
      },
      {
        path: 'order',
        loadChildren: () =>
          import('./order/order.module').then((m) => m.OrderPageModule),
      },
      {
        path: 'calendar',
        loadChildren: () =>
          import('./calendar/calendar.module').then(
            (m) => m.CalendarPageModule,
          ),
      },

      {
        path: '',
        redirectTo: dev
          ? /* dev */
            // '/admin/more'
            // '/admin/more/addon-service'
            // '/admin/more/upload-setting'
            // '/admin/booking'
            // '/admin/more/notice-setting'
            '/admin/more/coupon-setting'
          : '/admin/home',
        pathMatch: 'full',
      },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
