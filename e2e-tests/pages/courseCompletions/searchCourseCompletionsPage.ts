/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Locator, Page } from '@playwright/test'
import BasePage from '../basePage'
import DataTableComponent from '../components/dataTableComponent'
import PduFilterComponent from '../components/pduFilterComponent'
import { Team } from '../../fixtures/testOptions'

export default class SearchCourseCompletionsPage extends BasePage {
  readonly expect: SearchCourseCompletionsPageAssertions

  readonly courseCompletions: DataTableComponent

  readonly fromDayFieldLocator: Locator

  readonly fromMonthFieldLocator: Locator

  readonly fromYearFieldLocator: Locator

  readonly toDayFieldLocator: Locator

  readonly toMonthFieldLocator: Locator

  readonly toYearFieldLocator: Locator

  readonly teamSelectLocator: Locator

  readonly searchButtonLocator: Locator

  readonly applyRegionLocator: Locator

  readonly pduFilter: PduFilterComponent

  readonly noResultsMessage: Locator

  private readonly page: Page

  constructor(page: Page, expectedTitle: string) {
    super(page)
    this.expect = new SearchCourseCompletionsPageAssertions(this, expectedTitle)
    this.courseCompletions = new DataTableComponent(page)

    this.pduFilter = new PduFilterComponent(page)
    this.fromDayFieldLocator = page.getByLabel('day').nth(0)
    this.fromMonthFieldLocator = page.getByLabel('month').nth(0)
    this.fromYearFieldLocator = page.getByLabel('year').nth(0)
    this.toDayFieldLocator = page.getByLabel('day').nth(1)
    this.toMonthFieldLocator = page.getByLabel('month').nth(1)
    this.toYearFieldLocator = page.getByLabel('year').nth(1)
    this.searchButtonLocator = page.getByRole('button', { name: 'Apply filters' })
    this.applyRegionLocator = page.getByRole('button', { name: 'Apply', exact: true })
    this.noResultsMessage = page.getByRole('heading', { name: 'No results found' })
    this.page = page
  }

  async completeSearchForm(team: Team) {
    await this.pduFilter.selectRegion(team.provider)
    await this.pduFilter.selectPdu(team.pdu)
  }

  async applyRegion() {
    await this.applyRegionLocator.click()
  }

  async submitForm() {
    await this.searchButtonLocator.click()
  }

  async clickCourseCompletion(personName: string) {
    const row = await this.courseCompletions.getRowByContent(personName)
    await this.clickProcess(row)
  }

  async clickProcess(row: Locator) {
    await row.getByRole('link', { name: 'Process' }).click()
  }

  async clickSortByDateCompleted() {
    await this.page.locator('a.moj-sortable-table__button').filter({ hasText: 'Date completed' }).click()
  }

  async clickSortByDateCompletedAscending() {
    await this.clickSortByDateCompleted()
    await this.clickSortByDateCompleted()
  }
}

class SearchCourseCompletionsPageAssertions {
  constructor(
    private readonly page: SearchCourseCompletionsPage,
    private readonly expectedTitle: string,
  ) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText(this.expectedTitle)
  }

  async toSeeSearchResults() {
    try {
      // First check to see if any results shown
      await this.page.courseCompletions.expect.toHaveItems()
    } catch {
      // Otherwise we can validate a search result has been performed by checking for the no results message
      await expect(this.page.noResultsMessage).toBeVisible()
    }
  }
}
