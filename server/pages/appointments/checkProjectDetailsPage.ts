import { AppointmentDto, SupervisorSummaryDto } from '../../@types/shared'
import { GovUkSelectOption } from '../../@types/user-defined'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import Offender from '../../models/offender'
import paths from '../../paths'
import DateTimeFormats from '../../utils/dateTimeUtils'
import SessionUtils from '../../utils/sessionUtils'

interface ViewData {
  supervisorItems: GovUkSelectOption[]
  offender: Offender
  project: { name: string; type: string; supervisingTeam: string; dateAndTime: string }
  backLink: string
  updatePath: string
}

export default class CheckProjectDetailsPage {
  constructor() {}

  viewData(appointment: AppointmentDto, supervisors: SupervisorSummaryDto[]): ViewData {
    return {
      supervisorItems: GovUkSelectInput.getOptions(
        supervisors,
        'name',
        'code',
        'Choose supervisor',
        appointment.attendanceData?.supervisorOfficerCode,
      ),

      offender: new Offender(appointment.offender),
      project: {
        name: appointment.projectName,
        type: appointment.projectTypeName,
        supervisingTeam: appointment.supervisingTeam,
        dateAndTime: DateTimeFormats.dateAndTimePeriod(appointment.date, appointment.startTime, appointment.endTime),
      },
      backLink: SessionUtils.getSessionPath(appointment),
      updatePath: paths.appointments.projectDetails({ appointmentId: appointment.id.toString() }),
    }
  }
}
