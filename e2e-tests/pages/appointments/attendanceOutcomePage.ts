import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class AttendanceOutcomePage extends AppointmentFormPage {
  outcomeWithEnforcementLocator: Locator

  attendedCompliedOutcomeLocator: Locator

  attendedEnforceableOutcomeLocator: Locator

  notAttendedNotEnforcementOutcomeLocator: Locator

  notesFieldLocator: Locator

  isSensitiveOptionLocator: Locator

  constructor(page: Page) {
    super(page, 'Log attendance')
    this.outcomeWithEnforcementLocator = page.getByLabel('Unacceptable Absence')
    this.attendedCompliedOutcomeLocator = page.getByLabel('Attended - complied')
    this.attendedEnforceableOutcomeLocator = page.getByLabel('Attended - failed to comply')
    this.notAttendedNotEnforcementOutcomeLocator = page.getByLabel('Rescheduled - Service request')
    this.notesFieldLocator = page.getByLabel('Notes')
    this.isSensitiveOptionLocator = page.getByLabel('Yes, they include sensitive information')
  }

  async chooseEnforcementOutcome() {
    await this.outcomeWithEnforcementLocator.check()
    await this.notesFieldLocator.fill('There were some issues')
  }

  async chooseAttendedCompliedOutcome() {
    await this.attendedCompliedOutcomeLocator.check()
    await this.notesFieldLocator.fill('There were some issues')
    await this.isSensitiveOptionLocator.check()
  }

  async chooseAttendedEnforceableOutcome(): Promise<void> {
    await this.attendedEnforceableOutcomeLocator.check()
    await this.notesFieldLocator.fill('There were some issues')
  }

  async chooseNotAttendedNotEnforcementOutcome(): Promise<void> {
    await this.notAttendedNotEnforcementOutcomeLocator.check()
    await this.notesFieldLocator.fill('There were some issues')
  }
}
