import { Locator, Page, expect } from '@playwright/test'
import { Team } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/test-data/test-data'
import BasePage from './basePage'
import DataTableComponent from './components/dataTableComponent'
import { AttendanceOutcome } from '../contactOutcomes'

export default class DeliusPage extends BasePage {
  private readonly upwProjectDiaryLinkLocator: Locator

  private readonly providerInputLocator: Locator

  private readonly teamInputLocator: Locator

  private readonly searchButtonLocator: Locator

  private readonly results: DataTableComponent

  constructor(private readonly page: Page) {
    super(page)
    this.upwProjectDiaryLinkLocator = page.getByRole('link', { name: 'UPW Project Diary' })
    this.providerInputLocator = page.getByLabel('provider')
    this.teamInputLocator = page.getByLabel('team')
    this.searchButtonLocator = page.getByRole('button', { name: 'Search' })
    this.results = new DataTableComponent(page)
  }

  async visitUpwProjectDiary() {
    await this.upwProjectDiaryLinkLocator.click()
  }

  async searchForSession(team: Team) {
    await this.providerInputLocator.selectOption({ label: team.provider })
    await this.teamInputLocator.selectOption({ label: team.name })
    await this.searchButtonLocator.click()
  }

  async selectProject(projectName: string) {
    await expect(this.page.getByRole('heading', { name: 'PROJECT LIST' })).toBeVisible()
    // TODO: only click this if project not on first page (as test will fail if only one page)
    await this.page.getByRole('link', { name: 'Last' }).click()
    const row = await this.results.getRowByContent(projectName)
    await row.getByRole('link', { name: 'manage' }).click()
  }

  async verifyAttendanceOutcome(crn: string, attendanceOutcome: AttendanceOutcome, creditedHours: string) {
    await expect(this.page.getByRole('heading', { name: 'ALLOCATED TO ATTEND' })).toBeVisible()
    const personRow = await this.results.getRowByContent(crn)
    await expect(personRow).toContainText(attendanceOutcome)
    await expect(personRow.locator('td').nth(7)).toContainText(creditedHours)
  }
}
