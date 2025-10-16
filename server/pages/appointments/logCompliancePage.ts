import { AppointmentDto } from '../../@types/shared'
import { AppointmentUpdatePageViewData } from '../../@types/user-defined'
import Offender from '../../models/offender'
import paths from '../../paths'

export default class LogCompliancePage {
  viewData(appointment: AppointmentDto): AppointmentUpdatePageViewData {
    return {
      offender: new Offender(appointment.offender),
      backLink: paths.appointments.logHours({ appointmentId: appointment.id.toString() }),
      updatePath: paths.appointments.logCompliance({ appointmentId: appointment.id.toString() }),
    }
  }
}
