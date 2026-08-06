//  Feature: Add a date for a new appointment
//    As a case administrator
//    I want to add a date when creating a new appointment
//    So that I can record when the appointment takes place

// Scenario: Validating the 'date' page
//    Given I am on the 'date' page for a new appointment
//    When I submit the form with no date
//    Then I see the same page with errors

// Scenario: can complete the form and navigate to the next page
//    Given I am on the 'date' page for a new appointment
//    And I enter a valid date
//    When I submit the form
//    Then I see the choose supervisor page

//  Scenario: populating the date field
//    Given I am on the 'date' page for a new appointment
//    Then it should show the form date value
//    When I submit the form
//    Then I see the choose supervisor page

//  Scenario: navigating back to the requirement page for an individual project
//    Given I am on the 'date' page for a new appointment on an individual project
//    And the person has multiple requirements
//    When I click back
//    Then I see the requirement page
//    And I click back again
//    Then I see the find a person page
//    And I click back again
//    Then I see the details of the project for that appointment

//  Scenario: navigating back to the find a person page for an individual project
//    Given I am on the 'date' page for a new appointment on an individual project
//    And the person has one requirement
//    When I click back
//    Then I see the find a person page
//    And I click back again
//    Then I see the details of the project for that appointment

//  Scenario: navigating back to the requirement page for a group session
//    Given I am on the 'date' page for a new appointment on a group session
//    And the person has multiple requirements
//    When I click back
//    Then I see the requirement page
//    And I click back again
//    Then I see the find a person page
//    And I click back again
//    Then I see the details of the session for that appointment

//  Scenario: navigating back to the find a person page for a group session
//    Given I am on the 'date' page for a new appointment on a group session
//    And the person has one requirement
//    When I click back
//    Then I see the find a person page
//    And I click back again
//    Then I see the details of the session for that appointment

import DatePage from '../../../pages/appointments/datePage'
import ChooseSupervisorPage from '../../../pages/appointments/chooseSupervisorPage'
import RequirementPage from '../../../pages/requirementPage'
import FindAPersonPage from '../../../pages/findAPersonPage'
import Page from '../../../pages/page'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import createAppointmentFormFactory from '../../../../server/testutils/factories/createAppointmentFormFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import unpaidWorkDetailsFactory from '../../../../server/testutils/factories/unpaidWorkDetailsFactory'
import Offender from '../../../../server/models/offender'
import ProjectPage from '../../../pages/projects/projectPage'
import sessionFactory from '../../../../server/testutils/factories/sessionFactory'
import ViewSessionPage from '../../../pages/viewSessionPage'
import pagedModelAppointmentSummaryFactory from '../../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import { baseProjectAppointmentRequest } from '../../../mockApis/projects'

