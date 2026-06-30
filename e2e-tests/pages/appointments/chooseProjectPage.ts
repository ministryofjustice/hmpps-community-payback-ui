import { Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'
import ProjectQuestionsComponent from '../components/projectQuestionsComponent'

export default class ChooseProjectPage extends AppointmentFormPage {
  readonly form: ProjectQuestionsComponent

  constructor(page: Page) {
    super(page, 'Add project details')
    this.form = new ProjectQuestionsComponent(page)
  }
}
