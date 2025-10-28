import { AppointmentDto } from '../../@types/shared'
import { AppointmentUpdatePageViewData, AppointmentUpdateQuery } from '../../@types/user-defined'
import Offender from '../../models/offender'
import { pathWithQuery } from '../../utils/utils'

export default abstract class BaseAppointmentUpdatePage {
  protected abstract nextPath(appointmentId: string | AppointmentDto): string

  protected abstract backPath(appointment: AppointmentDto): string

  protected abstract updatePath(appointment: AppointmentDto): string

  formId: string | undefined

  constructor(query: AppointmentUpdateQuery) {
    this.formId = query.form?.toString()
  }

  next(appointmentId: string) {
    return this.pathWithFormId(this.nextPath(appointmentId))
  }

  protected commonViewData(appointment: AppointmentDto): AppointmentUpdatePageViewData {
    return {
      offender: new Offender(appointment.offender),
      backLink: this.pathWithFormId(this.backPath(appointment)),
      updatePath: this.pathWithFormId(this.updatePath(appointment)),
      form: this.formId,
    }
  }

  private pathWithFormId(path: string): string {
    return pathWithQuery(path, { form: this.formId })
  }
}