context('Create appointment - Date', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build({ projectType: { group: 'INDIVIDUAL' } })
    cy.wrap(project).as('project')

    const offender = offenderFullFactory.build()
    cy.wrap(offender).as('offender')

    const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })

    const form = createAppointmentFormFactory.build({ crn: offender.crn, date: undefined })
    cy.wrap(form).as('form')

    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetAppointmentForm', form)
    cy.task('stubFindProject', { project })
  })

  // Scenario: Validating the 'date' page
  it('shows validation message for empty date', function test() {
    // Given I am on the 'date' page for a new appointment
    const page = DatePage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // When I submit the form with no date
    page.clickSubmit()

    // Then I see the same page with errors
    page.shouldShowErrorSummary('date', 'Enter or select a date')
  })

  // Scenario: can complete the form and navigate to the next page
  it('can submit the form and continue', function test() {
    // Given I am on the 'date' page for a new appointment
    const page = DatePage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // And I enter a valid date
    page.enterDate('18/9/2025')

    const teams = providerTeamSummaryFactory.buildList(2)
    cy.task('stubFindProject', { project: this.project })
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: this.project.providerCode })
    cy.task('stubSaveAppointmentForm')

    // When I submit the form
    page.clickSubmit()

    // Then I see the choose supervisor page
    Page.verifyOnPage(ChooseSupervisorPage, { offender: this.offender })
  })

  // Scenario: populating the date field
  it('shows any given date on the form', function test() {
    const form = createAppointmentFormFactory.build({ ...this.form, date: '2026-01-01' })
    cy.task('stubGetAppointmentForm', form)

    // Given I am on the 'date' page for a new appointment
    const page = DatePage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // Then it should show the form date value
    page.shouldHaveValue('01/01/2026')

    const teams = providerTeamSummaryFactory.buildList(2)
    cy.task('stubGetTeams', { teams: { providers: teams }, providerCode: this.project.providerCode })
    cy.task('stubSaveAppointmentForm')

    // When I submit the form
    page.clickSubmit()

    // Then I see the choose supervisor page
    Page.verifyOnPage(ChooseSupervisorPage, { offender: this.offender })
  })

  describe('navigating back', () => {
    describe('individual project', () => {
      // Scenario: navigating back to the requirement page for an individual project
      it('goes back to the requirement page when the person has multiple requirements', function test() {
        // Given the person has multiple requirements
        const caseDetailsSummary = caseDetailsSummaryFactory.build({
          offender: this.offender,
          unpaidWorkDetails: unpaidWorkDetailsFactory.buildList(2),
        })
        cy.task('stubGetOffenderSummary', { caseDetailsSummary })

        // And I am on the 'date' page for a new appointment on an individual project
        const page = DatePage.visitForCreateAppointment(this.project.projectCode, this.offender)

        // When I click back
        page.clickBack()

        // Then I see the requirement page
        Page.verifyOnPage(RequirementPage, new Offender(this.offender).name)

        // And I click back again
        page.clickBack()

        // Then I see the find a person page
        Page.verifyOnPage(FindAPersonPage)

        // And I click back again
        const pagedAppointments = pagedModelAppointmentSummaryFactory.build()

        const request = {
          ...baseProjectAppointmentRequest(),
          projectCodes: [this.project.projectCode],
        }
        cy.task('stubGetAppointments', { request, pagedAppointments })
        page.clickBack()

        // Then I see the details of the project for that appointment
        Page.verifyOnPage(ProjectPage, this.project)
      })

      // Scenario: navigating back to the find a person page for an individual project
      it('goes back to the find a person page when the person has one requirement', function test() {
        // Given the person has one requirement
        const caseDetailsSummary = caseDetailsSummaryFactory.build({
          offender: this.offender,
          unpaidWorkDetails: unpaidWorkDetailsFactory.buildList(1),
        })
        cy.task('stubGetOffenderSummary', { caseDetailsSummary })

        // And I am on the 'date' page for a new appointment on an individual project
        const page = DatePage.visitForCreateAppointment(this.project.projectCode, this.offender)

        // When I click back
        page.clickBack()

        // Then I see the find a person page
        Page.verifyOnPage(FindAPersonPage)

        // And I click back again
        const pagedAppointments = pagedModelAppointmentSummaryFactory.build()

        const request = {
          ...baseProjectAppointmentRequest(),
          projectCodes: [this.project.projectCode],
        }
        cy.task('stubGetAppointments', { request, pagedAppointments })
        page.clickBack()

        // Then I see the details of the project for that appointment
        Page.verifyOnPage(ProjectPage, this.project)
      })
    })

    describe('group session', () => {
      const project = projectFactory.build({ projectType: { group: 'GROUP' } })
      const date = '2025-09-19'
      const session = sessionFactory.build({ ...project, date })

      beforeEach(function beforeEach() {
        const form = createAppointmentFormFactory.build({ crn: this.offender.crn, date })
        cy.task('stubGetAppointmentForm', form)

        cy.task('stubFindSession', { session })
      })

      // Scenario: navigating back to the requirement page for a group session
      it('goes back to the requirement page when the person has multiple requirements', function test() {
        // Given the person has multiple requirements
        const caseDetailsSummary = caseDetailsSummaryFactory.build({
          offender: this.offender,
          unpaidWorkDetails: unpaidWorkDetailsFactory.buildList(2),
        })
        cy.task('stubGetOffenderSummary', { caseDetailsSummary })

        // And I am on the 'date' page for a new appointment on a group session
        const page = DatePage.visitForCreateAppointment(project.projectCode, this.offender)

        // When I click back
        page.clickBack()

        // Then I see the requirement page
        Page.verifyOnPage(RequirementPage, new Offender(this.offender).name)

        // And I click back again
        page.clickBack()

        // Then I see the find a person page
        Page.verifyOnPage(FindAPersonPage)

        const viewSession = sessionFactory.build({ ...project, date })
        cy.task('stubFindSession', { session: viewSession })

        // And I click back again
        page.clickBack()

        // Then I see the details of the session for that appointment
        Page.verifyOnPage(ViewSessionPage, viewSession)
      })

      // Scenario: navigating back to the find a person page for a group session
      it('goes back to the find a person page when the person has one requirement', function test() {
        // Given the person has one requirement
        const caseDetailsSummary = caseDetailsSummaryFactory.build({
          offender: this.offender,
          unpaidWorkDetails: unpaidWorkDetailsFactory.buildList(1),
        })
        cy.task('stubGetOffenderSummary', { caseDetailsSummary })

        // And I am on the 'date' page for a new appointment on a group session
        const page = DatePage.visitForCreateAppointment(project.projectCode, this.offender)

        // When I click back
        page.clickBack()

        // Then I see the find a person page
        Page.verifyOnPage(FindAPersonPage)

        // And I click back again
        page.clickBack()

        // Then I see the details of the session for that appointment
        Page.verifyOnPage(ViewSessionPage, session)
      })
    })
  })
})
