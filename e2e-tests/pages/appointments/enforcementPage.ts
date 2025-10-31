import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class EnforcementPage extends AppointmentFormPage {
  readonly enforcementInputLocator: Locator

  constructor(page: Page) {
    super(page, 'Confirm enforcement')
  }
}
