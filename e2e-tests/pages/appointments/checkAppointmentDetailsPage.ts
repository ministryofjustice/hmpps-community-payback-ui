import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class CheckAppointmentDetailsPage extends AppointmentFormPage {
  readonly supervisorInputLocator: Locator

  readonly updateButtonLocator: Locator

  constructor(page: Page) {
    super(page, 'Appointment details')
    this.supervisorInputLocator = page.getByLabel('Choose supervisor')
    this.updateButtonLocator = page.getByRole('button', { name: 'Update appointment' })
  }

  chooseSupervisor(supervisor: string) {
    this.supervisorInputLocator.selectOption({ label: supervisor })
  }

  override async continue() {
    await this.updateButtonLocator.click()
  }
}
