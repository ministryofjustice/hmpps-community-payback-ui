import { ProjectSummaryDto } from '../@types/shared'
import LocationUtils from '../utils/locationUtils'

export default class ProjectIndexPage {
  static projectSummaryList(projectSummaries: Array<ProjectSummaryDto>) {
    return projectSummaries.map(projectSummary => [
      { text: projectSummary.projectName },
      { text: LocationUtils.locationToString(projectSummary.location, { withLineBreaks: false }) },
      { text: projectSummary.numberOfAppointmentsOverdue },
      { text: projectSummary.oldestOverdueAppointmentInDays },
    ])
  }
}
