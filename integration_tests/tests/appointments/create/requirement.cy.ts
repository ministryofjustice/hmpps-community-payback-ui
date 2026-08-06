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
import Offender from '../../../../server/models/offender'
import NoRequirementsPage from '../../../pages/noRequirementsPage'
import RestrictedPersonPage from '../../../pages/restrictedPersonPage'
import FindASessionPage from '../../../pages/findASessionPage'
import providerSummaryFactory from '../../../../server/testutils/factories/providerSummaryFactory'
import providerTeamSummaryFactory from '../../../../server/testutils/factories/providerTeamSummaryFactory'
import sessionSummaryFactory from '../../../../server/testutils/factories/sessionSummaryFactory'
import ProjectPage from '../../../pages/projects/projectPage'
import FindIndividualPlacementPage from '../../../pages/projects/findIndividualPlacementPage'
import pagedModelAppointmentSummaryFactory from '../../../../server/testutils/factories/pagedModelAppointmentSummaryFactory'
import pagedModelProjectOutcomeSummaryFactory from '../../../../server/testutils/factories/pagedModelProjectOutcomeSummaryFactory'
import { baseProjectAppointmentRequest } from '../../../mockApis/projects'
import offenderLimitedFactory from '../../../../server/testutils/factories/offenderLimitedFactory'

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

    // When I visit the session details page
    cy.task('stubFindSession', { session })

    ViewSessionPage.visit(session)

    // And navigate to the find a person page
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

    // When I visit the session details page
    cy.task('stubFindSession', { session })

    ViewSessionPage.visit(session)

    // And navigate to the find a person page
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

  it('navigates to the no requirements page if the person has no requirements, and can go back to the find a person page', () => {
    // Given a person on probation has no requirements
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    // When I visit the session details page
    cy.task('stubFindSession', { session })

    ViewSessionPage.visit(session)

    // And navigate to the find a person page
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

    // Then I should see the no requirements page
    const noRequirementsPage = Page.verifyOnPage(NoRequirementsPage, name)

    // And I can click back
    noRequirementsPage.clickBack()

    // Then I should see the find a person page again
    Page.verifyOnPage(FindAPersonPage, session)
  })

  it('navigates to the restricted person page when the person is restricted', () => {
    // Given a person on probation is limited
    const offenderLimited = offenderLimitedFactory.build()

    const upwDetails = unpaidWorkDetailsFactory.build()
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender: offenderLimited,
      unpaidWorkDetails: [upwDetails],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    const limitedCrn = offenderLimited.crn

    const probationSearchResult = probationSearchResultFactory.build({ otherIds: { crn: limitedCrn } })

    const probationSearchResponseWithLimitedOffender = probationSearchResponseFactory.build({
      content: [probationSearchResult],
    })

    cy.task('stubSearchPerson', probationSearchResponseWithLimitedOffender)

    // When I visit the session details page
    cy.task('stubFindSession', { session })

    ViewSessionPage.visit(session)

    // And navigate to the find a person page
    const sessionDetailsPage = Page.verifyOnPage(ViewSessionPage, session)

    sessionDetailsPage.clickAddAnAppointment()

    const findAPersonPage = Page.verifyOnPage(FindAPersonPage, session)

    findAPersonPage.personSearchComponent.enterSearchTerm('test')
    findAPersonPage.personSearchComponent.submitSearch()

    const form = createAppointmentFormFactory.build({ crn: limitedCrn })

    cy.task('stubSaveAppointmentForm')
    cy.task('stubGetAppointmentForm', form)

    // When I click the person
    findAPersonPage.personSearchComponent.clickPerson(limitedCrn)

    // Then I should see the restricted person page
    const restrictedPersonPage = Page.verifyOnPage(RestrictedPersonPage, limitedCrn)

    // And I can click back
    restrictedPersonPage.clickBack()

    // Then I should see the find a person page again
    Page.verifyOnPage(FindAPersonPage, session)
  })

  it('navigates back to the find a person page', () => {
    // Given a person on probation has multiple requirements
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: unpaidWorkDetailsFactory.buildList(2),
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    // When I visit the requirement page
    const requirementPage = RequirementPage.visitForSession(session, offender)
    requirementPage.clickBack()

    Page.verifyOnPage(FindAPersonPage)
  })

  it('navigates back to the session details page and group search', () => {
    // Given a person on probation has multiple requirements
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: unpaidWorkDetailsFactory.buildList(2),
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    const providerCode = 'provider-1'
    const teamCode = 'team-1'
    const searchDate = '01/01/2025'

    // When I visit the requirement page
    const requirementPage = RequirementPage.visitForSession(session, offender, {
      provider: providerCode,
      team: teamCode,
      date: searchDate,
    })
    requirementPage.clickBack()

    // Then I should see the find a person page
    const findAPersonPage = Page.verifyOnPage(FindAPersonPage, session)

    // And the back link should take me to the session details page
    cy.task('stubFindSession', { session })
    findAPersonPage.clickBack()

    const viewSessionPage = Page.verifyOnPage(ViewSessionPage, session)

    const provider = providerSummaryFactory.build({ code: providerCode })
    const team = providerTeamSummaryFactory.build({ code: teamCode })
    cy.task('stubGetProviders', { providers: { providers: [provider] } })
    cy.task('stubGetTeams', { teams: { providers: [team] }, providerCode: provider.code })
    const sessionSummary = sessionSummaryFactory.build()
    cy.task('stubGetSessions', {
      request: {
        providerCode: provider.code,
        teamCode: team.code,
        startDate: '2025-01-01',
        endDate: '2025-01-01',
        username: 'some-name',
      },
      sessions: {
        content: [sessionSummary],
      },
    })

    // When I click back to the find a group session or induction page
    viewSessionPage.clickBack()

    // Then I should see the find a group session or induction page with original search
    const searchPage = Page.verifyOnPage(FindASessionPage)
    searchPage.shouldShowSearchResults(sessionSummary)
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

  it('navigates back to the find a person page', () => {
    // Given a person on probation has multiple requirements
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: unpaidWorkDetailsFactory.buildList(2),
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    // When I visit the requirement page
    const requirementPage = RequirementPage.visitForProject(project, offender)
    requirementPage.clickBack()

    Page.verifyOnPage(FindAPersonPage)
  })

  it('navigates back to the project details page and individual placement search', () => {
    // Given a person on probation has multiple requirements
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: unpaidWorkDetailsFactory.buildList(2),
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    const providerCode = 'provider-1'
    const teamCode = 'team-1'
    const date = '01/01/2025'

    // When I visit the requirement page
    const requirementPage = RequirementPage.visitForProject(project, offender, {
      provider: providerCode,
      team: teamCode,
      date,
    })
    requirementPage.clickBack()

    // Then I should see the find a person page
    const findAPersonPage = Page.verifyOnPage(FindAPersonPage)

    // And the back link should take me to the project details page
    const pagedAppointments = pagedModelAppointmentSummaryFactory.build()
    const request = {
      ...baseProjectAppointmentRequest(),
      projectCodes: [project.projectCode],
    }
    cy.task('stubGetAppointments', { request, pagedAppointments })
    findAPersonPage.clickBack()

    const projectPage = Page.verifyOnPage(ProjectPage, project)

    const provider = providerSummaryFactory.build({ code: providerCode })
    const team = providerTeamSummaryFactory.build({ code: teamCode })
    cy.task('stubGetProviders', { providers: { providers: [provider] } })
    cy.task('stubGetTeams', { teams: { providers: [team] }, providerCode: provider.code })
    const projects = pagedModelProjectOutcomeSummaryFactory.build()
    cy.task('stubGetProjects', {
      teamCode: team.code,
      providerCode: provider.code,
      projects,
    })

    // When I click back to the individual placement search page
    projectPage.clickBack()

    // Then I should see the individual placement search page with original search
    const searchPage = Page.verifyOnPage(FindIndividualPlacementPage, projects.content)
    searchPage.shouldShowIndividualPlacements()
  })
})
