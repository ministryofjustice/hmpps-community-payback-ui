import { Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'
import DatePickerComponent from '../components/datePickerComponent'

export default class DatePage extends AppointmentFormPage {
  datePickerComponent: DatePickerComponent

  constructor(page: Page) {
    super(page, 'Add date')
    this.datePickerComponent = new DatePickerComponent(page)
  }
}
