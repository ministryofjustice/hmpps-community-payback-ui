/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page } from '@playwright/test'
import AppointmentFormPage, { AppointmentFormPageAssertions } from './appointmentFormPage'
import SummaryListComponent from '../components/summaryListComponent'

export default class ConfirmPage extends AppointmentFormPage {
  override expect: ConfirmPageAssertions = new ConfirmPageAssertions(this)

  readonly details: SummaryListComponent

  readonly confirmButtonLocator: Locator

  constructor(page: Page) {
    super(page, 'Confirm details')
    this.details = new SummaryListComponent(page)
    this.confirmButtonLocator = page.getByRole('button', { name: 'Confirm' })
  }
}

class ConfirmPageAssertions extends AppointmentFormPageAssertions {
  confirmPage: ConfirmPage

  constructor(page: ConfirmPage) {
    super(page)
    this.confirmPage = page
  }

  async toShowAnswers(supervisor: string) {
    await this.confirmPage.details.expect.toHaveItemWith('Supervising officer', supervisor)
    await this.confirmPage.details.expect.toHaveItemWith(
      'Start and end time',
      '09:00 - 17:00Total hours worked: 8 hours',
    )
  }

  async toShowPenaltyHoursAnswerWithHoursApplied() {
    await this.confirmPage.details.expect.toHaveItemWith('Penalty hours', '1 hourTotal hours credited: 7 hours')
  }

  async toShowPenaltyHoursAnswerWithNoHoursApplied() {
    await this.confirmPage.details.expect.toHaveItemWith(
      'Penalty hours',
      'No penalty time appliedTotal hours credited: 8 hours',
    )
  }

  async toShowAttendanceAnswer(answer: string) {
    await this.confirmPage.details.expect.toHaveItemWith('Attendance', answer)
  }

  async toShowComplianceAnswer() {
    await this.confirmPage.details.expect.toHaveItemWith(
      'Compliance',
      'High-vis - YesWorked intensively - YesWork quality - GoodBehaviour - Poor',
    )
  }
}
