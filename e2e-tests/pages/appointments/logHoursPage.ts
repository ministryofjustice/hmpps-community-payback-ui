import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'
import { ProjectAvailability } from '../../delius/project'

export default class LogHoursPage extends AppointmentFormPage {
  startTimeFieldLocator: Locator

  endTimeFieldLocator: Locator

  constructor(page: Page) {
    super(page, 'Log start and end time')
    this.startTimeFieldLocator = page.getByLabel('Start time')
    this.endTimeFieldLocator = page.getByLabel('End time')
  }

  async enterStartAndEndTime(availability: Pick<ProjectAvailability, 'startTime' | 'endTime'>) {
    await this.startTimeFieldLocator.fill(availability.startTime)
    await this.endTimeFieldLocator.fill(availability.endTime)
  }
}
