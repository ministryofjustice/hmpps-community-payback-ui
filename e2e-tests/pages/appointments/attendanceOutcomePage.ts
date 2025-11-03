import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class AttendanceOutcomePage extends AppointmentFormPage {
  outcomeWithEnforcementLocator: Locator

  attendedCompliedOutcomeLocator: Locator

  constructor(page: Page) {
    super(page, 'Log attendance')
    this.outcomeWithEnforcementLocator = page.getByLabel('Unacceptable Absence')
    this.attendedCompliedOutcomeLocator = page.getByLabel('Attended - complied')
  }

  async chooseEnforcementOutcome() {
    await this.outcomeWithEnforcementLocator.check()
  }

  async chooseAttendedCompliedOutcome() {
    await this.attendedCompliedOutcomeLocator.check()
  }
}
