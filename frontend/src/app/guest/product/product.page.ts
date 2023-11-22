import { getProductList, GetProductListOutput } from './../../../sdk2'
import { Component, OnInit } from '@angular/core'
import { ApiService, toImageSrc } from 'src/app/api.service'
import { LangService } from 'src/app/lang.service'

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {
  data?: GetProductListOutput['product'] = []
  matchedResult = this.data

  //for search bar
  productName = ''

  constructor(private api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  //save img
  toImageSrc = toImageSrc

  async ngOnInit() {
    try {
      let json = await getProductList({})
      this.data = json.product
      console.log('on-init data:', this.data)
      this.searchBar()
    } catch (error) {
      this.api.showError(error)
    }
  }

  async searchBar() {
    console.log('Searching...')
    if (!this.data) return
    try {
      this.matchedResult = this.data.filter((product) => {
        // return str_contains(this.productName, product.name, true)
        return product.name
          .toLowerCase()
          .includes(this.productName.toLocaleLowerCase())
      })
    } catch (error) {
      this.api.showError(error)
    }
  }
}
