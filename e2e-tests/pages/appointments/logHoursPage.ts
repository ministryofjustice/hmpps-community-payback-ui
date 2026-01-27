import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class LogHoursPage extends AppointmentFormPage {
  startTimeFieldLocator: Locator

  endTimeFieldLocator: Locator

  penaltyTimeHoursFieldLocator: Locator

  penaltyTimeMinutesFieldLocator: Locator

  constructor(page: Page) {
    super(page, 'Log start and end time')
    this.startTimeFieldLocator = page.getByLabel('Start time')
    this.endTimeFieldLocator = page.getByLabel('End time')
    this.penaltyTimeHoursFieldLocator = page.getByLabel('Hours')
    this.penaltyTimeMinutesFieldLocator = page.getByLabel('Minutes')
  }

  async enterPenaltyHours() {
    await this.penaltyTimeHoursFieldLocator.fill('1')
    await this.penaltyTimeMinutesFieldLocator.fill('00')
  }
}
