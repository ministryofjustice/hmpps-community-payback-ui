import { Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class EnforcementPage extends AppointmentFormPage {
  constructor(page: Page) {
    super(page, 'Log enforcement')
  }
}
