import { PagedModelProjectOutcomeSummaryDto } from '../@types/shared'
import paths from '../paths'
import HtmlUtils from '../utils/htmlUtils'
import LocationUtils from '../utils/locationUtils'

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
}
