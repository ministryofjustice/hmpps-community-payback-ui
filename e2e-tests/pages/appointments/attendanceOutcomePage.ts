import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class AttendanceOutcomePage extends AppointmentFormPage {
  radioOptionsLocator: Locator

  outcomeWithEnforcementLocator: Locator

  constructor(page: Page) {
    super(page, 'Log attendance')
    this.radioOptionsLocator = page.getByRole('radio')
    this.outcomeWithEnforcementLocator = page.getByLabel('Unacceptable Absence')
  }

  async chooseEnforcementOutcome() {
    await this.outcomeWithEnforcementLocator.check()
  }

  async chooseOutcome() {
    await this.radioOptionsLocator.nth(1).check()
  }
}
