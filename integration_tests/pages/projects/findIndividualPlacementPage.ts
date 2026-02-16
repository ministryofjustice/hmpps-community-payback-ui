import { ProjectOutcomeSummaryDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import LocationUtils from '../../../server/utils/locationUtils'
import Page from '../page'

export default class FindIndividualPlacementPage extends Page {
  readonly individualPlacementProjectsSortedByMissingOutcomes: Array<ProjectOutcomeSummaryDto>

  constructor(projects: Array<ProjectOutcomeSummaryDto> = []) {
    super('Find an individual placement')

    this.individualPlacementProjectsSortedByMissingOutcomes =
      FindIndividualPlacementPage.getSortedIndividualPlacementsByMissingOutcomes(projects)
  }

  static visit(projects: Array<ProjectOutcomeSummaryDto> = []) {
    cy.visit(paths.projects.index({}))

    return new FindIndividualPlacementPage(projects)
  }

  shouldShowSearchForm() {
    cy.get('h2').contains('Filter individual placements')
    cy.get('label').contains('Region')
    cy.get('label').contains('Project team')
  }

  selectTeam() {
    this.selectOptionByNameAndValue({ name: 'team', value: 'Team 1' })
  }

  shouldShowIndividualPlacementsSortedDescendingByMissingOutcomes() {
    this.individualPlacementProjectsSortedByMissingOutcomes.forEach((project, i) => {
      cy.get('tbody tr')
        .eq(i)
        .within(() => {
          cy.get('td').eq(0).should('contain.text', project.projectName)
          cy.get('td')
            .eq(1)
            .should('contain.text', LocationUtils.locationToString(project.location, { withLineBreaks: false }))
          cy.get('td').eq(2).should('contain.text', project.numberOfAppointmentsOverdue)
          cy.get('td').eq(3).should('contain.text', project.oldestOverdueAppointmentInDays)
        })
    })
  }

  shouldShowEmptyResults() {
    cy.get('h2').should('contain.text', 'No results found')
    cy.get('p').should(
      'contain.text',
      'There are no results that match your search. Try searching again using different search criteria.',
    )
  }

  shouldNotShowResults() {
    cy.get('[data-module="moj-sortable-table"]').should('not.exist')
    cy.contains('h2', 'No results found').should('not.exist')
    cy.contains(
      'p',
      'There are no results that match your search. Try searching again using different search criteria.',
    ).should('not.exist')
  }

  clickClear() {
    cy.get('[data-cy="clear-individual-placements"]').click()
  }

  clickFirstIndividualPlacement() {
    cy.get(`a[href="/projects/${this.getFirstIndividualPlacement().projectCode}"]`).click()
  }

  getFirstIndividualPlacement() {
    return this.individualPlacementProjectsSortedByMissingOutcomes[0]
  }

  static getSortedIndividualPlacementsByMissingOutcomes(projects: Array<ProjectOutcomeSummaryDto>) {
    return projects.sort((a, b) => b.numberOfAppointmentsOverdue - a.numberOfAppointmentsOverdue)
  }
}
