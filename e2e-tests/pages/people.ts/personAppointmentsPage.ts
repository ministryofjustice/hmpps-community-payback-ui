/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Locator, Page } from '@playwright/test'
import BasePage from '../basePage'
import AppointmentTableComponent from '../components/appointmentTableComponent'

export default class PersonAppointmentsPage extends BasePage {
  readonly expect: PersonAppointmentsPageAssertions

  readonly appointments: AppointmentTableComponent

  addAppointmentLinkLocator: Locator

  constructor(page: Page, expectedTitle: string) {
    super(page)
    this.expect = new PersonAppointmentsPageAssertions(this, expectedTitle)
    this.appointments = new AppointmentTableComponent(page)
    this.addAppointmentLinkLocator = page.getByRole('button', { name: 'Add an induction' })
  }

  async clickAddAppointment() {
    await this.addAppointmentLinkLocator.click()
  }
}

class PersonAppointmentsPageAssertions {
  constructor(
    private readonly page: PersonAppointmentsPage,
    private readonly expectedTitle: string,
  ) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText(this.expectedTitle)
  }
}
