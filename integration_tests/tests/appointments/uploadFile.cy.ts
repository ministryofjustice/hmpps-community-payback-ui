//  Feature: Upload a file to an appointment
//    As a case administrator
//    I want to upload a file to an appointment
//    So that supporting evidence is stored against the appointment
//
//  Scenario: Navigating to the upload file page
//    Given I am on the appointment details page, reached with an original path
//    When I click 'Upload file' in the actions menu
//    Then I see the upload file page
//    And the original path is kept
//
//  Scenario: Navigating back to the appointment details page
//    Given I am on the upload file page
//    When I click back
//    Then I see the appointment details page
//
//  Scenario: Uploading a file
//    Given I am on the upload file page
//    When I choose a file
//    And I submit the form
//    Then I see the appointment details page
//    And I see a success message
//
//  Scenario: Keeping the original path after uploading a file
//    Given I am on the upload file page, reached with an original path
//    When I upload a file
//    Then I see the appointment details page
//    And the original path is kept
//
//  Scenario: Submitting without choosing a file
//    Given I am on the upload file page
//    When I submit the form without choosing a file
//    Then I see a validation error
//
//  Scenario: Choosing a file type that is not allowed
//    Given I am on the upload file page
//    When I choose a file with an extension that is not allowed
//    And I submit the form
//    Then I see a validation error
//
//  Scenario: Choosing a file that is too large
//    Given I am on the upload file page
//    When I choose a file that is larger than 100MB
//    And I submit the form
//    Then I see a validation error
//    And the file is not uploaded
//    When I choose a smaller file
//    And I submit the form
//    Then I see the appointment details page
//
//  Scenario: Handling a 400 error when uploading a file
//    Given I am on the upload file page
//    When I choose a file
//    And I submit the form
//    And the API rejects the file
//    Then I see the error message

import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import UploadFilePage from '../../pages/appointments/uploadFilePage'
import Page from '../../pages/page'
import paths from '../../../server/paths'
import appointmentFactory from '../../../server/testutils/factories/appointmentFactory'
import { contactOutcomesFactory } from '../../../server/testutils/factories/contactOutcomeFactory'
import projectFactory from '../../../server/testutils/factories/projectFactory'
import Utils from '../../utils'

