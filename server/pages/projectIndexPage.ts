import { PagedModelProjectOutcomeSummaryDto } from '../@types/shared'
import paths from '../paths'
import HtmlUtils from '../utils/htmlUtils'
import LocationUtils from '../utils/locationUtils'
import { pathWithQuery } from '../utils/utils'

export default class ProjectIndexPage {
  static projectSummaryList(projectOutcomeSummaries: PagedModelProjectOutcomeSummaryDto, queryParams: Record<string, string> = {}) {
    return projectOutcomeSummaries.content.map(projectSummary => {
      const projectShowPath = `${paths.projects.show({ projectCode: projectSummary.projectCode })}`
      const projectShowPathWithQuery = pathWithQuery(projectShowPath, { ...queryParams })
      const projectLink = HtmlUtils.getAnchor(projectSummary.projectName, projectShowPathWithQuery)

      return [
        { html: projectLink },
        { text: LocationUtils.locationToString(projectSummary.location, { withLineBreaks: false }) },
        { text: projectSummary.numberOfAppointmentsOverdue },
        { text: projectSummary.oldestOverdueAppointmentInDays },
      ]
    })
  }
}
