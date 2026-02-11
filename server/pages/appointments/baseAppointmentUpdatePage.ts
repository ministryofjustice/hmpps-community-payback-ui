import { AppointmentDto, ProjectDto } from '../../@types/shared'
import {
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
} from '../../@types/user-defined'
import Offender from '../../models/offender'
import paths from '../../paths'
import SessionUtils from '../../utils/sessionUtils'
import { pathWithQuery } from '../../utils/utils'

export default abstract class BaseAppointmentUpdatePage {
  form?: AppointmentOutcomeForm

  protected abstract nextPath(projectCode: string, appointmentId: string | AppointmentDto): string

  protected abstract backPath(appointment: AppointmentDto): string

  protected abstract updatePath(appointment: AppointmentDto): string

  protected abstract getForm(form: AppointmentOutcomeForm, ...args: Array<unknown>): AppointmentOutcomeForm

  formId: string | undefined

  constructor(query: AppointmentUpdateQuery) {
    this.formId = query.form?.toString()
  }

  exitForm(appointment: AppointmentDto, project: ProjectDto): string {
    if (project.projectType.group === 'GROUP') {
      return SessionUtils.getSessionPath(appointment)
    }
    return paths.projects.show({ projectCode: appointment.projectCode })
  }

  next(projectCode: string, appointmentId: string) {
    return this.pathWithFormId(this.nextPath(projectCode, appointmentId))
  }

  updateForm(form: AppointmentOutcomeForm, ...args: Array<unknown>): AppointmentOutcomeForm {
    this.form = this.getForm(form, ...args)
    return this.form
  }

  protected commonViewData(appointment: AppointmentDto): AppointmentUpdatePageViewData {
    return {
      offender: new Offender(appointment.offender),
      backLink: this.pathWithFormId(this.backPath(appointment)),
      updatePath: this.pathWithFormId(this.updatePath(appointment)),
      form: this.formId,
    }
  }

  protected pathWithFormId(path: string): string {
    return pathWithQuery(path, { form: this.formId })
  }
}
