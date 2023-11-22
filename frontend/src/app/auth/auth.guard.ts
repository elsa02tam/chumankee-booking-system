import { Inject, inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthService } from './auth.service'
import { AuthUser } from './auth.user'

let skipChecking = false

export const canActivateUser: CanActivateFn = (route, state) => {
  if (inject(AuthService).hasLogin() || skipChecking) {
    return true
  } else {
    return inject(Router).createUrlTree(['/guest/login'])
  }
}

export const canActivateByRole =
  (role: AuthUser['role']): CanActivateFn =>
  (route, state) => {
    if (inject(AuthService).getUser()?.role == role || skipChecking) {
      return true
    } else {
      return inject(Router).createUrlTree(['/guest/login'])
    }
  }
