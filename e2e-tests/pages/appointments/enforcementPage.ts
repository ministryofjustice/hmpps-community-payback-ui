import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class EnforcementPage extends AppointmentFormPage {
  readonly enforcementInputLocator: Locator

  constructor(page: Page) {
    super(page, 'Confirm enforcement')
    this.enforcementInputLocator = page.getByLabel('Choose enforcement')
  }

  async chooseAction(): Promise<string> {
    const firstOption = await this.firstOptionName()
    await this.enforcementInputLocator.selectOption({ label: firstOption })
    return firstOption
  }

  async firstOptionName(): Promise<string> {
    const option = this.enforcementInputLocator.getByRole('option').nth(1)
    return option.innerText()
  }
}
