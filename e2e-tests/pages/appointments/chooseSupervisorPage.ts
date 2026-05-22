import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class ChooseSupervisorPage extends AppointmentFormPage {
  readonly supervisorInputLocator: Locator

  readonly supervisingTeamInputLocator: Locator

  readonly selectTeamLocator: Locator

  constructor(page: Page) {
    super(page, 'Add supervisor details')
    this.supervisingTeamInputLocator = page.getByLabel('Supervising team')
    this.selectTeamLocator = page.getByText('Select team')
    this.supervisorInputLocator = page.getByLabel('Supervising officer')
  }

  chooseSupervisingTeam(team: string) {
    this.supervisingTeamInputLocator.selectOption({ label: team })
  }

  clickSelectTeam() {
    this.selectTeamLocator.click()
  }

  chooseSupervisor(supervisor: string) {
    this.supervisorInputLocator.selectOption({ label: supervisor })
  }
}
