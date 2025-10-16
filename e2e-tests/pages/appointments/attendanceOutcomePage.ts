import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class AttendanceOutcomePage extends AppointmentFormPage {
  radioOptionsLocator: Locator

  constructor(page: Page) {
    super(page, 'Log attendance')
    this.radioOptionsLocator = page.getByRole('radio')
  }

  async chooseOutcome() {
    await this.radioOptionsLocator.nth(1).check()
  }
}
