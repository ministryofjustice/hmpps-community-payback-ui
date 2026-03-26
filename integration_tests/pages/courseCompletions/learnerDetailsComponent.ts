import { EteCourseCompletionEventDto } from '../../../server/@types/shared'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import SummaryListComponent from '../components/summaryListComponent'

export default class LearnerDetailsComponent {
  private readonly details = new SummaryListComponent('Community Campus record')

  constructor(private readonly courseCompletion: EteCourseCompletionEventDto) {}

  shouldShowLearnerDetails() {
    this.details.getValueWithLabel('First name').should('contain.text', this.courseCompletion.firstName)
    this.details.getValueWithLabel('Last name').should('contain.text', this.courseCompletion.lastName)
    this.details
      .getValueWithLabel('Date of birth')
      .should('contain.text', DateTimeFormats.isoDateToUIDate(this.courseCompletion.dateOfBirth, { format: 'medium' }))
    this.details.getValueWithLabel('Email').should('contain.text', this.courseCompletion.email)
    this.details.getValueWithLabel('Region').should('contain.text', this.courseCompletion.region)
    this.details.getValueWithLabel('PDU').should('contain.text', this.courseCompletion.pdu.name)
    this.details.getValueWithLabel('Office').should('contain.text', this.courseCompletion.office)
  }
}