context('Upload file', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.task('stubFindProject', { project })

    cy.task('stubSaveAppointmentForm')
    cy.task('stubGetContactOutcomes', { contactOutcomes: contactOutcomesFactory.build() })

    const appointment = appointmentFactory.build({
      projectCode: project.projectCode,
      providerCode: project.providerCode,
    })
    cy.task('stubFindAppointment', { appointment })
    Utils.stubOffenderFromAppointment(appointment)
    cy.wrap(appointment).as('appointment')
  })

  //  Scenario: Navigating to the upload file page
  it('can be reached from the appointment details page', function test() {
    const originalPath = '/sessions/ABC/2026-10-15'

    //  Given I am on the appointment details page, reached with an original path
    const checkAppointmentDetailsPage = CheckAppointmentDetailsPage.visit(this.appointment, originalPath)

    //  When I click 'Upload file' in the actions menu
    checkAppointmentDetailsPage.clickUploadFile()

    //  Then I see the upload file page
    Page.verifyOnPage(UploadFilePage, this.appointment)

    //  And the original path is kept
    cy.location('search').should('contain', `originalPath=${encodeURIComponent(originalPath)}`)
  })

  //  Scenario: Navigating back to the appointment details page
  it('navigates back to the appointment details page', function test() {
    //  Given I am on the upload file page
    const page = UploadFilePage.visit(this.appointment)

    //  When I click back
    page.clickBack()

    //  Then I see the appointment details page
    Page.verifyOnPage(CheckAppointmentDetailsPage, this.appointment)
  })

  //  Scenario: Uploading a file
  it('uploads a file and returns to the appointment details page', function test() {
    cy.task('stubUploadDocument', { appointment: this.appointment, filename: 'file.txt' })

    //  Given I am on the upload file page
    const page = UploadFilePage.visit(this.appointment)

    //  When I choose a file
    page.chooseFile('file.txt')

    //  And I submit the form
    page.clickSubmit()

    //  Then I see the appointment details page
    const checkAppointmentDetailsPage = Page.verifyOnPage(CheckAppointmentDetailsPage, this.appointment)

    //  And I see a success message
    checkAppointmentDetailsPage.shouldShowSuccessMessage('File uploaded')
  })

  //  Scenario: Keeping the original path after uploading a file
  it('keeps the original path when returning to the appointment details page', function test() {
    const originalPath = '/sessions/ABC/2026-10-15'
    cy.task('stubUploadDocument', { appointment: this.appointment, filename: 'file.txt' })

    //  Given I am on the upload file page, reached with an original path
    const page = UploadFilePage.visit(this.appointment, originalPath)

    //  When I upload a file
    page.chooseFile('file.txt')
    page.clickSubmit()

    //  Then I see the appointment details page
    Page.verifyOnPage(CheckAppointmentDetailsPage, this.appointment)

    //  And the original path is kept
    cy.location('search').should('contain', `originalPath=${encodeURIComponent(originalPath)}`)
  })

  //  Scenario: Submitting without choosing a file
  it('shows a validation error when no file is chosen', function test() {
    //  Given I am on the upload file page
    const page = UploadFilePage.visit(this.appointment)

    //  When I submit the form without choosing a file
    page.clickSubmit()

    //  Then I see a validation error
    page.shouldShowErrorSummary('file', 'Select a file')
  })

  //  Scenario: Choosing a file type that is not allowed
  it('shows a validation error when the file type is not allowed', function test() {
    //  Given I am on the upload file page
    const page = UploadFilePage.visit(this.appointment)

    //  When I choose a file with an extension that is not allowed
    page.chooseFile('file.exe')

    //  And I submit the form
    page.clickSubmit()

    //  Then I see a validation error
    page.shouldShowErrorSummary('file', 'The selected file must be a DOC, DOCX')
  })

  //  Scenario: Choosing a file that is too large
  it('shows a validation error without uploading when the file is too large', function test() {
    cy.task('stubUploadDocument', { appointment: this.appointment, filename: 'smaller-file.txt' })
    const uploadPath = paths.appointments.uploadFile({
      projectCode: this.appointment.projectCode,
      appointmentId: this.appointment.id.toString(),
    })
    cy.intercept('POST', uploadPath, cy.spy().as('uploadRequest'))

    //  Given I am on the upload file page
    const page = UploadFilePage.visit(this.appointment)

    //  When I choose a file that is larger than 100MB
    page.chooseFileOfSize('file.txt', 100 * 1024 * 1024 + 1)

    //  And I submit the form
    // The submit button ignores clicks within a second of the last one, so control the clock to resubmit below
    cy.clock()
    page.clickSubmit()

    //  Then I see a validation error
    const message = 'The selected file must be smaller than 100MB'
    page.shouldShowErrorSummary('file', message)
    page.shouldShowInlineError(message)
    page.shouldHaveErrorPageTitle()

    //  And the file is not uploaded
    cy.get('@uploadRequest').should('not.have.been.called')

    //  When I choose a smaller file
    page.chooseFile('smaller-file.txt')
    cy.tick(1000).then(clock => clock.restore())

    //  And I submit the form
    page.clickSubmit()

    //  Then I see the appointment details page
    const checkAppointmentDetailsPage = Page.verifyOnPage(CheckAppointmentDetailsPage, this.appointment)
    checkAppointmentDetailsPage.shouldShowSuccessMessage('File uploaded')
  })

  //  Scenario: Handling a 400 error when uploading a file
  it('shows the API error message when the upload is rejected', function test() {
    const userMessage = 'Document content type must be a valid media type'
    cy.task('stubUploadDocumentWithError', { appointment: this.appointment, userMessage })

    //  Given I am on the upload file page
    const page = UploadFilePage.visit(this.appointment)

    //  When I choose a file
    page.chooseFile('file.pdf')

    //  And I submit the form
    //  And the API rejects the file
    page.clickSubmit()

    //  Then I see the error message
    Page.verifyOnPage(UploadFilePage, this.appointment)
    page.shouldShowErrorMessage(userMessage)
  })
})
