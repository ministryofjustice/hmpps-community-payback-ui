/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'
import BasePage from './basePage'
import DataTableComponent from './components/dataTableComponent'
import { Team } from '../fixtures/testOptions'
import TeamFilterComponent from './components/teamFilterComponent'

export default class GroupSessionPage extends BasePage {
  readonly expect: GroupSessionPageAssertions

  readonly fromDayFieldLocator: Locator

  readonly fromMonthFieldLocator: Locator

  readonly fromYearFieldLocator: Locator

  readonly toDayFieldLocator: Locator

  readonly toMonthFieldLocator: Locator

  readonly toYearFieldLocator: Locator

  readonly results: DataTableComponent

  readonly teamFilter: TeamFilterComponent

  constructor(private readonly page: Page) {
    super(page)
    this.expect = new GroupSessionPageAssertions(this)
    this.teamFilter = new TeamFilterComponent(page)
    this.fromDayFieldLocator = page.getByLabel('day').nth(0)
    this.fromMonthFieldLocator = page.getByLabel('month').nth(0)
    this.fromYearFieldLocator = page.getByLabel('year').nth(0)
    this.toDayFieldLocator = page.getByLabel('day').nth(1)
    this.toMonthFieldLocator = page.getByLabel('month').nth(1)
    this.toYearFieldLocator = page.getByLabel('year').nth(1)
    this.results = new DataTableComponent(page)
  }

  async firstProjectName(): Promise<string> {
    const link = this.results.itemsLocator.getByRole('link').nth(0)
    return link.innerText()
  }

  async clickOnProject(projectName: string) {
    await this.page.getByRole('link', { name: projectName }).first().click()
  }

  async completeSearchForm(fromDate: Date, toDate: Date, team: Team) {
    await this.teamFilter.selectRegion(team)
    await this.teamFilter.selectTeam(team)
    await this.fromDayFieldLocator.fill(fromDate.getDate().toString())
    await this.fromMonthFieldLocator.fill((fromDate.getMonth() + 1).toString().padStart(2, '0'))
    await this.fromYearFieldLocator.fill(fromDate.getFullYear().toString())
    await this.toDayFieldLocator.fill(toDate.getDate().toString().padStart(2, '0'))
    await this.toMonthFieldLocator.fill((toDate.getMonth() + 1).toString().padStart(2, '0'))
    await this.toYearFieldLocator.fill(toDate.getFullYear().toString())
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
