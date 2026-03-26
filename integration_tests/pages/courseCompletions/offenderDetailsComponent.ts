import { OffenderFullDto } from '../../../server/@types/shared'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import SummaryListComponent from '../components/summaryListComponent'

export default class OffenderDetailsComponent {
  private readonly details = new SummaryListComponent('nDelius record')

  constructor(private readonly offender: OffenderFullDto) {}

  shouldShowOffenderDetails() {
    this.details.getValueWithLabel('First name').should('contain.text', this.offender.forename)
    this.details.getValueWithLabel('Last name').should('contain.text', this.offender.surname)
    this.details.getValueWithLabel('CRN').should('contain.text', this.offender.crn)
    this.details
      .getValueWithLabel('Date of birth')
      .should('contain.text', DateTimeFormats.isoDateToUIDate(this.offender.dateOfBirth, { format: 'medium' }))
  }
}
