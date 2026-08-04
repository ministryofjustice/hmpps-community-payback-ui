import sessionFactory from '../../../../server/testutils/factories/sessionFactory'
import ViewSessionPage from '../../../pages/viewSessionPage'
import Page from '../../../pages/page'
import probationSearchResponseFactory from '../../../../server/testutils/factories/probationSearchResponseFactory'
import projectFactory from '../../../../server/testutils/factories/projectFactory'
import FindAPersonPage from '../../../pages/findAPersonPage'
import probationSearchResultFactory from '../../../../server/testutils/factories/probationSearchResultFactory'
import caseDetailsSummaryFactory from '../../../../server/testutils/factories/caseDetailsSummaryFactory'
import offenderFullFactory from '../../../../server/testutils/factories/offenderFullFactory'
import unpaidWorkDetailsFactory from '../../../../server/testutils/factories/unpaidWorkDetailsFactory'
import RequirementPage from '../../../pages/requirementPage'
import DatePage from '../../../pages/appointments/datePage'
import createAppointmentFormFactory from '../../../../server/testutils/factories/createAppointmentFormFactory'
import HomePage from '../../../pages/homePage'
import Offender from '../../../../server/models/offender'

context('Create session appointment - requirement', () => {
  const date = '2025-09-19'
  const projectCode = 'prj'
  const crn = 'X11111'

  const session = sessionFactory.build({ date, projectCode })

  const probationSearchResultOne = probationSearchResultFactory.build({ otherIds: { crn } })
  const probationSearchResultTwo = probationSearchResultFactory.build()
  const probationSearchResultThree = probationSearchResultFactory.build()

  const probationSearchResponse = probationSearchResponseFactory.build({
    content: [probationSearchResultOne, probationSearchResultTwo, probationSearchResultThree],
  })

  const offender = offenderFullFactory.build({ crn })

  const { name } = new Offender(offender)

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    cy.task('stubSearchPerson', probationSearchResponse)
  })

  it('validates a requirement is selected', () => {
    // Given a person on probation has multiple requirements
    const upwDetails = unpaidWorkDetailsFactory.build()
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [upwDetails, unpaidWorkDetailsFactory.build()],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    // When I visit the requirement page
    const requirementPage = RequirementPage.visitForSession(session, offender)

    // And I do not select a requirement
    requirementPage.clickSubmit()

    // Then I should see an error
    requirementPage.shouldShowErrorSummary('deliusEventNumber', 'Select a requirement')
  })

  it('navigates to date page by selecting a requirement', () => {
    // Given a person on probation has multiple requirements
    const upwDetails = unpaidWorkDetailsFactory.build()
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [upwDetails, unpaidWorkDetailsFactory.build()],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    // When I click on a session in the results
    cy.task('stubFindSession', { session })
    const project = projectFactory.build({
      projectCode: session.projectCode,
    })
    cy.task('stubFindProject', { project })

    ViewSessionPage.visit(session)

    //  And navigate to the find a person page
    const sessionDetailsPage = Page.verifyOnPage(ViewSessionPage, session)

    sessionDetailsPage.clickAddAnAppointment()

    const findAPersonPage = Page.verifyOnPage(FindAPersonPage, session)

    findAPersonPage.personSearchComponent.enterSearchTerm('crn')
    findAPersonPage.personSearchComponent.submitSearch()

    // When I click the person's name
    findAPersonPage.personSearchComponent.clickPerson(crn)

    const requirementPage = Page.verifyOnPage(RequirementPage, name)

    const form = createAppointmentFormFactory.build({ crn: offender.crn })

    cy.task('stubSaveAppointmentForm')
    cy.task('stubGetAppointmentForm', form)

    // And select a requirement
    requirementPage.selectRequirement(upwDetails.eventNumber)
    requirementPage.clickSubmit()

    // Then I should see the date page
    Page.verifyOnPage(DatePage, { offender })
  })

  it('navigates to date page by skipping requirement page', () => {
    // Given a person on probation has one requirement
    const upwDetails = unpaidWorkDetailsFactory.build()
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [upwDetails],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    // When I click on a session in the results
    cy.task('stubFindSession', { session })
    const project = projectFactory.build({
      projectCode: session.projectCode,
    })
    cy.task('stubFindProject', { project })

    ViewSessionPage.visit(session)

    //  And navigate to the find a person page
    const sessionDetailsPage = Page.verifyOnPage(ViewSessionPage, session)

    sessionDetailsPage.clickAddAnAppointment()

    const findAPersonPage = Page.verifyOnPage(FindAPersonPage, session)

    findAPersonPage.personSearchComponent.enterSearchTerm('test')
    findAPersonPage.personSearchComponent.submitSearch()

    const form = createAppointmentFormFactory.build({ crn: offender.crn })

    cy.task('stubSaveAppointmentForm')
    cy.task('stubGetAppointmentForm', form)

    // When I click the person's name
    findAPersonPage.personSearchComponent.clickPerson(crn)

    // Then I should see the date page
    Page.verifyOnPage(DatePage, { offender })
  })

  it('navigates back to the dashboard page if person has no requirement', () => {
    // Given a person on probation has no requirements
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    // When I click on a session in the results
    cy.task('stubFindSession', { session })
    const project = projectFactory.build({
      projectCode: session.projectCode,
    })
    cy.task('stubFindProject', { project })

    ViewSessionPage.visit(session)

    //  And navigate to the find a person page
    const sessionDetailsPage = Page.verifyOnPage(ViewSessionPage, session)

    sessionDetailsPage.clickAddAnAppointment()

    const findAPersonPage = Page.verifyOnPage(FindAPersonPage, session)

    findAPersonPage.personSearchComponent.enterSearchTerm('test')
    findAPersonPage.personSearchComponent.submitSearch()

    const form = createAppointmentFormFactory.build({ crn: offender.crn })

    cy.task('stubSaveAppointmentForm')
    cy.task('stubGetAppointmentForm', form)

    // When I click the person's name
    findAPersonPage.personSearchComponent.clickPerson(crn)

    // Then I should see the dashboard
    Page.verifyOnPage(HomePage)
  })
})

