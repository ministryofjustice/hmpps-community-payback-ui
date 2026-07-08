import { OffenderDto, ProjectDto } from '../../@types/shared'
import {
  AppointmentOrSession,
  AppointmentOrSessionParams,
  AppointmentUpdatePagePathData,
  GovUkSummaryList,
  PageHeader,
} from '../../@types/user-defined'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import Offender from '../../models/offender'
import paths from '../../paths'
import SessionUtils from '../../utils/sessionUtils'
import { pathWithQuery } from '../../utils/utils'
import { AppointmentFormPage } from './pathMap'
import PageWithValidation from '../pageWithValidation'
import DateTimeFormats from '../../utils/dateTimeUtils'

type AppointmentUpdateViewData = AppointmentUpdatePagePathData & {
  selectedPeopleCard?: GovUkSummaryList
  heading: PageHeader
}

type PathData = {
  projectCode: string
  date: string
  appointmentId?: string
}

export default abstract class BaseAppointmentUpdatePage<TBody = unknown, TContext = unknown> extends PageWithValidation<
  TBody,
  TContext
> {
  protected abstract page: AppointmentFormPage

  protected abstract nextPage(form?: AppointmentOutcomeForm): AppointmentFormPage | undefined

  protected abstract backPage(
    pathData: AppointmentOrSessionParams,
    form?: AppointmentOutcomeForm,
  ): AppointmentFormPage | undefined

  protected abstract getForm(form: AppointmentOutcomeForm, query: TBody, context: TContext): AppointmentOutcomeForm

  exitForm(
    pathData: AppointmentOrSessionParams,
    project?: ProjectDto,
    originalSearch?: Record<string, string>,
  ): string {
    if (project?.projectType.group === 'GROUP') {
      return SessionUtils.getSessionPath(pathData, originalSearch)
    }
    return pathWithQuery(paths.projects.show({ projectCode: pathData.projectCode }), originalSearch)
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
    form?: AppointmentOutcomeForm
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

  updateForm(form: AppointmentOutcomeForm, query: TBody, context: TContext): AppointmentOutcomeForm {
    return this.getForm(form, query, context)
  }

  updatePath(pathData: AppointmentOrSessionParams, formId?: string) {
    return this.buildPath(pathData, this.page, formId)
  }

  protected isSingleAppointment = (appointmentOrSession: AppointmentOrSession) =>
    'deliusEventNumber' in appointmentOrSession

  protected backPath(
    pathData: AppointmentOrSessionParams,
    originalSearch?: Record<string, string>,
    project?: ProjectDto,
    formId?: string,
    form?: AppointmentOutcomeForm,
  ) {
    const backPage = this.backPage(pathData, form)

    if (!backPage) {
      return this.exitForm(pathData, project, originalSearch)
    }

    return this.buildPath(pathData, backPage, formId, originalSearch)
  }

  commonViewData({
    appointmentOrSession,
    originalSearch,
    project,
    form,
    formId,
    pathData,
  }: {
    appointmentOrSession: AppointmentOrSession
    originalSearch?: Record<string, string>
    project?: ProjectDto
    form: AppointmentOutcomeForm
    formId?: string
    pathData: PathData
  }): AppointmentUpdateViewData {
    const viewData: AppointmentUpdateViewData = {
      ...this.paths({ pathData, originalSearch, form, formId, project }),
      heading: this.buildHeading(appointmentOrSession),
    }

    if (this.page !== 'confirm-details' && !this.isSingleAppointment(appointmentOrSession)) {
      viewData.selectedPeopleCard = SessionUtils.selectedPeopleCard(
        appointmentOrSession,
        form.appointments ?? [],
        formId,
      )
    }

    return viewData
  }

  paths({
    pathData,
    originalSearch,
    form,
    formId,
    project,
  }: {
    pathData: AppointmentOrSessionParams
    form: AppointmentOutcomeForm
    originalSearch?: Record<string, string>
    formId?: string
    project?: ProjectDto
  }): AppointmentUpdatePagePathData {
    return {
      backLink: this.backPath(pathData, originalSearch, project, formId, form),
      updatePath: this.updatePath(pathData, formId),
      form: formId,
    }
  }

  private buildHeading(appointmentOrSession: AppointmentOrSession) {
    if ('offender' in appointmentOrSession) {
      return this.offenderHeading(appointmentOrSession.offender)
    }
    return {
      title: appointmentOrSession.projectName,
      caption: 'Bulk update',
      description: `Date: ${DateTimeFormats.isoDateToUIDate(appointmentOrSession.date)}`,
    }
  }

  offenderHeading(offenderDto: OffenderDto) {
    const offender = new Offender(offenderDto)
    return {
      title: offender.name,
      caption: offender.crn,
    }
  }

  protected pathWithFormId(path: string, formId?: string): string {
    return pathWithQuery(path, { form: formId })
  }

  protected buildPath(
    pathData: AppointmentOrSessionParams,
    page: AppointmentFormPage,
    formId?: string,
    originalSearch?: Record<string, string>,
  ): string {
    if (pathData.appointmentId) {
      return pathWithQuery(
        this.pathWithFormId(
          paths.appointments.update({
            projectCode: pathData.projectCode,
            appointmentId: pathData.appointmentId,
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
          projectCode: pathData.projectCode,
          date: pathData.date,
          page,
        }),
        formId,
      ),
      originalSearch,
    )
  }
}
