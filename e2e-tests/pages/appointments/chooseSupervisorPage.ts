import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class ChooseSupervisorPage extends AppointmentFormPage {
  readonly supervisorInputLocator: Locator

  constructor(page: Page) {
    super(page, 'Add supervisor details')
    this.supervisorInputLocator = page.getByLabel('Supervising officer')
  }

  chooseSupervisor(supervisor: string) {
    this.supervisorInputLocator.selectOption({ label: supervisor })
  }
}
