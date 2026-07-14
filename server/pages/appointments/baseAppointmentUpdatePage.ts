import { OffenderDto, ProjectDto, SessionDto } from '../../@types/shared'
import { AppointmentOrSession } from '../../@types/user-defined'
import { AppointmentOutcomeForm, UpdateSessionForm } from '../../services/forms/appointmentFormService'
import Offender from '../../models/offender'
import paths from '../../paths'
import SessionUtils from '../../utils/sessionUtils'
import { pathWithQuery } from '../../utils/utils'
import { AppointmentFormPage } from './pathMap'
import PageWithValidation from '../pageWithValidation'
import DateTimeFormats from '../../utils/dateTimeUtils'

type HeadingViewData = {
  title: string
  caption: string
  description?: string
}

type PageRouteParams = {
  projectCode: string
  appointmentId?: string
  date?: string
  formId?: string
}

export default abstract class BaseAppointmentUpdatePage<TBody, TContext = unknown> extends PageWithValidation<
  TBody,
  TContext
> {
  protected abstract page: AppointmentFormPage

  protected abstract nextPage(form: AppointmentOutcomeForm): AppointmentFormPage | undefined

  protected abstract backPage(
    isSingleAppointment: boolean,
    form?: AppointmentOutcomeForm,
  ): AppointmentFormPage | undefined

  protected abstract getForm(form: AppointmentOutcomeForm, query: TBody, context: TContext): AppointmentOutcomeForm

  exitForm({
    projectCode,
    date,
    project,
    originalSearch,
  }: Pick<PageRouteParams, 'projectCode' | 'date'> & {
    project?: ProjectDto
    originalSearch?: Record<string, string>
  }): string {
    if (project?.projectType.group === 'GROUP') {
      if (!date) {
        throw new Error('Path must have an appointment ID or session date')
      }

      return pathWithQuery(paths.sessions.show({ projectCode, date }), originalSearch)
    }

    return pathWithQuery(paths.projects.show({ projectCode }), originalSearch)
  }

  next({
    appointmentId,
    date,
    projectCode,
    formId,
    form,
  }: {
    projectCode: string
    appointmentId?: string
    date?: string
    formId?: string
    form: AppointmentOutcomeForm
  }) {
    const nextPage = this.nextPage(form)

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
        formId,
      )
    }

    if (date) {
      return this.pathWithFormId(
        paths.sessions.update({
          projectCode,
          date,
          page: nextPage,
        }),
        formId,
      )
    }

    throw new Error('Path must have an appointment ID or session date')
  }

  updateForm(form: AppointmentOutcomeForm, query: TBody, context?: TContext): AppointmentOutcomeForm {
    return this.getForm(form, query, context)
  }

  updatePath(projectCode: string, appointmentId?: string, date?: string, formId?: string) {
    return this.buildPath({
      projectCode,
      appointmentId,
      date,
      page: this.page,
      formId,
    })
  }

  isSingleAppointment = (appointmentOrSession: AppointmentOrSession) => 'deliusEventNumber' in appointmentOrSession

  protected backPath({
    projectCode,
    appointmentId,
    date,
    formId,
    originalSearch,
    project,
    form,
  }: PageRouteParams & {
    originalSearch?: Record<string, string>
    project?: ProjectDto
    form: AppointmentOutcomeForm
  }) {
    const isSingleAppointment = !!appointmentId
    const backPage = this.backPage(isSingleAppointment, form)

    if (!backPage) {
      return this.exitForm({ projectCode, date, project, originalSearch })
    }

    return this.buildPath({ projectCode, appointmentId, date, page: backPage, formId, originalSearch })
  }

  offenderHeading(offenderDto: OffenderDto): HeadingViewData {
    const offender = new Offender(offenderDto)
    return {
      title: offender.name,
      caption: offender.crn,
    }
  }

  sessionUpdateHeading(projectName: string, date: string): HeadingViewData {
    return {
      title: projectName,
      caption: 'Bulk update',
      description: `Date: ${DateTimeFormats.isoDateToUIDate(date)}`,
    }
  }

  paths({
    projectCode,
    appointmentId,
    date,
    formId,
    originalSearch,
    project,
    form,
  }: PageRouteParams & {
    originalSearch?: Record<string, string>
    project?: ProjectDto
    form: AppointmentOutcomeForm
  }) {
    return {
      backLink: this.backPath({
        projectCode,
        appointmentId,
        date,
        formId,
        originalSearch,
        project,
        form,
      }),
      updatePath: this.buildPath({
        projectCode,
        appointmentId,
        date,
        page: this.page,
        formId,
      }),
    }
  }

  selectedPeopleCard(session: SessionDto, form: UpdateSessionForm, formId: string) {
    if (this.page !== 'confirm-details') {
      return SessionUtils.selectedPeopleCard(session, form?.appointments ?? [], formId)
    }
    return undefined
  }

  protected pathWithFormId(path: string, formId?: string): string {
    return pathWithQuery(path, { form: formId })
  }

  private buildPath({
    projectCode,
    appointmentId,
    date,
    page,
    originalSearch,
    formId,
  }: PageRouteParams & {
    page: AppointmentFormPage
    originalSearch?: Record<string, string>
  }): string {
    if (appointmentId) {
      return pathWithQuery(
        this.pathWithFormId(
          paths.appointments.update({
            projectCode,
            appointmentId,
            page,
          }),
          formId,
        ),
        originalSearch,
      )
    }

    if (date) {
      return pathWithQuery(
        this.pathWithFormId(
          paths.sessions.update({
            projectCode,
            date,
            page,
          }),
          formId,
        ),
        originalSearch,
      )
    }

    throw new Error('Path must have an appointment ID or session date')
  }
}
