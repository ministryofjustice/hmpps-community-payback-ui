/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'
import BasePage from './basePage'
import DataTableComponent from './components/dataTableComponent'

export default class SessionPage extends BasePage {
  readonly expect: SessionPageAssertions

  readonly appointments: DataTableComponent

  readonly rows: Locator

  constructor(page: Page, expectedTitle: string) {
    super(page)
    this.expect = new SessionPageAssertions(this, expectedTitle)
    this.appointments = new DataTableComponent(page)
    this.rows = page.locator('tr')
  }

  async clickUpdateAnAppointment(crn: string) {
    await this.rows.filter({ hasText: crn }).getByRole('link', { name: 'Update' }).click()
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
}
