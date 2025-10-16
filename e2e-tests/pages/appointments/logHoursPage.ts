import { Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class LogHoursPage extends AppointmentFormPage {
  constructor(page: Page) {
    super(page, 'Log start and end time')
  }
}
