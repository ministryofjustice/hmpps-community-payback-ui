import { AppointmentDto } from '../../@types/shared'
import { AppointmentUpdatePageViewData } from '../../@types/user-defined'
import Offender from '../../models/offender'

export default abstract class BaseAppointmentUpdatePage {
  protected abstract nextPath(appointmentId: string | AppointmentDto): string

  protected abstract backPath(appointment: AppointmentDto): string

  protected abstract updatePath(appointment: AppointmentDto): string

  next(appointmentId: string) {
    return this.nextPath(appointmentId)
  }

  protected commonViewData(appointment: AppointmentDto): AppointmentUpdatePageViewData {
    return {
      offender: new Offender(appointment.offender),
      backLink: this.backPath(appointment),
      updatePath: this.updatePath(appointment),
    }
  }
}
