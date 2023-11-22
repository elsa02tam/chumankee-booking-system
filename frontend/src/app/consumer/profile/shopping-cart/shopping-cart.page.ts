import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import {
  addProductToShoppingCart,
  chooseShoppingCartCouponByConsumer,
  getShoppingCartDataByConsumer,
  GetShoppingCartDataByConsumerOutput,
  getToken,
  removeProductFromCartByConsumer,
  submitShoppingCartByConsumer,
} from 'src/sdk2'
import { ApiService, toImageSrc } from 'src/app/api.service'
import { LangService } from 'src/app/lang.service'

type OrderPart = GetShoppingCartDataByConsumerOutput['orderParts'][number]
// type AddonProduct = GetShoppingCartDataByConsumerOutput['addonProducts'][number]

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.page.html',
  styleUrls: ['./shopping-cart.page.scss'],
})
export class ShoppingCartPage implements OnInit {
  dateFormat = 'yyyy-MM-dd HH:mm'

  data?: GetShoppingCartDataByConsumerOutput
  orderPart: Array<{ order: OrderPart }> = []

  selectedAddonProductID: number[] = []

  constructor(
    public router: Router,
    public api: ApiService,
    private langService: LangService,
  ) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  //save img
  toImageSrc = toImageSrc

  async ngOnInit() {
    try {
      let token = getToken()
      if (!token) return

      let json = await getShoppingCartDataByConsumer({ token })
      this.data = json
      //check whether it had order or not
      this.orderPart = this.data['orderParts'].map((orderPart) => {
        return { order: orderPart }
      })
      // this.addonProducts = this.data['addonProducts'].map((addonProduct) => {
      //   return { product: addonProduct }
      // })
      console.log('data: ', this.data)
      console.log('order part: ', this.orderPart)
      // console.log('addon: ', this.data.addonProducts)
      // console.log('addonProduct: ', this.addonProducts)
    } catch (error) {
      this.api.showError(error)
    }
  }

  async savePromoCode(coupon_code: string) {
    try {
      let token = getToken()
      if (!token) return
      await chooseShoppingCartCouponByConsumer({ token, coupon_code })
      this.api.showSuccess('chosen promo code: ' + coupon_code)
    } catch (error) {
      this.api.showError(error)
    }
  }

  async deleteOrder(product_id: number) {
    if (!this.data) return
    try {
      let token = getToken()
      if (!token) return
      await removeProductFromCartByConsumer({ token, product_id })
      this.api.showSuccess('Deleted product ' + product_id + ' successfully!')
      this.data.orderParts = this.data.orderParts.filter(
        (part) => part.product_id !== product_id,
      )
    } catch (error) {
      this.api.showError(error)
    }
  }

  routerModel(path: string) {
    this.router.navigateByUrl(path)
  }

  async checkout() {
    if (!this.data) return
    try {
      let token = getToken()
      if (!token) return
      let json = await submitShoppingCartByConsumer({
        token,
        shopping_cart_id: this.data.order_id,
      })
      json.checkout_time
      this.api.showSuccess('Submit Shopping Cart Successfully !')
    } catch (error) {
      this.api.showError(error)
    }
  }

  async addonProductAddToShoppingCart(id: number) {
    let token = getToken()
    if (!token) return
    try {
      await addProductToShoppingCart({
        token,
        product_id: id,
      })
      this.api.showSuccess('Added Add-on Product to Cart Successfully!')
    } catch (error) {
      this.api.showError(error)
    }
  }
}
