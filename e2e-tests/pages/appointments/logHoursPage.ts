import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'
import HoursMinutesInputComponent from '../components/hoursMinutesInputComponent'

export default class LogHoursPage extends AppointmentFormPage {
  startTimeFieldLocator: Locator

  endTimeFieldLocator: Locator

  hoursMinutesInput: HoursMinutesInputComponent

  constructor(page: Page) {
    super(page, 'Log start and end time')
    this.startTimeFieldLocator = page.getByLabel('Start time')
    this.endTimeFieldLocator = page.getByLabel('End time')
    this.hoursMinutesInput = new HoursMinutesInputComponent(page)
  }

  async enterPenaltyHours(hours = '1', minutes = '00') {
    await this.hoursMinutesInput.enterHours(hours, minutes)
  }
}
