import { PagedModelProjectOutcomeSummaryDto } from '../@types/shared'
import { ValidationErrors } from '../@types/user-defined'
import paths from '../paths'
import { ErrorSummaryItem, generateErrorSummary } from '../utils/errorUtils'
import HtmlUtils from '../utils/htmlUtils'
import LocationUtils from '../utils/locationUtils'

type ProjectIndexPageInput = {
  team?: string
  provider?: string
}

export default class ProjectIndexPage {
  static projectSummaryList(projectOutcomeSummaries: PagedModelProjectOutcomeSummaryDto) {
    return projectOutcomeSummaries.content.map(projectSummary => {
      const projectShowPath = `${paths.projects.show({ projectCode: projectSummary.projectCode })}`
      const projectLink = HtmlUtils.getAnchor(projectSummary.projectName, projectShowPath)

      return [
        { html: projectLink },
        { text: LocationUtils.locationToString(projectSummary.location, { withLineBreaks: false }) },
        { text: projectSummary.numberOfAppointmentsOverdue },
        { text: projectSummary.oldestOverdueAppointmentInDays },
      ]
    })
  }

  static validationErrors(query: ProjectIndexPageInput): {
    errors: ValidationErrors<ProjectIndexPageInput>
    hasErrors: boolean
    errorSummary: Array<ErrorSummaryItem>
  } {
    const errors: ValidationErrors<ProjectIndexPageInput> = {}

    if (!query.provider) {
      errors.provider = { text: 'Choose a region' }
    }

    if (!query.team) {
      errors.team = { text: 'Choose a team' }
    }

    const errorSummary = generateErrorSummary(errors)

    return { errors, hasErrors: Object.keys(errors).length > 0, errorSummary }
  }
}