context('Create project appointment - requirement', () => {
  const projectCode = 'prj'
  const crn = 'X11111'

  const project = projectFactory.build({ projectCode })

  const probationSearchResultOne = probationSearchResultFactory.build({ otherIds: { crn } })

  const probationSearchResponse = probationSearchResponseFactory.build({
    content: [probationSearchResultOne, ...probationSearchResultFactory.buildList(2)],
  })

  const offender = offenderFullFactory.build({ crn })

  const { name } = new Offender(offender)

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.signIn()

    cy.task('stubSearchPerson', probationSearchResponse)
    cy.task('stubFindProject', { project })
  })

  it('validates a requirement is selected', () => {
    // Given a person on probation has multiple requirements
    const upwDetails = unpaidWorkDetailsFactory.build()
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [upwDetails, unpaidWorkDetailsFactory.build()],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    // When I visit the requirement page
    const requirementPage = RequirementPage.visitForProject(project, offender)

    // And I do not select a requirement
    requirementPage.clickSubmit()

    // Then I should see an error
    requirementPage.shouldShowErrorSummary('deliusEventNumber', 'Select a requirement')
  })

  it('navigates to date page by selecting a requirement', () => {
    // Given I am on a find a person page for adding a project appointment
    const upwDetails = unpaidWorkDetailsFactory.build()
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [upwDetails, unpaidWorkDetailsFactory.build()],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    const findAPersonPage = FindAPersonPage.visitForProject(project)

    findAPersonPage.personSearchComponent.enterSearchTerm('crn')
    findAPersonPage.personSearchComponent.submitSearch()

    // When I click on a person with multiple requirements
    findAPersonPage.personSearchComponent.clickPerson(crn)

    const requirementPage = Page.verifyOnPage(RequirementPage, name)

    const form = createAppointmentFormFactory.build({ crn: offender.crn })

    cy.task('stubSaveAppointmentForm')
    cy.task('stubGetAppointmentForm', form)

    // And select a requirement
    requirementPage.selectRequirement(upwDetails.eventNumber)
    requirementPage.clickSubmit()

    // Then I should see the date page
    Page.verifyOnPage(DatePage, { offender })
  })

  it('navigates to date page by skipping requirement page', () => {
    // Given I am on a find a person page for adding a project appointment
    const upwDetails = unpaidWorkDetailsFactory.build()
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [upwDetails],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    const findAPersonPage = FindAPersonPage.visitForProject(project)

    findAPersonPage.personSearchComponent.enterSearchTerm('test')
    findAPersonPage.personSearchComponent.submitSearch()

    const form = createAppointmentFormFactory.build({ crn: offender.crn })

    cy.task('stubSaveAppointmentForm')
    cy.task('stubGetAppointmentForm', form)

    // When I click on a person with multiple requirements
    findAPersonPage.personSearchComponent.clickPerson(crn)

    // Then I should see the date page
    Page.verifyOnPage(DatePage, { offender })
  })
})
