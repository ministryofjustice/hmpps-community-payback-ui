import { CaseDetailsSummaryDto, ProjectTypeDto } from '../../@types/shared'
import { AppointmentOrSessionParams, ValidationErrors } from '../../@types/user-defined'
import MojDateInput from '../../forms/mojDateInput'
import paths from '../../paths'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import DateTimeFormats from '../../utils/dateTimeUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

interface ViewData {
  date: string
}

interface DateBody {
  date?: string
  endTime?: string
}

export default class DatePage extends BaseAppointmentUpdatePage<DateBody> {
  protected page: AppointmentFormPage = 'date'

  constructor() {
    super()
  }

  getForm(data: AppointmentOutcomeForm, body: DateBody = {}): AppointmentOutcomeForm {
    return {
      ...data,
      date: MojDateInput.toIsoDate(body.date),
    }
  }

  protected getValidationErrors(body: DateBody): ValidationErrors<DateBody> {
    const errors: ValidationErrors<DateBody> = {}

    const dateError = MojDateInput.validate(body.date)

    if (dateError) {
      errors.date = dateError
    }

    return errors
  }

  viewData(form: AppointmentOutcomeForm, body: DateBody = {}): ViewData {
    if (body.date !== undefined) {
      return { date: body.date }
    }

    if (form.date) {
      return { date: DateTimeFormats.isoDateToUIDate(form.date, { format: 'short' }) }
    }

    return { date: '' }
  }

  protected backPage(_pathData: AppointmentOrSessionParams): AppointmentFormPage {
    return undefined
  }

  protected nextPage(): AppointmentFormPage {
    return 'choose-supervisor'
  }

  getBackPath({
    projectCode,
    projectTypeGroup: projectType,
    formId,
    date,
    offenderSummary,
  }: {
    projectTypeGroup: ProjectTypeDto['group']
    formId: string
    offenderSummary?: CaseDetailsSummaryDto
  } & AppointmentOrSessionParams): string {
    if (!offenderSummary) {
      throw new Error('Back path not implemented for cases without a person selected')
    }

    const pathNamespace = projectType === 'INDIVIDUAL' ? 'projects' : 'sessions'

    if (offenderSummary.unpaidWorkDetails.length === 1) {
      const params = { projectCode, date }
      return this.pathWithFormId(paths[pathNamespace].create.findAPerson(params), formId)
    }

    const { crn } = offenderSummary.offender

    const params = { projectCode, date, crn }

    return this.pathWithFormId(paths[pathNamespace].create.requirement(params), formId)
  }
}
