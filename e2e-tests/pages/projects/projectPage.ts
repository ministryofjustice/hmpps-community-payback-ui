/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Page } from '@playwright/test'
import BasePage from '../basePage'
import DataTableComponent from '../components/dataTableComponent'

export default class ProjectPage extends BasePage {
  readonly expect: ProjectPageAssertions

  readonly appointments: DataTableComponent

  constructor(
    private readonly page: Page,
    expectedTitle: string,
  ) {
    super(page)
    this.expect = new ProjectPageAssertions(this, expectedTitle)
    this.appointments = new DataTableComponent(page)
  }

  async clickUpdateAnAppointment(crn: string) {
    await this.appointments.itemsLocator.filter({ hasText: crn }).getByRole('link', { name: 'Update' }).click()
  }

  async goto(projectCode: string) {
    await this.page.goto(`/projects/${projectCode}`)
    await this.expect.toBeOnThePage()
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

  async toSeeAppointmentForCrn(crn: string) {
    const row = await this.page.appointments.getRowByContent(crn)
    await expect(row).toBeVisible()
  }
}
