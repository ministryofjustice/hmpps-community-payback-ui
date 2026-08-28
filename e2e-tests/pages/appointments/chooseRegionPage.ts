import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class ChooseRegionPage extends AppointmentFormPage {
  readonly regionInputLocator: Locator

  constructor(page: Page) {
    super(page, 'Choose region')
    this.regionInputLocator = page.getByLabel('Choose region')
  }

  chooseRegion(region: string) {
    this.regionInputLocator.selectOption({ label: region })
  }
}
