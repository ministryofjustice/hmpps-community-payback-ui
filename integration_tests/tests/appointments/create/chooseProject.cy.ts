//  Feature: Add project details for a new appointment
//    As a case administrator
//    I want to add project details when creating a new appointment
//    So that I can start recording the appointment outcome

// Scenario: Validating the choose project page
//    Given I am on a 'choose project' page for a new appointment
//    And I do not select a team or project
//    When I submit the form
//    Then I see the same page with errors

// Scenario: can complete the form and navigate to the next page
//    Given I am on a 'choose project' page for a new appointment
//    And I complete the form
//    Then I see the attendance outcome page

// Scenario: can navigate back to the previous page
//    Given I am on a 'choose project' page for a new appointment
//    When I click back
//    Then I see the choose supervisor page

import {
  contactOutcomeFactory,
  contactOutcomesFactory,
} from '../../../../server/testutils/factories/contactOutcomeFactory'
import createAppointmentFormFactory from '../../../../server/testutils/factories/createAppointmentFormFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import projectOutcomeSummaryFactory from '../../../../server/testutils/factories/projectOutcomeSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import AttendanceOutcomePage from '../../../pages/appointments/attendanceOutcomePage'
import ChooseProjectPage from '../../../pages/appointments/chooseProjectPage'
import ChooseSupervisorPage from '../../../pages/appointments/chooseSupervisorPage'
import Page from '../../../pages/page'

context('Create appointment - Choose project', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    const project = projectFactory.build()
    cy.wrap(project).as('project')

    const offender = offenderFullFactory.build()
    cy.wrap(offender).as('offender')

    const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender })

    const form = createAppointmentFormFactory.build({ crn: offender.crn })
    cy.wrap(form).as('form')

    const team = providerTeamSummaryFactory.build({ code: form.projectTeam.code })
    cy.wrap(team).as('team')

    const selectedProject = projectOutcomeSummaryFactory.build({
      projectCode: form.project.code,
      projectName: form.project.name,
    })
    cy.wrap(selectedProject).as('selectedProject')

    cy.task('stubGetTeams', { teams: { providers: [team] }, providerCode: project.providerCode })
    cy.task('stubGetProjects', {
      projects: { content: [selectedProject] },
      teamCode: form.projectTeam.code,
      providerCode: project.providerCode,
    })

    cy.task('stubFindProject', { project })
    cy.task('stubGetOffenderSummary', { caseDetailsSummary })
    cy.task('stubGetAppointmentForm', form)
  })

  // Scenario: Validating the choose project page
  it('shows validation messages', function test() {
    // Given I am on a 'choose project' page for a new appointment
    const page = ChooseProjectPage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // And I do not select a team or project
    page.form.clearTeam()
    // When I submit the form
    page.clickSubmit()

    // Then I see the same page with errors
    page.form.shouldShowTeamError()
    page.form.teamInput.shouldHaveValue('')
  })

  // Scenario: can complete the form and navigate to the next page
  it('can submit the form and continue', function test() {
    const contactOutcomes = contactOutcomesFactory.build({
      contactOutcomes: [contactOutcomeFactory.build({ attended: true })],
    })

    cy.task('stubGetContactOutcomes', { contactOutcomes })
    cy.task('stubSaveAppointmentForm')

    // Given I am on a 'choose project' page for a new appointment
    const page = ChooseProjectPage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // And I complete the form
    page.clickSubmit()

    // Then I see the attendance outcome page
    Page.verifyOnPage(AttendanceOutcomePage, { offender: this.offender })
  })

  // Scenario: can navigate back to the previous page
  it('can navigate back', function test() {
    // Given I am on a 'choose project' page for a new appointment
    const page = ChooseProjectPage.visitForCreateAppointment(this.project.projectCode, this.offender)

    // When I click back
    page.clickBack()

    // Then I see the choose supervisor page
    Page.verifyOnPage(ChooseSupervisorPage, { offender: this.offender })
  })
})
