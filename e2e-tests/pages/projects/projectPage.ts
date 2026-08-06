/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Locator, Page } from '@playwright/test'
import BasePage from '../basePage'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import AppointmentTableComponent from '../components/appointmentTableComponent'

export default class ProjectPage extends BasePage {
  readonly expect: ProjectPageAssertions

  readonly appointments: AppointmentTableComponent

  addAppointmentLinkLocator: Locator

  constructor(page: Page, expectedTitle: string) {
    super(page)
    this.expect = new ProjectPageAssertions(this, expectedTitle)
    this.appointments = new AppointmentTableComponent(page)
    this.addAppointmentLinkLocator = page.getByRole('link', { name: 'Add an appointment' })
  }

  async clickAddAppointment() {
    await this.addAppointmentLinkLocator.click()
  }
}

class ProjectPageAssertions {
  constructor(
    private readonly page: ProjectPage,
    private readonly expectedTitle: string,
  ) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText(this.expectedTitle)
  }

  async toSeeAppointmentForCrn(crn: string, date: Date) {
    const row = await this.page.appointments.getRowByContent(crn)
    await expect(row).toContainText(DateTimeFormats.dateObjtoUIDate(date))
  }
}
