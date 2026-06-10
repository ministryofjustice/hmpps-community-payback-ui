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
import { AppointmentFormPage } from './pathMap'

export default abstract class BaseAppointmentUpdatePage {
  form?: AppointmentOutcomeForm

  protected abstract page: AppointmentFormPage

  protected abstract nextPage(): AppointmentFormPage | undefined

  protected abstract backPage(): AppointmentFormPage | undefined

  protected abstract getForm(form: AppointmentOutcomeForm, ...args: Array<unknown>): AppointmentOutcomeForm

  formId: string | undefined

  constructor(query: AppointmentUpdateQuery) {
    this.formId = query.form?.toString()
  }

  exitForm(appointment: AppointmentDto, project?: ProjectDto, originalSearch?: Record<string, string>): string {
    if (project?.projectType.group === 'GROUP') {
      return SessionUtils.getSessionPath(appointment, originalSearch)
    }
    return pathWithQuery(paths.projects.show({ projectCode: appointment.projectCode }), originalSearch)
  }

  next(projectCode: string, appointmentId: string) {
    const nextPage = this.nextPage()

    if (!nextPage) {
      throw new Error('No next page configured')
    }

    return this.pathWithFormId(
      paths.appointments.update({
        projectCode,
        appointmentId,
        page: nextPage,
      }),
    )
  }

  updateForm(form: AppointmentOutcomeForm, ...args: Array<unknown>): AppointmentOutcomeForm {
    this.form = this.getForm(form, ...args)
    return this.form
  }

  updatePath(appointment: AppointmentDto) {
    return this.pathWithFormId(
      paths.appointments.update({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: this.page,
      }),
    )
  }

  protected backPath(appointment: AppointmentDto, originalSearch?: Record<string, string>, project?: ProjectDto) {
    const backPage = this.backPage()

    if (!backPage) {
      return this.exitForm(appointment, project, originalSearch)
    }

    return pathWithQuery(
      this.pathWithFormId(
        paths.appointments.update({
          projectCode: appointment.projectCode,
          appointmentId: appointment.id.toString(),
          page: backPage,
        }),
      ),
      originalSearch,
    )
  }

  protected commonViewData({
    appointment,
    originalSearch,
    project,
  }: {
    appointment: AppointmentDto
    originalSearch?: Record<string, string>
    project?: ProjectDto
  }): AppointmentUpdatePageViewData {
    return {
      offender: new Offender(appointment.offender),
      backLink: this.backPath(appointment, originalSearch, project),
      updatePath: this.updatePath(appointment),
      form: this.formId,
    }
  }

  protected pathWithFormId(path: string): string {
    return pathWithQuery(path, { form: this.formId })
  }
}
