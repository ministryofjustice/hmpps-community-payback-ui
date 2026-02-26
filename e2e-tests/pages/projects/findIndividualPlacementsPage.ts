/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Page } from '@playwright/test'
import BasePage from '../basePage'
import DataTableComponent from '../components/dataTableComponent'
import TeamFilterComponent from '../components/teamFilterComponent'

export default class FindIndividualPlacementsPage extends BasePage {
  readonly expect: FindIndividualPlacementsPageAssertions

  readonly individualPlacements: DataTableComponent

  readonly teamFilter: TeamFilterComponent

  constructor(private readonly page: Page) {
    super(page)
    this.expect = new FindIndividualPlacementsPageAssertions(this, 'Find an individual placement')
    this.individualPlacements = new DataTableComponent(page)
    this.teamFilter = new TeamFilterComponent(page)
  }

  async clickOnProject(projectName: string) {
    await this.page.getByRole('link', { name: projectName }).first().click()
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
