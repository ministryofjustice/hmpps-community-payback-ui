import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class LogCompliancePage extends AppointmentFormPage {
  hiVisFieldLocator: Locator

  workedIntensivelyFieldLocator: Locator

  workedQualityFieldLocator: Locator

  behaviourFieldLocator: Locator

  constructor(page: Page) {
    super(page, 'Log compliance')
    this.hiVisFieldLocator = page.getByRole('group', { name: 'Did they wear hi-vis?' })
    this.workedIntensivelyFieldLocator = page.getByRole('group', { name: 'Are they working intensively' })
    this.workedQualityFieldLocator = page.getByRole('group', { name: 'How was their work quality?' })
    this.behaviourFieldLocator = page.getByRole('group', { name: 'How was their behaviour?' })
  }

  async enterComplianceDetails() {
    await this.hiVisFieldLocator.getByRole('radio', { name: 'Yes' }).check()
    await this.workedIntensivelyFieldLocator.getByRole('radio', { name: 'Yes' }).check()
    await this.workedQualityFieldLocator.getByRole('radio', { name: 'Good' }).check()
    await this.behaviourFieldLocator.getByRole('radio', { name: 'Poor' }).check()
  }
}
