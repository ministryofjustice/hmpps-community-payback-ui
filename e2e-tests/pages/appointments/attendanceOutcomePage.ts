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
    this.outcomeWithEnforcementLocator = page.getByLabel('Unacceptable absence')
    this.attendedCompliedOutcomeLocator = page.getByLabel('Attended \u2013 complied')
    this.attendedEnforceableOutcomeLocator = page.getByLabel('Attended \u2013 failed to comply')
    this.notAttendedNotEnforcementOutcomeLocator = page.getByLabel('Rescheduled \u2013 service request')
    this.notesFieldLocator = page.getByLabel('Notes')
    this.isSensitiveOptionLocator = page.getByLabel(
      'This is information that you believe must be recorded but not shared with a person on probation.',
    )
  }

  async chooseEnforcementOutcome() {
    await this.outcomeWithEnforcementLocator.check()
    await this.notesFieldLocator.fill('There were some issues')
  }

  async chooseAttendedCompliedOutcome() {
    await this.attendedCompliedOutcomeLocator.check()
    await this.notesFieldLocator.fill('There were some issues')
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
