import { Component, OnInit } from '@angular/core'
import { LangService } from '../lang.service'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage {
  constructor(public langService: LangService) {}

  t = this.langService.translate
}
