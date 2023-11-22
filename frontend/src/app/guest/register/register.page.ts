import { Component, OnInit } from '@angular/core'
import { AuthService } from 'src/app/auth/auth.service'
import { ApiService } from '../../api.service'
import { register } from 'src/sdk2'
import { LangService } from 'src/app/lang.service'

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  watchPassword = false
  username = ''
  phone = ''
  email = ''
  password = ''

  error = ''

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private langService: LangService,
  ) {}

  t = this.langService.translate

  async registerAccount() {
    try {
      let json = await register({
        username: this.username,
        phone: this.phone,
        email: this.email,
        password: this.password,
      })
      this.api.setToken(json.token)
      this.auth.navigateToHomeByRole()
    } catch (error) {
      return this.api.showError(error)
    }
  }
}
