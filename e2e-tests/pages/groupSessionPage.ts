/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'
import BasePage from './basePage'
import DataTableComponent from './components/dataTableComponent'
import TeamFilterComponent from './components/teamFilterComponent'

export default class GroupSessionPage extends BasePage {
  readonly expect: GroupSessionPageAssertions

  readonly fromDayFieldLocator: Locator

  readonly fromMonthFieldLocator: Locator

  readonly fromYearFieldLocator: Locator

  readonly results: DataTableComponent

  readonly teamFilter: TeamFilterComponent

  constructor(private readonly page: Page) {
    super(page)
    this.expect = new GroupSessionPageAssertions(this)
    this.teamFilter = new TeamFilterComponent(page)
    this.fromDayFieldLocator = page.getByLabel('day')
    this.fromMonthFieldLocator = page.getByLabel('month')
    this.fromYearFieldLocator = page.getByLabel('year')
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
    await this.fromDayFieldLocator.fill(fromDate.getDate().toString())
    await this.fromMonthFieldLocator.fill((fromDate.getMonth() + 1).toString().padStart(2, '0'))
    await this.fromYearFieldLocator.fill(fromDate.getFullYear().toString())
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
