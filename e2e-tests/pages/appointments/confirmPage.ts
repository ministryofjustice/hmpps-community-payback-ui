/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'
import AppointmentFormPage, { AppointmentFormPageAssertions } from './appointmentFormPage'
import SummaryListComponent from '../components/summaryListComponent'
import { AttendanceOutcome } from '../../contactOutcomes'
import { ProjectAvailability } from '../../delius/project'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'

export default class ConfirmPage extends AppointmentFormPage {
  override expect: ConfirmPageAssertions = new ConfirmPageAssertions(this)

  readonly alertPractitionerMessageLocator: Locator

  readonly details: SummaryListComponent

  readonly confirmButtonLocator: Locator

  private readonly alertPractitionerQuestionLocator: Locator

  constructor(page: Page) {
    super(page, 'Confirm details')
    this.details = new SummaryListComponent(page)
    this.confirmButtonLocator = page.getByRole('button', { name: 'Confirm' })
    this.alertPractitionerQuestionLocator = page.getByRole('group', {
      name: 'Would you like to share this outcome with the probation practitioner?',
    })
    this.alertPractitionerMessageLocator = page.getByText(
      'This outcome will be shared with the practitioner as it requires enforcement action',
    )
  }

  async selectAlertPractitioner() {
    await this.alertPractitionerQuestionLocator.getByLabel('Yes').check()
  }
}

class ConfirmPageAssertions extends AppointmentFormPageAssertions {
  async toShowMessageThatOutcomeWillAlert() {
    await expect(this.confirmPage.alertPractitionerMessageLocator).toBeVisible()
  }

  confirmPage: ConfirmPage

  constructor(page: ConfirmPage) {
    super(page)
    this.confirmPage = page
  }

  async toShowAnswers(supervisor: string, availability: ProjectAvailability) {
    const startTime = DateTimeFormats.stripTime(availability.startTime)
    const endTime = DateTimeFormats.stripTime(availability.endTime)
    await this.confirmPage.details.expect.toHaveItemWith('Supervising officer', supervisor)
    await this.confirmPage.details.expect.toHaveItemWith('Start and end time', `${startTime} - ${endTime}`)
  }

  async toShowPenaltyHoursAnswerWithHoursApplied() {
    await this.confirmPage.details.expect.toHaveItemWith('Penalty hours', '1 hour')
  }

  async toShowPenaltyHoursAnswerWithNoHoursApplied() {
    await this.confirmPage.details.expect.toHaveItemWith('Penalty hours', 'No penalty time applied')
  }

  async toShowAttendanceAnswer(answer: AttendanceOutcome) {
    await this.confirmPage.details.expect.toHaveItemWith('Attendance', answer)
  }

  async toShowComplianceAnswer() {
    await this.confirmPage.details.expect.toHaveItemWith(
      'Compliance',
      'High-vis - YesWorked intensively - YesWork quality - GoodBehaviour - Poor',
    )

    await this.confirmPage.details.expect.toHaveItemWith('Notes', 'There were some issues')
  }
}
