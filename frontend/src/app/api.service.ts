import { Injectable } from '@angular/core'
import { ToastController } from '@ionic/angular'
import { Observable, Subject } from 'rxjs'
import { api_origin } from 'src/sdk2'

export const Roles = {
  super_admin: 'super_admin',
  admin: 'admin',
  service_provider: 'service_provider',
  consumer: 'consumer',
}

export enum UserRoles {
  Root,
  Guest,
  Provider,
  User,
  VIP,
  Admin,
}

export const UserRoleText: Record<number, string> = {
  [UserRoles.Root]: 'Super Admin',
  [UserRoles.Guest]: 'Guest',
  [UserRoles.Provider]: 'Service Provider',
  [UserRoles.User]: 'Consumer',
  [UserRoles.VIP]: 'VIP Consumer',
  [UserRoles.Admin]: 'Admin',
}

export enum BookingStatus {
  REJECTED,
  ACCEPTED,
  ARRIVED,
  PAID,
  DEPARTED,
  CANCELED,
  DEPOSITED,
  REFUNDED,
  PENDING,
  REFUND_PROCESSING,
  EXPIRED,
}

export declare function pathResolver(
  serviceName: string,
  methodName: string,
): string

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  static instance?: ApiService

  constructor(private toastCtl: ToastController) {
    ApiService.instance = this
  }

  updateStream = new Subject<void>()

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  getToken() {
    return localStorage.getItem('token')
  }

  async showError(error: unknown) {
    let message = String(error)
      .replace(/^TypeError: /, '')
      .replace(/^Error: /, '')
    let toast = await this.toastCtl.create({
      message,
      duration: 3500,
      color: 'danger',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler() {
            toast.dismiss()
          },
        },
      ],
    })
    toast.present()
  }

  async showSuccess(message: string) {
    let toast = await this.toastCtl.create({
      message,
      duration: 2500,
      color: 'success',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler() {
            toast.dismiss()
          },
        },
      ],
    })
    toast.present()
  }

  triggerUpdate() {
    this.updateStream.next()
  }

  wrapAutoUpdate(component: { ngOnInit(): any } | { ngAfterViewInit(): any }) {
    this.updateStream.subscribe(() => {
      if ('ngOnInit' in component) {
        component.ngOnInit()
      }
      if ('ngAfterViewInit' in component) {
        component.ngAfterViewInit()
      }
    })
  }
}

export async function uploadFiles(files: File[]) {
  let formData = new FormData()
  for (let file of files) {
    formData.append('file', file)
  }
  let res = await fetch(api_origin + '/upload', {
    method: 'POST',
    body: formData,
  })
  let json = await res.json()
  if (json.error) {
    throw new Error(json.error)
  }
  return json.filenames as string[]
}

export function toImageSrc(src_or_filename: string | null): string | null {
  if (!src_or_filename) return null
  if (src_or_filename.startsWith('http') || src_or_filename.startsWith('/')) {
    return src_or_filename
  }
  return api_origin + '/uploads/' + src_or_filename
}
