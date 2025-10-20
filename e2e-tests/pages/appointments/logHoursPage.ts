import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class LogHoursPage extends AppointmentFormPage {
  startTimeFieldLocator: Locator

  endTimeFieldLocator: Locator

  penaltyHoursFieldLocator: Locator

  constructor(page: Page) {
    super(page, 'Log start and end time')
    this.startTimeFieldLocator = page.getByLabel('Start time')
    this.endTimeFieldLocator = page.getByLabel('End time')
    this.penaltyHoursFieldLocator = page.getByLabel('Penalty hours')
  }

  async enterHours() {
    await this.startTimeFieldLocator.fill('09:00')
    await this.endTimeFieldLocator.fill('17:00')
    await this.penaltyHoursFieldLocator.fill('01:00')
  }
}
