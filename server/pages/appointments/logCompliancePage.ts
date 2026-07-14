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

  constructor(private readonly query: LogComplianceQuery) {
    super()
  }

  getForm(data: AppointmentOutcomeForm): AppointmentOutcomeForm {
    return {
      ...data,

      attendanceData: {
        ...data.attendanceData,
        workQuality: this.query.workQuality,
        behaviour: this.query.behaviour,
      },
    }
  }

  viewData(appointmentOrSession: AppointmentOrSession, form: AppointmentOutcomeForm, formId?: string): ViewData {
    const formValues = this.getFormDisplayValues(form)
    return {
      ...this.commonViewData({ appointmentOrSession, form, formId }),
      workQualityItems: this.getItems(formValues.workQuality),
      behaviourItems: this.getItems(formValues.behaviour),
    }
  }

  validate() {
    if (!this.query.workQuality) {
      this.validationErrors.workQuality = { text: 'Select their work quality' }
    }

    if (!this.query.behaviour) {
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

  private getFormDisplayValues(form: AppointmentOutcomeForm): LogComplianceQuery {
    if (this.hasError) {
      return this.query
    }

    return {
      workQuality: form.attendanceData?.workQuality,
      behaviour: form.attendanceData?.behaviour,
    }
  }
}
