import { AttendanceDataDto } from '../../@types/shared'
import {
  AppointmentOrSession,
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  GovUkRadioOrCheckboxOption,
  ValidationErrors,
} from '../../@types/user-defined'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

interface ViewData extends AppointmentUpdatePageViewData {
  workQualityItems: GovUkRadioOrCheckboxOption[]
  behaviourItems: GovUkRadioOrCheckboxOption[]
}

interface Body {
  workQuality: NonNullable<AttendanceDataDto['workQuality']>
  behaviour: NonNullable<AttendanceDataDto['behaviour']>
}

export interface LogComplianceQuery extends AppointmentUpdateQuery {
  workQuality?: AttendanceDataDto['workQuality']
  behaviour?: AttendanceDataDto['behaviour']
}

export default class LogCompliancePage extends BaseAppointmentUpdatePage {
  protected page: AppointmentFormPage = 'log-compliance'

  hasError: boolean

  validationErrors: ValidationErrors<Body> = {}

  getForm(data: AppointmentOutcomeForm, query: LogComplianceQuery): AppointmentOutcomeForm {
    return {
      ...data,

      attendanceData: {
        ...data.attendanceData,
        workQuality: query.workQuality,
        behaviour: query.behaviour,
      },
    }
  }

  viewData(
    appointmentOrSession: AppointmentOrSession,
    form: AppointmentOutcomeForm,
    formId?: string,
    query?: LogComplianceQuery,
  ): ViewData {
    const formValues = this.getFormDisplayValues(form, query)
    return {
      ...this.commonViewData({ appointmentOrSession, form, formId }),
      workQualityItems: this.getItems(formValues.workQuality),
      behaviourItems: this.getItems(formValues.behaviour),
    }
  }

  validate(query: LogComplianceQuery) {
    if (!query.workQuality) {
      this.validationErrors.workQuality = { text: 'Select their work quality' }
    }

    if (!query.behaviour) {
      this.validationErrors.behaviour = { text: 'Select their behaviour' }
    }

    this.hasError = Object.keys(this.validationErrors).length > 0
  }

  protected backPage(_appointmentOrSession: AppointmentOrSession): AppointmentFormPage {
    return 'log-hours'
  }

  protected nextPage(): AppointmentFormPage {
    return 'confirm-details'
  }

  private getItems(checkedValue?: string) {
    const options = [
      { text: 'Excellent', value: 'EXCELLENT' },
      { text: 'Good', value: 'GOOD' },
      { text: 'Satisfactory', value: 'SATISFACTORY' },
      { text: 'Unsatisfactory', value: 'UNSATISFACTORY' },
      { text: 'Poor', value: 'POOR' },
      { text: 'Not applicable', value: 'NOT_APPLICABLE' },
    ]

    return options.map(option => ({
      ...option,
      checked: option.value === checkedValue,
    }))
  }

  private getFormDisplayValues(form: AppointmentOutcomeForm, query?: LogComplianceQuery): LogComplianceQuery {
    if (this.hasError && query) {
      return query
    }

    return {
      workQuality: form.attendanceData?.workQuality,
      behaviour: form.attendanceData?.behaviour,
    }
  }
}
