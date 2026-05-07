/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Page, expect } from '@playwright/test'
import BasePage from '../basePage'
import DataTableComponent from '../components/dataTableComponent'
import PduFilterComponent from '../components/pduFilterComponent'
import { Team } from '../../fixtures/testOptions'

export default class SearchTravelTimePage extends BasePage {
  readonly expect: SearchTravelTimePageAssertions

  readonly results: DataTableComponent

  readonly pduFilter: PduFilterComponent

  constructor(page: Page) {
    super(page)
    this.pduFilter = new PduFilterComponent(page)
    this.expect = new SearchTravelTimePageAssertions(this)
    this.results = new DataTableComponent(page)
  }

  async clickUpdateAnAppointment(crn: string) {
    await this.results.itemsLocator.filter({ hasText: crn }).getByRole('link', { name: 'Update' }).click()
  }

  async completeSearchForm(team: Team) {
    await this.pduFilter.selectRegion(team.provider)
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
