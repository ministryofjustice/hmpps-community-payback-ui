//  Feature: Complete appointment details
//    As a case admin
//    I want to record an outcome for a person
//    So that I can process the completion for the right person

//  Scenario: Submitting the form
//    Given I am on the form page
//    When I complete the form
//    Then I should see the next page of the form

//  Scenario: Validating the form
//    Given I am on the form page
//    When I submit an invalid form
//    Then I should see the page with errors

//  Scenario: Navigating back
//    Given I am on the form page
//    When I click back
//    Then I should see the previous page

//  Scenario: Navigating to unable to credit time page
//    Given I am on the form page
//    When I click the unable to credit time link
//    Then I should see the unable to credit time page

import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import pagedModelAppointmentSummaryFactory from '../../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import pagedModelProjectOutcomeSummaryFactory from '../../../../server/testutils/factories/pagedModelProjectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import unpaidWorkDetailsFactory from '../../../../server/testutils/factories/unpaidWorkDetailsFactory'
import DateTimeFormats from '../../../../server/utils/dateTimeUtils'
import AppointmentPage from '../../../pages/courseCompletions/process/appointmentPage'
import ConfirmDetailsPage from '../../../pages/courseCompletions/process/confirmDetailsPage'
import OutcomePage from '../../../pages/courseCompletions/process/outcomePage'
import UnableToCreditTimePage from '../../../pages/courseCompletions/process/unableToCreditTimePage'
import Page from '../../../pages/page'

context('Outcome Page', () => {
  const courseCompletion = courseCompletionFactory.build()
  const upwDetails = unpaidWorkDetailsFactory.build()
  const caseDetailsSummary = caseDetailsSummaryFactory.build({
    offender: offenderFullFactory.build(),
    unpaidWorkDetails: [upwDetails],
  })
  const emptyFields = {
    timeToCredit: undefined,
    'date-day': undefined,
    'date-month': undefined,
    'date-year': undefined,
    notes: undefined,
    isSensitive: undefined,
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task(
      'stubGetCourseCompletionForm',
      courseCompletionFormFactory.build({
        ...emptyFields,
        deliusEventNumber: upwDetails.eventNumber,
        crn: caseDetailsSummary.offender.crn,
      }),
    )
    cy.task('stubSaveCourseCompletionForm')
    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })
  })

  // Scenario: Submitting the form
  it('continues to the next page on submit', () => {
    const teams = providerTeamSummaryFactory.buildList(2)
    const [team] = teams
    const projects = pagedModelProjectOutcomeSummaryFactory.build()
    const [project] = projects.content
    const { providerCode } = courseCompletion.pdu
    const request = {
      outcomeCodes: ['NO_OUTCOME'],
      projectTypeGroup: 'ETE',
      projectCodes: [project.projectCode],
      crn: caseDetailsSummary.offender.crn,
      fromDate: DateTimeFormats.dateObjToIsoString(new Date()),
    }

    cy.task(
      'stubGetCourseCompletionForm',
      courseCompletionFormFactory.build({
        ...emptyFields,
        deliusEventNumber: upwDetails.eventNumber,
        crn: caseDetailsSummary.offender.crn,
        project: project.projectCode,
        team: team.code,
      }),
    )
    cy.task('stubGetProjects', { teamCode: team.code, providerCode, projects })
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode })
    cy.task('stubGetAppointments', { request, pagedAppointments: pagedModelAppointmentSummaryFactory.build() })

    //  Given I am on the form page
    const page = OutcomePage.visit(courseCompletion)
    page.courseDetails.shouldShowCourseDetails()
    page.shouldShowRequirementDetails(upwDetails)

    //  When I complete the form
    page.timeInput.enterTime()
    page.enterAppointmentDate('15', '03', '2026')
    page.notesQuestions.completeForm()
    page.clickSubmit()

    // Then I should see the next page of the form
    Page.verifyOnPage(ConfirmDetailsPage, courseCompletion)
  })

  // Scenario: Validating the form
  it('validates the form', () => {
    const notes = 'Test note'

    //  Given I am on the form page
    const page = OutcomePage.visit(courseCompletion)

    //  When I submit an invalid form
    // And I enter notes
    page.notesQuestions.notesField().type(notes)
    page.notesQuestions.selectIsSensitive()
    page.clickSubmit()

    // Then I should see the page with errors
    Page.verifyOnPage(OutcomePage, courseCompletion)
    page.shouldShowErrors()
    page.notesQuestions.shouldShowNotes(notes)
    page.notesQuestions.shouldShowIsSensitiveValue()
  })

  // Scenario: Navigating back
  it('navigates back', () => {
    const teams = providerTeamSummaryFactory.buildList(2)
    const [team] = teams
    const projects = pagedModelProjectOutcomeSummaryFactory.build()
    const [project] = projects.content
    const request = {
      outcomeCodes: ['NO_OUTCOME'],
      projectTypeGroup: 'ETE',
      projectCodes: [project.projectCode],
      crn: caseDetailsSummary.offender.crn,
      fromDate: DateTimeFormats.dateObjToIsoString(new Date()),
    }

    cy.task(
      'stubGetCourseCompletionForm',
      courseCompletionFormFactory.build({
        ...emptyFields,
        deliusEventNumber: upwDetails.eventNumber,
        crn: caseDetailsSummary.offender.crn,
        project: project.projectCode,
        team: team.code,
      }),
    )
    cy.task('stubGetAppointments', { request, pagedAppointments: pagedModelAppointmentSummaryFactory.build() })
    //  Given I am on the form page
    const page = OutcomePage.visit(courseCompletion)

    //  When I click back
    page.clickBack()

    // Then I should see the previous page
    Page.verifyOnPage(AppointmentPage)
  })

  // Scenario: Navigating to unable to credit time page
  it('navigates to unable to credit time page', () => {
    const pagedAppointments = pagedModelAppointmentSummaryFactory.build()

    cy.task('stubGetAppointments', {
      request: {},
      pagedAppointments,
    })

    // Given I am on the form page
    const page = OutcomePage.visit(courseCompletion)

    // When I click the unable to credit time link
    page.clickUnableToCreditTimeLink()

    // Then I should see the unable to credit time page
    Page.verifyOnPage(UnableToCreditTimePage, courseCompletion)
  })
})
