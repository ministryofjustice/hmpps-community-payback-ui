import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class LogCompliancePage extends AppointmentFormPage {
  workQualityFieldLocator: Locator

  behaviourFieldLocator: Locator

  constructor(page: Page) {
    super(page, 'Log compliance')
    this.workQualityFieldLocator = page.getByRole('group', { name: 'How was their work quality?' })
    this.behaviourFieldLocator = page.getByRole('group', { name: 'How was their behaviour?' })
  }

  async enterComplianceDetails() {
    await this.workQualityFieldLocator.getByRole('radio', { name: 'Good' }).check()
    await this.behaviourFieldLocator.getByRole('radio', { name: 'Poor' }).check()
  }
}
