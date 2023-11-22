import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { BookingDetailsPageRoutingModule } from './booking-details-routing.module'
import { BookingDetailsPage } from './booking-details.page'
import { CalendarModule } from 'angular-calendar'
import { CalendarUtilsModule } from '../../../calendar-utils/calendar-utils.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookingDetailsPageRoutingModule,
    CalendarModule,
    CalendarUtilsModule,
  ],
  declarations: [BookingDetailsPage],
})
export class BookingDetailsPageModule {}
