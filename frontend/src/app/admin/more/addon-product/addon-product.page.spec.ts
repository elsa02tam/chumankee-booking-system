import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { AddonProductPage } from './addon-product.page'

describe('AddonProductPage', () => {
  let component: AddonProductPage
  let fixture: ComponentFixture<AddonProductPage>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddonProductPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(AddonProductPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
