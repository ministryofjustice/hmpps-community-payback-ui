import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class AttendanceOutcomePage extends AppointmentFormPage {
  outcomeWithEnforcementLocator: Locator

  attendedCompliedOutcomeLocator: Locator

  attendedEnforceableOutcomeLocator: Locator

  notAttendedNotEnforcementOutcomeLocator: Locator

  constructor(page: Page) {
    super(page, 'Log attendance')
    this.outcomeWithEnforcementLocator = page.getByLabel('Unacceptable Absence')
    this.attendedCompliedOutcomeLocator = page.getByLabel('Attended - complied')
    this.attendedEnforceableOutcomeLocator = page.getByLabel('Attended - failed to comply')
    this.notAttendedNotEnforcementOutcomeLocator = page.getByLabel('Suspended')
  }

  async chooseEnforcementOutcome() {
    await this.outcomeWithEnforcementLocator.check()
  }

  async chooseAttendedCompliedOutcome() {
    await this.attendedCompliedOutcomeLocator.check()
  }

  async chooseAttendedEnforceableOutcome(): Promise<void> {
    await this.attendedEnforceableOutcomeLocator.check()
  }

  async chooseNotAttendedNotEnforcementOutcome(): Promise<void> {
    await this.notAttendedNotEnforcementOutcomeLocator.check()
  }
}
