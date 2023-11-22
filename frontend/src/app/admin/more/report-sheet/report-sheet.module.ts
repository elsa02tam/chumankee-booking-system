import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportSheetPageRoutingModule } from './report-sheet-routing.module';

import { ReportSheetPage } from './report-sheet.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportSheetPageRoutingModule
  ],
  declarations: [ReportSheetPage]
})
export class ReportSheetPageModule {}
