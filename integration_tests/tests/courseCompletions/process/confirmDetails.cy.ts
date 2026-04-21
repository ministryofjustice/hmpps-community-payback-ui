//  Feature: Check submitted course completion details
//    As a case admin
//    I want to check the details I have entered
//    So that I can process a course completion correctly

//  Scenario: Confirming a course completion update
//    Given I am on the confirm page of an in progress update
//    Then I can see my submitted answers
//    And I can answer yes or no to question asking if I want to alert the probation practitioner

//  Scenario: Navigating back
//    Given I am on the confirm page of an in progress update
//    And I click back
//    Then I can see the outcome page

//  Scenario: Changing submitted answers
//    Scenario: Changing the CRN
//      Given I am on the confirm page of an in progress update
//      And I click change CRN
//      Then I can see the CRN page
//    Scenario: Changing the Project team
//      Given I am on the confirm page of an in progress update
//      And I click change team
//      Then I can see the project page
//    Scenario: Changing the Project
//      Given I am on the confirm page of an in progress update
//      And I click change project
//      Then I can see the project page
//    Scenario: Changing the requirement
//      Given I am on the confirm page of an in progress update
//      And I click change requirement
//      Then I can see the Requirement page
//    Scenario: Changing the credited time
//      Given I am on the confirm page of an in progress update
//      And I click change credited time
//      Then I can see the outcome page
//    Scenario: Changing the appointment date
//      Given I am on the confirm page of an in progress update
//      And I click change appointment date
//      Then I can see the outcome page
//    Scenario: Changing the notes
//      Given I am on the confirm page of an in progress update
//      And I click change notes
//      Then I can see the outcome page
//    Scenario: Changing the sensitivity
//      Given I am on the confirm page of an in progress update
//      And I click change sensitivity
//      Then I can see the outcome page

//  Scenario: Submitting a course completion
//    Scenario: Shows a success message
//      Given I am on the confirm page of an in progress update
//      When I select yes to sending an alert
//      And I submit
//      Then I can see the course completion search page with success message
//    Scenario: Should show any API validation errors
//      Given I am on the confirm page of an in progress update
//      When I submit
//      And the API returns a 400 error
//      Then I can see the error message

import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import pagedModelProjectOutcomeSummaryFactory from '../../../../server/testutils/factories/pagedModelProjectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import unpaidWorkDetailsFactory from '../../../../server/testutils/factories/unpaidWorkDetailsFactory'
import ConfirmDetailsPage from '../../../pages/courseCompletions/process/confirmDetailsPage'
import CrnPage from '../../../pages/courseCompletions/process/crnPage'
import OutcomePage from '../../../pages/courseCompletions/process/outcomePage'
import ProjectPage from '../../../pages/courseCompletions/process/projectPage'
import RequirementPage from '../../../pages/courseCompletions/process/requirementPage'
import Page from '../../../pages/page'
import SearchCourseCompletionsPage from '../../../pages/courseCompletions/searchCourseCompletionsPage'
import { communityCampusPdusFactory } from '../../../../server/testutils/factories/communityCampusPduFactory'
import providerSummaryFactory from '../../../../server/testutils/factories/providerSummaryFactory'
import pagedModelAppointmentSummaryFactory from '../../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import DateTimeFormats from '../../../../server/utils/dateTimeUtils'
import AppointmentPage from '../../../pages/courseCompletions/process/appointmentPage'
import appointmentSummaryFactory from '../../../../server/testutils/factories/appointmentSummaryFactory'

