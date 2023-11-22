import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { AuthUser } from './auth.user'
import jwt_decode from 'jwt-decode'
import { ApiService } from '../api.service'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(public router: Router, public api: ApiService) {}

  hasLogin(): boolean {
    return !!this.getUser()
  }

  getUser(): AuthUser | null {
    let token = this.api.getToken()
    if (!token) return null
    try {
      let payload = jwt_decode<AuthUser>(token)
      console.log('jwt payload:', payload)
      return payload
    } catch (error) {
      return null
    }
  }

  navigateToHomeByRole() {
    switch (this.getUser()?.role) {
      case 'super_admin':
        this.router.navigateByUrl('/root')
        break
      case 'admin':
        this.router.navigateByUrl('/admin')
        break
      case 'consumer':
        this.router.navigateByUrl('/consumer')
        break
      case 'service_provider':
        this.router.navigateByUrl('/service-provider')
        break
      default:
        this.router.navigateByUrl('/guest')
        break
    }
  }
}
