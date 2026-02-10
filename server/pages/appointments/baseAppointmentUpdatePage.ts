import { AppointmentDto } from '../../@types/shared'
import {
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
} from '../../@types/user-defined'
import Offender from '../../models/offender'
import { pathWithQuery } from '../../utils/utils'

export default abstract class BaseAppointmentUpdatePage {
  form?: AppointmentOutcomeForm

  protected includeFormQueryInNextPath: boolean = true

  protected includeFormQueryInBackPath: boolean = true

  protected abstract nextPath(appointment: AppointmentDto): string

  protected abstract backPath(appointment: AppointmentDto): string

  protected abstract updatePath(appointment: AppointmentDto): string

  protected abstract getForm(form: AppointmentOutcomeForm, ...args: Array<unknown>): AppointmentOutcomeForm

  formId: string | undefined

  constructor(query: AppointmentUpdateQuery) {
    this.formId = query.form?.toString()
  }

  next(appointment: AppointmentDto) {
    if (this.includeFormQueryInNextPath) {
      return this.pathWithFormId(this.nextPath(appointment))
    }
    return this.nextPath(appointment)
  }

  updateForm(form: AppointmentOutcomeForm, ...args: Array<unknown>): AppointmentOutcomeForm {
    this.form = this.getForm(form, ...args)
    return this.form
  }

  protected commonViewData(appointment: AppointmentDto): AppointmentUpdatePageViewData {
    return {
      offender: new Offender(appointment.offender),
      backLink: this.includeFormQueryInBackPath
        ? this.pathWithFormId(this.backPath(appointment))
        : this.backPath(appointment),
      updatePath: this.pathWithFormId(this.updatePath(appointment)),
      form: this.formId,
    }
  }

  protected pathWithFormId(path: string): string {
    return pathWithQuery(path, { form: this.formId })
  }
}
