import { Component, OnInit } from '@angular/core'
import { LangService } from '../lang.service'

@Component({
  selector: 'app-consumer',
  templateUrl: './consumer.page.html',
  styleUrls: ['./consumer.page.scss'],
})
export class ConsumerPage {
  constructor(private langService: LangService) {}

  t = this.langService.translate
}
