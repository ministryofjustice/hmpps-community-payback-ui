import { AppointmentSummaryDto, EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import AppointmentCardComponent from '../../components/appointmentCardComponent'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class HistoryPage extends BaseCourseCompletionsPage {
  constructor(title: string) {
    super(title)
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = pathWithQuery(paths.courseCompletions.process({ page: 'history', id: courseCompletion.id }), {
      form: '12',
    })
    return this.visitAndCheck(path, HistoryPage.getName(courseCompletion))
  }

  shouldShowAppointmentDetails(appointments: Array<AppointmentSummaryDto>) {
    appointments.map(AppointmentCardComponent.shouldShowCardWithDetails)
  }
}
