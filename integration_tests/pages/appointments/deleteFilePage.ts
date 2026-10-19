import { AppointmentDocumentDto, AppointmentDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import SummaryListComponent from '../components/summaryListComponent'
import Page from '../page'

export default class DeleteFilePage extends Page {
  readonly fileDetails = new SummaryListComponent('File details')

  constructor(appointment: AppointmentDto) {
    super(new Offender(appointment.offender).name)
  }

  clickCancel() {
    cy.get('a').contains('Cancel').click()
  }

  override clickSubmit() {
    cy.get('button').contains('Delete').click()
  }

  shouldShowFileDetails(document: AppointmentDocumentDto) {
    this.fileDetails.getValueWithLabel('File').should('contain.text', document.filename)
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Delete file')
  }
}
