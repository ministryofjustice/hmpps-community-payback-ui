import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class CheckProjectDetailsPage extends AppointmentFormPage {
  readonly supervisorInputLocator: Locator

  constructor(page: Page) {
    super(page, 'Check project details')
    this.supervisorInputLocator = page.getByLabel('Choose supervisor')
  }

  chooseSupervisor(supervisor: string) {
    this.supervisorInputLocator.selectOption({ label: supervisor })
  }
}
