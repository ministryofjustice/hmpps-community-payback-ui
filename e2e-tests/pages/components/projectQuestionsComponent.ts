import { Locator, Page } from '@playwright/test'
import { Team } from '../../fixtures/testOptions'

export default class ProjectQuestionsComponent {
  private readonly teamFieldLocator: Locator

  private readonly applyTeamButtonLocator: Locator

  private readonly projectFieldLocator: Locator

  constructor(page: Page) {
    this.teamFieldLocator = page.getByLabel('Project team')
    this.applyTeamButtonLocator = page.getByRole('button', { name: 'Select team' })
    this.projectFieldLocator = page.getByLabel('Choose project', { exact: true })
  }

  async selectProject(team: Team, projectName: string) {
    await this.teamFieldLocator.selectOption({ label: team.name })
    await this.applyTeamButtonLocator.click()
    await this.projectFieldLocator.selectOption({ label: projectName })
  }
}
