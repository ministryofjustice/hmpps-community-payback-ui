import { CaseDetailsSummaryDto, ProjectTypeDto } from '../../@types/shared'
import { AppointmentOrSessionParams, ValidationErrors } from '../../@types/user-defined'
import MojDateInput from '../../forms/mojDateInput'
import paths from '../../paths'
import { AppointmentOutcomeForm, CreateAppointmentForm } from '../../services/forms/appointmentFormService'
import DateTimeFormats from '../../utils/dateTimeUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'
import { ViewAppointmentsPage } from './viewAppointmentsPage'

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

  protected nextPage(form?: AppointmentOutcomeForm): AppointmentFormPage {
    if (form?.options?.showRegionQuestion) {
      return 'region'
    }

    return 'choose-supervisor'
  }

  getBackPath({
    projectTypeGroup,
    formId,
    offenderSummary,
    form: {
      crn: selectedCrn,
      options,
      originalParams: { projectCode, date, crn, deliusEventNumber },
    },
  }: {
    projectTypeGroup: ProjectTypeDto['group']
    formId: string
    offenderSummary?: CaseDetailsSummaryDto
    form: CreateAppointmentForm
  }) {
    if (options?.showPersonQuestions) {
      if (!offenderSummary) {
        throw new Error('Back path not implemented for cases without a person selected')
      }
      const pathNamespace = projectTypeGroup === 'INDIVIDUAL' ? 'projects' : 'sessions'

      if (offenderSummary.unpaidWorkDetails.length === 1) {
        const params = { projectCode, date }
        return this.pathWithFormId(paths[pathNamespace].create.findAPerson(params), formId)
      }

      const params = { projectCode, date, crn: selectedCrn }

      return this.pathWithFormId(paths[pathNamespace].create.requirement(params), formId)
    }

    if (!crn || !deliusEventNumber) {
      throw new Error('Path requires a crn and deliusEventNumber when navigating back to a person')
    }

    const params = { crn, deliusEventNumber, appointmentSection: ViewAppointmentsPage.defaultSection }
    return paths.people.appointments(params)
  }
}
