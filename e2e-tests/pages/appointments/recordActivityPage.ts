import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'
import DatePickerComponent from '../components/datePickerComponent'
import { ProjectAvailability } from '../../delius/project'

export default class RecordActivityPage extends AppointmentFormPage {
  readonly datePickerComponent: DatePickerComponent

  readonly startTimeFieldLocator: Locator

  readonly endTimeFieldLocator: Locator

  readonly attendedCompliedOutcomeLocator: Locator

  readonly notesFieldLocator: Locator

  constructor(page: Page) {
    super(page, 'Log attendance')
    this.datePickerComponent = new DatePickerComponent(page)
    this.startTimeFieldLocator = page.getByLabel('Start time')
    this.endTimeFieldLocator = page.getByLabel('End time')
    this.attendedCompliedOutcomeLocator = page.getByLabel('Attended \u2013 complied')
    this.notesFieldLocator = page.getByLabel('Notes')
  }

  async enterStartAndEndTime(availability: Pick<ProjectAvailability, 'startTime' | 'endTime'>) {
    await this.startTimeFieldLocator.fill(availability.startTime)
    await this.endTimeFieldLocator.fill(availability.endTime)
  }

  async chooseAttendedCompliedOutcome() {
    await this.attendedCompliedOutcomeLocator.check()
    await this.notesFieldLocator.fill('There were some issues')
  }
}
