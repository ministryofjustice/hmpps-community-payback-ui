import { AttendanceDataDto } from '../../@types/shared'
import {
  AppointmentOrSessionParams,
  AppointmentOutcomeForm,
  AppointmentUpdateQuery,
  GovUkRadioOrCheckboxOption,
  ValidationErrors,
} from '../../@types/user-defined'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentFormPage } from './pathMap'

interface ViewData {
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

export default class LogCompliancePage extends BaseAppointmentUpdatePage<Body> {
  protected page: AppointmentFormPage = 'log-compliance'

  getForm(data: AppointmentOutcomeForm, query: LogComplianceQuery = {}): AppointmentOutcomeForm {
    return {
      ...data,

      attendanceData: {
        ...data.attendanceData,
        workQuality: query.workQuality,
        behaviour: query.behaviour,
      },
    }
  }

  viewData(form: AppointmentOutcomeForm, query: LogComplianceQuery = {}): ViewData {
    const formValues = this.getFormDisplayValues(form, query)
    return {
      workQualityItems: this.getItems(formValues.workQuality),
      behaviourItems: this.getItems(formValues.behaviour),
    }
  }

  protected getValidationErrors(body: Body): ValidationErrors<Body> {
    const errors: ValidationErrors<Body> = {}

    if (!body.workQuality) {
      errors.workQuality = { text: 'Select their work quality' }
    }

    if (!body.behaviour) {
      errors.behaviour = { text: 'Select their behaviour' }
    }

    return errors
  }

  protected backPage(_params: AppointmentOrSessionParams): AppointmentFormPage {
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
    return {
      workQuality: query?.workQuality ?? form.attendanceData?.workQuality,
      behaviour: query?.behaviour ?? form.attendanceData?.behaviour,
    }
  }
}
