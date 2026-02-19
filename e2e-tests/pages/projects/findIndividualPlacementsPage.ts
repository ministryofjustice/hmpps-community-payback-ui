/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Locator, Page } from '@playwright/test'
import BasePage from '../basePage'
import DataTableComponent from '../components/dataTableComponent'
import { Team } from '../../fixtures/testOptions'

export default class FindIndividualPlacementsPage extends BasePage {
  readonly expect: FindIndividualPlacementsPageAssertions

  readonly individualPlacements: DataTableComponent

  readonly teamSelectLocator: Locator

  readonly filterButtonLocator: Locator

  constructor(private readonly page: Page) {
    super(page)
    this.expect = new FindIndividualPlacementsPageAssertions(this, 'Find an individual placement')
    this.individualPlacements = new DataTableComponent(page)
    this.teamSelectLocator = page.getByRole('combobox', { name: /Project team/i })
    this.filterButtonLocator = page.getByRole('button', { name: 'Filter' })
  }

  async selectTeam(team: Team) {
    await this.teamSelectLocator.selectOption({ label: team.name })
  }

  async clickOnProject(projectName: string) {
    await this.page.getByRole('link', { name: projectName }).first().click()
  }

  async submitForm() {
    await this.filterButtonLocator.click()
  }
}

class FindIndividualPlacementsPageAssertions {
  constructor(
    private readonly page: FindIndividualPlacementsPage,
    private readonly expectedTitle: string,
  ) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText(this.expectedTitle)
  }

  async toSeeResults() {
    await this.page.individualPlacements.expect.toHaveItems()
  }
}
