import { ApiService } from './../../../api.service'
import { Component, OnInit } from '@angular/core'
import {
  getEmailTemplatesForAdmin,
  GetEmailTemplatesForAdminOutput,
  getToken,
  resetEmailTemplateForAdmin,
  updateEmailTemplateForAdmin,
} from 'src/sdk2'
import { LangService } from 'src/app/lang.service'

type Template = GetEmailTemplatesForAdminOutput['templates'][number]

@Component({
  selector: 'app-email-settings',
  templateUrl: './email-settings.page.html',
  styleUrls: ['./email-settings.page.scss'],
})
export class EmailSettingsPage implements OnInit {
  templates?: Template[]

  constructor(private api: ApiService, private langService: LangService) {}

  t = this.langService.translate

  get lang() {
    return this.langService.lang
  }

  async ngOnInit() {
    let token = getToken()
    if (!token) return
    try {
      let json = await getEmailTemplatesForAdmin({ token })
      this.templates = json.templates
    } catch (error) {
      this.api.showError(error)
    }
  }

  hasUsed(template: Template, variable: string): boolean {
    return template.content.includes(`{${variable}}`)
  }

  async save(template: Template) {
    let token = getToken()
    if (!token) return
    try {
      await updateEmailTemplateForAdmin({
        id: template.id,
        content: template.content,
        token,
      })
      await this.api.showSuccess('Updated email template')
    } catch (error) {
      this.api.showError(error)
    }
  }

  async reset(template: Template) {
    let token = getToken()
    if (!token) return
    try {
      await resetEmailTemplateForAdmin({
        id: template.id,
        token,
      })
      await this.api.showSuccess('You have reset email template')
      template.content = template.default_content
    } catch (error) {
      this.api.showError(error)
    }
  }
}
