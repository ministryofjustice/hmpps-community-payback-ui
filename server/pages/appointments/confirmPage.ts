import { AppointmentDto } from '../../@types/shared'
import paths from '../../paths'
import SessionUtils from '../../utils/sessionUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'

export default class ConfirmPage extends BaseAppointmentUpdatePage {
  constructor() {
    super()
  }

  viewData(appointment: AppointmentDto) {
    return this.commonViewData(appointment)
  }

  protected nextPath(appointment: AppointmentDto): string {
    return SessionUtils.getSessionPath(appointment)
  }

  protected backPath(appointment: AppointmentDto): string {
    return paths.appointments.logCompliance({ appointmentId: appointment.id.toString() })
  }

  protected updatePath(appointment: AppointmentDto): string {
    return paths.appointments.confirm({ appointmentId: appointment.id.toString() })
  }
}
