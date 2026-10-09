import { OffenderFullDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import SummaryListComponent from '../components/summaryListComponent'
import Page from '../page'

export default class AdjustHoursConfirmPage extends Page {
  readonly adjustmentDetailsSummary = new SummaryListComponent()

  constructor(offender: Offender) {
    super(offender.name)
  }

  static visit(_offender: OffenderFullDto, deliusEventNumber: string): AdjustHoursConfirmPage {
    const offender = new Offender(_offender)
    const path = `${paths.people.adjustHours.confirm({ crn: offender.crn, deliusEventNumber })}?form=123`
    return this.visitAndCheck(path, offender)
  }

  checkSummary(date: string, reason: string, time: string): void {
    this.adjustmentDetailsSummary
      .getValueWithLabel('Date')
      .should('contain.text', DateTimeFormats.isoDateToUIDate(date))
    this.adjustmentDetailsSummary.getValueWithLabel('Reason').should('contain.text', reason)
    this.adjustmentDetailsSummary.getValueWithLabel('Time taken off').should('contain.text', time)
  }

  clickChangeLink(): void {
    this.adjustmentDetailsSummary.clickActionWithLabel('Date')
  }

  checkRemainingHoursCalculation(minutesRemaining: number): void {
    const text = `The total amount of time remaining will be ${DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(minutesRemaining)}`
    cy.get('.adjust-hours-confirm-calculated-time').should('contain.text', text)
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Confirm adjustment details')
  }
}
