import { ParsedQs } from 'qs'
import { AppointmentDto, SupervisorSummaryDto } from '../../@types/shared'
import { AppointmentUpdatePageViewData, GovUkSelectOption, ValidationErrors } from '../../@types/user-defined'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import Offender from '../../models/offender'
import paths from '../../paths'
import DateTimeFormats from '../../utils/dateTimeUtils'
import SessionUtils from '../../utils/sessionUtils'

interface ViewData extends AppointmentUpdatePageViewData {
  supervisorItems: GovUkSelectOption[]
  project: { name: string; type: string; supervisingTeam: string; dateAndTime: string }
}

interface Body {
  supervisor: string
}

export default class CheckProjectDetailsPage {
  hasErrors: boolean

  validationErrors: ValidationErrors<Body> = {}

  constructor(private readonly query: ParsedQs = {}) {}

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

  validate() {
    if (!this.query.supervisor) {
      this.validationErrors.supervisor = { text: 'Select a supervisor' }
    }

    this.hasErrors = Object.keys(this.validationErrors).length > 0
  }
}
