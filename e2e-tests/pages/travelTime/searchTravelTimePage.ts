/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Page } from '@playwright/test'
import BasePage from '../basePage'
import DataTableComponent from '../components/dataTableComponent'
import PduFilterComponent from '../components/pduFilterComponent'
import { Team } from '../../fixtures/testOptions'

export default class SearchTravelTimePage extends BasePage {
  readonly expect: SearchTravelTimePageAssertions

  readonly results: DataTableComponent

  readonly pduFilter: PduFilterComponent

  private readonly page: Page

  constructor(page: Page) {
    super(page)
    this.pduFilter = new PduFilterComponent(page)
    this.expect = new SearchTravelTimePageAssertions(this)
    this.results = new DataTableComponent(page)
    this.page = page
  }

  async clickUpdateAnAppointment(crn: string) {
    const row = await this.results.getRowByContent(crn)
    await row.getByRole('link', { name: 'Update' }).click()
  }

  async completeSearchForm(team: Team) {
    await this.pduFilter.selectRegion(team.provider)
  }

  async clickSortByDate() {
    await this.page.locator('a.moj-sortable-table__button').filter({ hasText: 'Date' }).click()
  }

  async clickSortByDateAscending() {
    await this.clickSortByDate()
    await this.clickSortByDate()
  }

  async submitForm() {
    await this.pduFilter.submitForm()
  }
}

class SearchTravelTimePageAssertions {
  constructor(private readonly page: SearchTravelTimePage) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText('Adjust travel time')
  }

  async toSeeResults() {
    await this.page.results.expect.toHaveItems()
  }
}