context('Confirm details page', () => {
  const courseCompletion = courseCompletionFactory.build()
  const teams = providerTeamSummaryFactory.buildList(2)
  const [team] = teams
  const projects = pagedModelProjectOutcomeSummaryFactory.build()
  const [project] = projects.content
  const { providerCode } = courseCompletion.pdu
  const upwDetails = unpaidWorkDetailsFactory.build()
  const form = courseCompletionFormFactory.build({
    team: team.code,
    project: project.projectCode,
    deliusEventNumber: upwDetails.eventNumber,
  })
  const offender = offenderFullFactory.build({ crn: form.crn })
  const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender, unpaidWorkDetails: [upwDetails] })
  const pagedAppointments = pagedModelAppointmentSummaryFactory.build()
  const request = {
    outcomeCodes: ['NO_OUTCOME'],
    projectTypeGroup: 'ETE',
    projectCodes: [project.projectCode],
    crn: offender.crn,
    fromDate: DateTimeFormats.dateObjToIsoString(new Date()),
  }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode })
    cy.task('stubGetProjects', { teamCode: team.code, providerCode, projects })
    cy.task('stubGetCourseCompletionForm', form)
    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })
    cy.task('stubGetAppointments', { request, pagedAppointments })
  })

  // Scenario: Confirming a course completion update
  it('shows all completed answers for the current form', () => {
    // Given I am on the confirm page of an in progress update
    const page = ConfirmDetailsPage.visit(courseCompletion, form)

    // Then I can see my submitted answers
    page.shouldShowCompletedDetails(team, project, upwDetails)

    //  And I can answer yes or no to question asking if I want to alert the probation practitioner
    page.alertPractitionerQuestion.checkOptionWithValue('yes')
    page.alertPractitionerQuestion.checkOptionWithValue('no')
  })

  describe('showing appointment type', () => {
    it('shows value for existing appointment', () => {
      // Given I am on the confirm page of an in progress update
      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // Then I can see my submitted answers
      page.shouldShowAppointmentType('existing')
    })

    it('shows value for new appointment', () => {
      cy.task('stubGetCourseCompletionForm', { ...form, appointmentIdToUpdate: undefined })

      // Given I am on the confirm page of an in progress update
      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // Then I can see my submitted answers
      page.shouldShowAppointmentType('new')
    })
  })

  // Scenario: Navigating back
  describe('navigating back', () => {
    it('navigates back to the outcome page', () => {
      // Given I am on the confirm page of an in progress update
      const page = ConfirmDetailsPage.visit(courseCompletion, form)
      cy.task(
        'stubGetCourseCompletionForm',
        courseCompletionFormFactory.build({
          deliusEventNumber: upwDetails.eventNumber,
          crn: caseDetailsSummary.offender.crn,
        }),
      )

      // And I click back
      page.clickBack()

      // Then I can see the outcome page
      Page.verifyOnPage(OutcomePage, courseCompletion)
    })
  })

  // Scenario: Changing submitted answers
  describe('Changing answers', () => {
    // Scenario: Changing the CRN
    it('navigates back to the CRN page', () => {
      // Given I am on the confirm page of an in progress update
      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // And I click change CRN
      page.clickChange('CRN')

      // Then I can see the CRN page
      const crnPage = Page.verifyOnPage(CrnPage)
      crnPage.shouldHaveCrnValue(form.crn)
    })

    // Scenario: Changing the Project team
    it('navigates back to the project page via team', () => {
      // Given I am on the confirm page of an in progress update
      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // And I click change team
      page.clickChange('Project team')

      // Then I can see the project page
      const projectPage = Page.verifyOnPage(ProjectPage)
      projectPage.teamInput.shouldHaveValue(team.code)
    })

    // Scenario: Changing the Project
    it('navigates back to the project page via project', () => {
      // Given I am on the confirm page of an in progress update
      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // And I click change project
      page.clickChange('Project')

      // Then I can see the project page
      const projectPage = Page.verifyOnPage(ProjectPage)
      projectPage.projectInput.shouldHaveValue(project.projectCode)
    })

    // Scenario: Changing the requirement
    it('navigates back to the requirement page', () => {
      // Given I am on the confirm page of an in progress update
      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // And I click change requirement
      page.clickChange('Requirement')

      // Then I can see the Requirement page
      const requirementPage = Page.verifyOnPage(RequirementPage)
      requirementPage.shouldShowCheckedRequirement(upwDetails.eventNumber)
    })

    // Scenario: Changing the credited time
    it('navigates back to the outcome page via credited time', () => {
      // Given I am on the confirm page of an in progress update
      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // And I click change credited time
      page.clickChange('Credited time')

      // Then I can see the outcome page
      const outcomePage = Page.verifyOnPage(OutcomePage)
      outcomePage.timeInput.shouldHaveValue(form.timeToCredit.hours, form.timeToCredit.minutes)
    })

    // Scenario: Changing the appointment date
    it('navigates back to the outcome page via appointment date', () => {
      // Given I am on the confirm page of an in progress update
      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // And I click change appointment date
      page.clickChange('Appointment date')

      // Then I can see the outcome page
      const outcomePage = Page.verifyOnPage(OutcomePage)
      outcomePage.dateInput.shouldHaveValue({
        day: form['date-day'],
        month: form['date-month'],
        year: form['date-year'],
      })
    })

    // Scenario: Changing the notes
    it('navigates back to the outcome page via notes', () => {
      // Given I am on the confirm page of an in progress update
      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // And I click change notes
      page.clickChange('Notes')

      // Then I can see the outcome page
      const outcomePage = Page.verifyOnPage(OutcomePage)
      outcomePage.notesQuestions.shouldShowNotes(form.notes)
    })

    // Scenario: Changing the sensitivity
    it('navigates back to the outcome page via sensitivity', () => {
      // Given I am on the confirm page of an in progress update
      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // And I click change sensitivity
      page.clickChange('Sensitive')

      // Then I can see the outcome page
      const outcomePage = Page.verifyOnPage(OutcomePage)
      outcomePage.notesQuestions.shouldShowIsSensitiveValue(form.isSensitive)
    })

    // Scenario: Changing the appointment
    describe('appointment type', () => {
      describe('when appointment can be changed', () => {
        it('navigates back to the appointment page', () => {
          const appointmentSummary = appointmentSummaryFactory.build({ id: form.appointmentIdToUpdate })

          cy.task('stubGetAppointments', {
            request,
            pagedAppointments: pagedModelAppointmentSummaryFactory.build({ content: [appointmentSummary] }),
          })

          // Given I am on the confirm page of an in progress update
          const page = ConfirmDetailsPage.visit(courseCompletion, form)

          // And I click change appointment
          page.clickChange('Appointment type')

          // Then I can see the appointment page
          const appointmentPage = Page.verifyOnPage(AppointmentPage)
          appointmentPage.shouldShowAppointment(form.appointmentIdToUpdate)
        })
      })

      describe('when appointment cannot be changed', () => {
        it('does not show change link', () => {
          cy.task('stubGetAppointments', {
            request,
            pagedAppointments: pagedModelAppointmentSummaryFactory.build({ content: [] }),
          })

          // Given I am on the confirm page of an in progress update
          const page = ConfirmDetailsPage.visit(courseCompletion, form)

          // And the appointment cannot be changed
          // Then I should not see a change link
          page.shouldNotShowChangeLink('Appointment type')
        })
      })
    })
  })

  // Scenario: Submitting a course completion resolution
  describe('submitting course completion resolution', () => {
    // Scenario: Shows a success message
    it('submits course completion and shows success message on course completion page', () => {
      // Given I am on the confirm page of an in progress update
      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // When I select yes to sending an alert

      page.alertPractitionerQuestion.checkOptionWithValue('yes')

      cy.task('stubSaveCourseCompletion', { courseCompletion })

      cy.task('stubGetCommunityCampusPdus', { pdus: communityCampusPdusFactory.build() })
      cy.task('stubGetProviders', {
        providers: { providers: providerSummaryFactory.buildList(2) },
      })

      // And I submit
      page.clickSubmit()

      // Then I can see the course completion search page with success message
      const courseCompletionPage = Page.verifyOnPage(SearchCourseCompletionsPage)
      courseCompletionPage.shouldShowSuccessMessage(
        `The course completion for ${offender.forename} ${offender.surname} has been processed`,
      )
    })

    // Scenario: Should show any API validation errors
    it('returns an error message when submission fails with a 400 error', () => {
      // Given I am on the confirm page of an in progress update
      const page = ConfirmDetailsPage.visit(courseCompletion, form)

      // And the API returns a 400 error
      const userMessage = 'Invalid course completion data'
      cy.task('stubSaveCourseCompletionWithError', {
        courseCompletion,
        userMessage,
      })

      // And I submit
      page.clickSubmit()

      // Then I can see the error message
      page.shouldShowErrorSummary(userMessage)
    })
  })
})
