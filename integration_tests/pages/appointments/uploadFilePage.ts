import { AppointmentDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import { pathWithOriginalPath } from '../../../server/utils/utils'
import Page from '../page'

export default class UploadFilePage extends Page {
  constructor(appointment: Pick<AppointmentDto, 'offender'>) {
    super(new Offender(appointment.offender).name)
  }

  static visit(appointment: AppointmentDto, originalPath?: string): UploadFilePage {
    const path = pathWithOriginalPath(
      paths.appointments.uploadFile({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
      }),
      originalPath,
    )

    return this.visitAndCheck(path, appointment)
  }

  chooseFile(fileName: string, contents = 'some file contents') {
    cy.get('input[type="file"]').selectFile({ contents: Cypress.Buffer.from(contents), fileName }, { force: true })
  }

  override clickSubmit() {
    cy.get('button').contains('Submit').click()
  }

  shouldShowErrorMessage(message: string) {
    cy.get('[data-testid="error-summary"]').within(() => {
      cy.get('li').contains(message)
    })
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Upload file')
    cy.get('label[for="file"]').should('have.text', 'Upload file')
    // The file upload JavaScript only initialises when the input has a label
    cy.get('.govuk-file-upload-button').should('exist')
  }
}
