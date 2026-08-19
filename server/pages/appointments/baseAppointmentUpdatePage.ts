import { OffenderDto, ProjectTypeDto } from '../../@types/shared'
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
import { AppointmentPage, NEW_APPOINTMENT_ID } from './pathMap'
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
  protected abstract page: AppointmentPage

  protected abstract nextPage(form?: AppointmentOutcomeForm): AppointmentPage | undefined

  protected abstract backPage(
    pathData: AppointmentOrSessionParams,
    form?: AppointmentOutcomeForm,
  ): AppointmentPage | undefined

  protected abstract getForm(form: AppointmentOutcomeForm, query: TBody, context: TContext): AppointmentOutcomeForm

  exitForm(
    pathData: AppointmentOrSessionParams,
    projectTypeGroup?: ProjectTypeDto['group'],
    originalSearch?: Record<string, string>,
  ): string {
    if (projectTypeGroup === 'GROUP') {
      return SessionUtils.getSessionPath(pathData, originalSearch)
    }
    return pathWithQuery(paths.projects.show({ projectCode: pathData.projectCode }), originalSearch)
  }

  next({
    pathData,
    formId,
    form,
  }: {
    pathData: AppointmentOrSessionParams
    formId?: string
    form?: AppointmentOutcomeForm
  }) {
    const nextPage = this.nextPage(form)

    if (!nextPage) {
      throw new Error('No next page configured')
    }

    return this.buildPath(pathData, nextPage, formId)
  }

  updateForm(form: AppointmentOutcomeForm, query: TBody, context: TContext): AppointmentOutcomeForm {
    return this.getForm(form, query, context)
  }

  updatePath(pathData: AppointmentOrSessionParams, formId?: string) {
    return this.buildPath(pathData, this.page, formId)
  }

  protected backPath(
    pathData: AppointmentOrSessionParams,
    originalSearch?: Record<string, string>,
    formId?: string,
    form?: AppointmentOutcomeForm,
  ) {
    const backPage = this.backPage(pathData, form)

    if (!backPage) {
      return undefined
    }

    return this.buildPath(pathData, backPage, formId, originalSearch)
  }

  commonViewData({
    appointmentOrSession,
    originalSearch,
    form,
    formId,
    pathData,
  }: {
    appointmentOrSession: AppointmentOrSession
    originalSearch?: Record<string, string>
    form: AppointmentOutcomeForm
    formId?: string
    pathData: PathData
  }): AppointmentUpdateViewData {
    const viewData: AppointmentUpdateViewData = {
      ...this.paths({ pathData, originalSearch, form, formId }),
      heading: this.buildHeading(appointmentOrSession),
    }

    const { session } = appointmentOrSession
    if (session && this.page !== 'confirm-details') {
      viewData.selectedPeopleCard = SessionUtils.selectedPeopleCard(
        pathData,
        session.appointmentSummaries,
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
  }: {
    pathData: AppointmentOrSessionParams
    form: AppointmentOutcomeForm
    originalSearch?: Record<string, string>
    formId?: string
  }): AppointmentUpdatePagePathData {
    return {
      backLink: this.backPath(pathData, originalSearch, formId, form),
      updatePath: this.updatePath(pathData, formId),
      form: formId,
    }
  }

  private buildHeading({ appointment, session }: AppointmentOrSession) {
    if (appointment) {
      return this.offenderHeading(appointment.offender)
    }
    return {
      title: session.projectName,
      caption: 'Bulk update',
      description: `Date: ${DateTimeFormats.isoDateToUIDate(session.date)}`,
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
    page: AppointmentPage,
    formId?: string,
    originalSearch?: Record<string, string>,
  ): string {
    if (pathData.appointmentId === NEW_APPOINTMENT_ID) {
      return this.pathWithFormId(paths.appointments.create({ projectCode: pathData.projectCode, page }), formId)
    }
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

    if (pathData.date) {
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

    throw new Error('Path must have an appointment ID or session date')
  }
}
