import { OffenderDto, ProjectDto } from '../../@types/shared'
import { AppointmentOrSession, AppointmentOutcomeForm } from '../../@types/user-defined'
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

export default abstract class BaseAppointmentUpdatePage<TBody, TContext = unknown> extends PageWithValidation<
  TBody,
  TContext
> {
  protected abstract page: AppointmentFormPage

  protected abstract nextPage(form: AppointmentOutcomeForm): AppointmentFormPage | undefined

  protected abstract backPage(
    appointmentOrSession: AppointmentOrSession,
    form?: AppointmentOutcomeForm,
  ): AppointmentFormPage | undefined

  protected abstract getForm(form: AppointmentOutcomeForm, query: TBody, context: TContext): AppointmentOutcomeForm

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

  updatePath(appointmentOrSession: AppointmentOrSession, formId?: string) {
    return this.buildPath(appointmentOrSession, this.page, undefined, formId)
  }

  isSingleAppointment = (appointmentOrSession: AppointmentOrSession) => 'deliusEventNumber' in appointmentOrSession

  protected backPath(
    appointmentOrSession: AppointmentOrSession,
    formId: string,
    originalSearch?: Record<string, string>,
    project?: ProjectDto,
    form?: AppointmentOutcomeForm,
  ) {
    const backPage = this.backPage(appointmentOrSession, form)

    if (!backPage) {
      return this.exitForm(appointmentOrSession, project, originalSearch)
    }

    return this.buildPath(appointmentOrSession, backPage, originalSearch, formId)
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

  paths(
    appointmentOrSession: AppointmentOrSession,
    formId: string,
    originalSearch?: Record<string, string>,
    project?: ProjectDto,
    form?: AppointmentOutcomeForm,
  ) {
    return {
      backLink: this.backPath(appointmentOrSession, formId, originalSearch, project, form),
      updatePath: this.updatePath(appointmentOrSession, formId),
    }
  }

  selectedPeopleCard(appointmentOrSession: AppointmentOrSession, form: AppointmentOutcomeForm, formId: string) {
    if (this.page !== 'confirm-details' && !this.isSingleAppointment(appointmentOrSession)) {
      return SessionUtils.selectedPeopleCard(appointmentOrSession, form?.appointments ?? [], formId)
    }
    return undefined
  }

  protected pathWithFormId(path: string, formId?: string): string {
    return pathWithQuery(path, { form: formId })
  }

  private buildPath(
    appointmentOrSession: AppointmentOrSession,
    page: AppointmentFormPage,
    originalSearch?: Record<string, string>,
    formId?: string,
  ): string {
    if (this.isSingleAppointment(appointmentOrSession)) {
      return pathWithQuery(
        this.pathWithFormId(
          paths.appointments.update({
            projectCode: appointmentOrSession.projectCode,
            appointmentId: appointmentOrSession.id.toString(),
            page,
          }),
          formId,
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
        formId,
      ),
      originalSearch,
    )
  }
}
