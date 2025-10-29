/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Page } from '@playwright/test'
import AppointmentFormPage, { AppointmentFormPageAssertions } from './appointmentFormPage'
import SummaryListComponent from '../components/summaryListComponent'

export default class ConfirmPage extends AppointmentFormPage {
  override expect: ConfirmPageAssertions = new ConfirmPageAssertions(this)

  readonly details: SummaryListComponent

  constructor(page: Page) {
    super(page, 'Confirm details')
    this.details = new SummaryListComponent(page)
  }
}

class ConfirmPageAssertions extends AppointmentFormPageAssertions {
  confirmPage: ConfirmPage

  constructor(page: ConfirmPage) {
    super(page)
    this.confirmPage = page
  }

  async toShowSelectedEnforcementAction(action: string) {
    await this.confirmPage.details.expect.toHaveItemWith('enforcement', action)
  }
}
