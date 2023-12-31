import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { CalendarPageRoutingModule } from './calendar-routing.module'
import { CalendarPage } from './calendar.page'
import { CalendarModule } from 'angular-calendar'
import { CalendarUtilsModule } from '../../calendar-utils/calendar-utils.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarPageRoutingModule,
    CalendarModule,
    CalendarUtilsModule,
  ],
  declarations: [CalendarPage],
})
export class CalendarPageModule {}
