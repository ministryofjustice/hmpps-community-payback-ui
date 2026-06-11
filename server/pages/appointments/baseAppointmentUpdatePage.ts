import { ProjectDto } from '../../@types/shared'
import {
  AppointmentOrSession,
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

  exitForm(
    appointmentOrSession: AppointmentOrSession,
    project?: ProjectDto,
    originalSearch?: Record<string, string>,
  ): string {
    if (project?.projectType.group === 'GROUP') {
      return SessionUtils.getSessionPath(appointmentOrSession, originalSearch)
    }
    return pathWithQuery(paths.projects.show({ projectCode: appointmentOrSession.projectCode }), originalSearch)
  }

  next({ appointmentId, date, projectCode }: { projectCode: string; appointmentId?: string; date?: string }) {
    const nextPage = this.nextPage()

    if (!nextPage) {
      throw new Error('No next page configured')
    }

    if (appointmentId) {
      return this.pathWithFormId(
        paths.appointments.update({
          projectCode,
          appointmentId,
          page: nextPage,
        }),
      )
    }

    if (date) {
      return this.pathWithFormId(
        paths.sessions.update({
          projectCode,
          date,
          page: nextPage,
        }),
      )
    }

    throw new Error('Path must have an appointment ID or session date')
  }

  updateForm(form: AppointmentOutcomeForm, ...args: Array<unknown>): AppointmentOutcomeForm {
    this.form = this.getForm(form, ...args)
    return this.form
  }

  updatePath(appointmentOrSession: AppointmentOrSession) {
    return this.buildPath(appointmentOrSession, this.page)
  }

  protected isSingleAppointment = (appointmentOrSession: AppointmentOrSession) =>
    'deliusEventNumber' in appointmentOrSession

  protected backPath(
    appointmentOrSession: AppointmentOrSession,
    originalSearch?: Record<string, string>,
    project?: ProjectDto,
  ) {
    const backPage = this.backPage()

    if (!backPage) {
      return this.exitForm(appointmentOrSession, project, originalSearch)
    }

    return this.buildPath(appointmentOrSession, backPage, originalSearch)
  }

  protected commonViewData({
    appointmentOrSession,
    originalSearch,
    project,
  }: {
    appointmentOrSession: AppointmentOrSession
    originalSearch?: Record<string, string>
    project?: ProjectDto
  }): AppointmentUpdatePageViewData {
    const viewData: AppointmentUpdatePageViewData = {
      backLink: this.backPath(appointmentOrSession, originalSearch, project),
      updatePath: this.updatePath(appointmentOrSession),
      form: this.formId,
      heading: this.buildHeading(appointmentOrSession),
    }

    return viewData
  }

  private buildHeading(appointmentOrSession: AppointmentOrSession) {
    if ('offender' in appointmentOrSession) {
      const offender = new Offender(appointmentOrSession.offender)
      return {
        title: offender.name,
        caption: offender.crn,
      }
    }
  }

  protected pathWithFormId(path: string): string {
    return pathWithQuery(path, { form: this.formId })
  }

  private buildPath(
    appointmentOrSession: AppointmentOrSession,
    page: AppointmentFormPage,
    originalSearch?: Record<string, string>,
  ): string {
    if (this.isSingleAppointment(appointmentOrSession)) {
      return pathWithQuery(
        this.pathWithFormId(
          paths.appointments.update({
            projectCode: appointmentOrSession.projectCode,
            appointmentId: appointmentOrSession.id.toString(),
            page,
          }),
        ),
        originalSearch,
      )
    }

    return pathWithQuery(
      this.pathWithFormId(
        paths.sessions.update({
          projectCode: appointmentOrSession.projectCode,
          date: appointmentOrSession.date,
          page,
        }),
      ),
      originalSearch,
    )
  }
}
