import { ProjectOutcomeSummaryDto } from '../../../server/@types/shared'
import paths from '../../../server/paths'
import LocationUtils from '../../../server/utils/locationUtils'
import DataTableComponent from '../components/datatableComponent'
import SelectInput from '../components/selectComponent'
import Page from '../page'

export default class FindIndividualPlacementPage extends Page {
  readonly individualPlacementProjectsSortedByMissingOutcomes: Array<ProjectOutcomeSummaryDto>

  individualPlacementsTable: DataTableComponent

  teamSelectInput: SelectInput

  constructor(projects: Array<ProjectOutcomeSummaryDto> = []) {
    super('Find an individual placement')

    this.individualPlacementProjectsSortedByMissingOutcomes =
      FindIndividualPlacementPage.getSortedIndividualPlacementsByMissingOutcomes(projects)

    this.individualPlacementsTable = new DataTableComponent()
    this.teamSelectInput = new SelectInput('team')
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
    this.teamSelectInput.select('Team 1')
  }

  shouldShowIndividualPlacementsSortedDescendingByMissingOutcomes() {
    const expectedRowValues = this.individualPlacementProjectsSortedByMissingOutcomes.map(project => {
      return [
        project.projectName,
        LocationUtils.locationToString(project.location, { withLineBreaks: false }),
        project.numberOfAppointmentsOverdue,
        project.oldestOverdueAppointmentInDays,
      ]
    })

    this.individualPlacementsTable.shouldHaveRowsWithContent(expectedRowValues)
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
