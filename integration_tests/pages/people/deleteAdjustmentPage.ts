import { AdjustmentDto, OffenderFullDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import SummaryListComponent from '../components/summaryListComponent'
import Page from '../page'

export default class DeleteAdjustmentPage extends Page {
  readonly adjustmentDetails = new SummaryListComponent('Adjustment details')

  constructor(offender: Offender) {
    super(offender.name)
  }

  static visit(_offender: OffenderFullDto, deliusEventNumber: string, adjustment: AdjustmentDto): DeleteAdjustmentPage {
    const offender = new Offender(_offender)
    const path = paths.people.adjustments.delete({
      crn: offender.crn,
      deliusEventNumber,
      adjustmentId: adjustment.id,
    })

    return this.visitAndCheck(path, offender)
  }

  clickCancel() {
    cy.get('a').contains('Cancel').click()
  }

  override clickSubmit() {
    cy.get('button').contains('Delete').click()
  }

  override shouldShowErrorSummary(message: string) {
    cy.get('[data-testid="error-summary"]').within(() => {
      cy.get('li').contains(message)
    })
  }

  shouldShowAdjustmentDetails(adjustment: AdjustmentDto) {
    this.adjustmentDetails
      .getValueWithLabel('Date')
      .should('contain.text', DateTimeFormats.isoDateToUIDate(adjustment.date))
    this.adjustmentDetails.getValueWithLabel('Reason').should('contain.text', adjustment.reason)
    this.adjustmentDetails.getValueWithLabel('Adjustment time').should('contain.text', adjustment.amount)
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Delete adjustment')
  }
}
