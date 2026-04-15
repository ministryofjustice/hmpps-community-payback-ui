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

  constructor(
    private readonly page: Page,
    expectedTitle: string,
  ) {
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

  async clickViewACourseCompletion() {
    const personName = this.page
      .locator('.govuk-table__body .govuk-table__row')
      .first()
      .locator('td')
      .first()
      .innerText()

    await this.courseCompletions.itemsLocator.getByRole('link', { name: 'Process' }).first().click()

    return personName
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

  async toSeeCourseCompletions() {
    await this.page.courseCompletions.expect.toHaveItems()
  }
}
