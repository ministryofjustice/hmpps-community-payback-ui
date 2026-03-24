//  Feature: Confirm a person has not completed the course previously
//    As a case admin
//    I want to check the person's course history
//    So that I can check they can be credited hours for the course

//  Scenario: Viewing previous appointments
//    Given I am on the form page
//    Then I should see a list of previous ete appointments
//    When I click submit
//    Then I should be on the requirement page

//  Scenario: Navigating back
//    Given I am on the form page
//    When I click back
//    Then I should see the confirm person page

import { GetAppointmentsRequest } from '../../../../server/data/appointmentClient'
import appointmentSummaryFactory from '../../../../server/testutils/factories/appointmentSummaryFactory'
import courseCompletionFactory from '../../../../server/testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../../server/testutils/factories/courseCompletionFormFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import DateTimeFormats from '../../../../server/utils/dateTimeUtils'
import HistoryPage from '../../../pages/courseCompletions/process/historyPage'
import PersonPage from '../../../pages/courseCompletions/process/personPage'
import RequirementPage from '../../../pages/courseCompletions/process/requirementPage'
import Page from '../../../pages/page'

context('Person Page', () => {
  const courseCompletion = courseCompletionFactory.build()
  const form = courseCompletionFormFactory.build()
  const appointments = appointmentSummaryFactory.buildList(3)
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()
    cy.task('stubFindCourseCompletion', { courseCompletion })
    cy.task('stubGetCourseCompletionForm', form)
    cy.task('stubSaveCourseCompletionForm')
    cy.task('stubGetAppointments', {
      request: getAppointmentRequest(form.crn),
      pagedAppointments: { content: appointments },
    })
  })

  // Scenario: Viewing previous appointments
  it('displays previous completed course completion appointments', () => {
    const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender: { crn: form.crn } })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    //  Given I am on the form page
    const page = HistoryPage.visit(courseCompletion)

    // Then I should see a list of previous ete appointments
    page.shouldShowAppointmentDetails(appointments)

    // When I click submit
    page.clickSubmit()

    // Then I should be on the requirement page
    Page.verifyOnPage(RequirementPage)
  })

  // Scenario: Navigating back
  it('navigates back', () => {
    //  Given I am on the form page
    const page = HistoryPage.visit(courseCompletion)

    //  When I click back
    page.clickBack()

    // Then I should see the confirm person page
    Page.verifyOnPage(PersonPage, courseCompletion)
  })
})

const getAppointmentRequest = (crn: string): GetAppointmentsRequest => ({
  projectTypeGroup: 'ETE',
  outcomeCodes: ['ATTC'],
  toDate: DateTimeFormats.dateObjToIsoString(new Date()),
  fromDate: DateTimeFormats.getTodaysDatePlusDays(-365).formattedDate,
  crn,
  sort: ['date,desc'],
})
