import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { AddonServicePage } from './addon-service.page'

describe('AddonServicePage', () => {
  let component: AddonServicePage
  let fixture: ComponentFixture<AddonServicePage>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddonServicePage],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(AddonServicePage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
