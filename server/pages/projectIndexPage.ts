import { PagedModelProjectOutcomeSummaryDto } from '../@types/shared'
import LocationUtils from '../utils/locationUtils'

export default class ProjectIndexPage {
  static projectSummaryList(projectOutcomeSummaries: PagedModelProjectOutcomeSummaryDto) {
    return projectOutcomeSummaries.content.map(projectSummary => [
      { text: projectSummary.projectName },
      { text: LocationUtils.locationToString(projectSummary.location, { withLineBreaks: false }) },
      { text: projectSummary.numberOfAppointmentsOverdue },
      { text: projectSummary.oldestOverdueAppointmentInDays },
    ])
  }
}
