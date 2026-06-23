/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Locator, Page } from '@playwright/test'
import BasePage from './basePage'
import AppointmentTableComponent from './components/appointmentTableComponent'

export default class SessionPage extends BasePage {
  readonly expect: SessionPageAssertions

  readonly appointments: AppointmentTableComponent

  bulkUpdateButtonLocator: Locator

  constructor(page: Page, expectedTitle: string) {
    super(page)
    this.expect = new SessionPageAssertions(this, expectedTitle)
    this.appointments = new AppointmentTableComponent(page)
    this.bulkUpdateButtonLocator = page.getByRole('button', { name: 'Bulk update' })
  }

  async clickBulkUpdate() {
    await this.bulkUpdateButtonLocator.click()
  }
}

class SessionPageAssertions {
  constructor(
    private readonly page: SessionPage,
    private readonly expectedTitle: string,
  ) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText(this.expectedTitle)
  }

  async toSeeAppointments() {
    await this.page.appointments.expect.toHaveItems()
  }

  async toSeeAppointmentForCrn(crn: string) {
    const row = await this.page.appointments.getRowByContent(crn)
    await expect(row).toBeVisible()
  }
}
