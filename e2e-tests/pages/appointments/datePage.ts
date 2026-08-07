import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class DatePage extends AppointmentFormPage {
  dateFieldLocator: Locator

  constructor(page: Page) {
    super(page, 'Add date')
    this.dateFieldLocator = page.getByLabel('Add date')
  }
}
