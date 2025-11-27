/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'
import BasePage from './basePage'
import DataTableComponent from './components/dataTableComponent'

export default class TrackProgressPage extends BasePage {
  readonly expect: TrackProgressPageAssertions

  readonly fromDayFieldLocator: Locator

  readonly fromMonthFieldLocator: Locator

  readonly fromYearFieldLocator: Locator

  readonly toDayFieldLocator: Locator

  readonly toMonthFieldLocator: Locator

  readonly toYearFieldLocator: Locator

  readonly teamSelectLocator: Locator

  readonly searchButtonLocator: Locator

  readonly results: DataTableComponent

  constructor(private readonly page: Page) {
    super(page)
    this.expect = new TrackProgressPageAssertions(this)

    this.fromDayFieldLocator = page.getByLabel('day').nth(0)
    this.fromMonthFieldLocator = page.getByLabel('month').nth(0)
    this.fromYearFieldLocator = page.getByLabel('year').nth(0)
    this.toDayFieldLocator = page.getByLabel('day').nth(1)
    this.toMonthFieldLocator = page.getByLabel('month').nth(1)
    this.toYearFieldLocator = page.getByLabel('year').nth(1)
    this.teamSelectLocator = page.getByRole('combobox', { name: /team/i })
    this.searchButtonLocator = page.getByRole('button', { name: 'Search' })
    this.results = new DataTableComponent(page)
  }

  async firstProjectName(): Promise<string> {
    const link = this.results.itemsLocator.getByRole('link').nth(0)
    return link.innerText()
  }

  async clickOnProject(projectName: string) {
    await this.page.getByRole('link', { name: projectName }).first().click()
  }

  async completeSearchForm() {
    await this.teamSelectLocator.selectOption({ value: 'N56DTX' })
    await this.fromDayFieldLocator.fill('07')
    await this.fromMonthFieldLocator.fill('08')
    await this.fromYearFieldLocator.fill('2025')
    await this.toDayFieldLocator.fill('14')
    await this.toMonthFieldLocator.fill('08')
    await this.toYearFieldLocator.fill('2025')
  }

  async submitForm() {
    await this.searchButtonLocator.click()
  }
}

class TrackProgressPageAssertions {
  constructor(private readonly page: TrackProgressPage) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText('Track progress on Community Payback')
  }

  async toSeeResults() {
    await this.page.results.expect.toHaveItems()
  }
}
