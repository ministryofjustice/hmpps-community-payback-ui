import { Page, Locator } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class ChooseAppointmentTypePage extends AppointmentFormPage {
  readonly optionsLocator: Locator

  constructor(page: Page) {
    const question = 'Select type of appointment'
    super(page, question)
    this.optionsLocator = page.getByRole('group', { name: question })
  }

  async chooseInduction() {
    await this.optionsLocator.getByRole('radio', { name: 'Induction' }).check()
  }
}
