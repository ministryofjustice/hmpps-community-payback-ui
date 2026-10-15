//  Feature: Upload a file to an appointment
//    As a case administrator
//    I want to upload a file to an appointment
//    So that supporting evidence is stored against the appointment
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
//  Scenario: Handling a 400 error when uploading a file
//    Given I am on the upload file page
//    When I choose a file
//    And I submit the form
//    And the API rejects the file
//    Then I see the error message

import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import UploadFilePage from '../../pages/appointments/uploadFilePage'
import Page from '../../pages/page'
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
