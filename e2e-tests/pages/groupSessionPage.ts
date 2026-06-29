/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'
import BasePage from './basePage'
import DataTableComponent from './components/dataTableComponent'
import TeamFilterComponent from './components/teamFilterComponent'

export default class GroupSessionPage extends BasePage {
  readonly expect: GroupSessionPageAssertions

  readonly dateFieldLocator: Locator

  readonly results: DataTableComponent

  readonly teamFilter: TeamFilterComponent

  constructor(private readonly page: Page) {
    super(page)
    this.expect = new GroupSessionPageAssertions(this)
    this.teamFilter = new TeamFilterComponent(page)
    this.dateFieldLocator = page.getByLabel('Date')
    this.results = new DataTableComponent(page)
  }

  async firstProjectName(): Promise<string> {
    const link = this.results.itemsLocator.getByRole('link').nth(0)
    return link.innerText()
  }

  async clickOnProject(projectName: string) {
    const row = await this.results.getRowByContent(projectName)
    await row.getByRole('link', { name: projectName }).click()
  }

  async completeSearchForm(fromDate: Date) {
    const day = fromDate.getDate().toString()
    const month = (fromDate.getMonth() + 1).toString()
    const year = fromDate.getFullYear().toString()
    await this.dateFieldLocator.fill(`${day}/${month}/${year}`)
  }

  async submitForm() {
    await this.teamFilter.submitForm()
  }
}

class GroupSessionPageAssertions {
  constructor(private readonly page: GroupSessionPage) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText('Find a group session')
  }

  async toSeeResults() {
    await this.page.results.expect.toHaveItems()
  }
}
