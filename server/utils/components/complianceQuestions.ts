import { AttendanceDataDto, UpdateAppointmentDto } from '../../@types/shared'
import { GovUkRadioOrCheckboxOption, ValidationErrors } from '../../@types/user-defined'
import AppointmentUtils from '../appointmentUtils'

export type ComplianceQuestionsBody = {
  workQuality?: NonNullable<AttendanceDataDto['workQuality']>
  behaviour?: NonNullable<AttendanceDataDto['behaviour']>
}

export type ComplianceQuestionsViewData = {
  workQualityItems: GovUkRadioOrCheckboxOption[]
  behaviourItems: GovUkRadioOrCheckboxOption[]
}

export default class ComplianceQuestions {
  static getAnswerSummary(form: Pick<UpdateAppointmentDto, 'attendanceData'>): string {
    let answers = ''

    if (form.attendanceData?.workQuality) {
      answers += `Work quality - ${AppointmentUtils.formatComplianceRatings(form.attendanceData.workQuality)}<br>`
    }

    if (form.attendanceData?.behaviour) {
      answers += `Behaviour - ${AppointmentUtils.formatComplianceRatings(form.attendanceData.behaviour)}`
    }

    return answers
  }

  static updateFormData<T extends Pick<UpdateAppointmentDto, 'attendanceData'>>(
    data: T,
    body: ComplianceQuestionsBody = {},
  ): T {
    return {
      ...data,

      attendanceData: {
        ...data.attendanceData,
        workQuality: body.workQuality,
        behaviour: body.behaviour,
      },
    }
  }

  static validate(body: ComplianceQuestionsBody): ValidationErrors<ComplianceQuestionsBody> {
    const errors: ValidationErrors<ComplianceQuestionsBody> = {}

    if (!body.workQuality) {
      errors.workQuality = { text: 'Select their work quality' }
    }

    if (!body.behaviour) {
      errors.behaviour = { text: 'Select their behaviour' }
    }

    return errors
  }

  static viewData(
    form: Pick<UpdateAppointmentDto, 'attendanceData'>,
    query: ComplianceQuestionsBody = {},
  ): ComplianceQuestionsViewData {
    const formValues = this.getFormDisplayValues(form, query)
    return {
      workQualityItems: this.getItems(formValues.workQuality),
      behaviourItems: this.getItems(formValues.behaviour),
    }
  }

  private static getItems(checkedValue?: string) {
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

  private static getFormDisplayValues(
    form: Pick<UpdateAppointmentDto, 'attendanceData'>,
    body?: ComplianceQuestionsBody,
  ): ComplianceQuestionsBody {
    return {
      workQuality: body?.workQuality ?? form.attendanceData?.workQuality,
      behaviour: body?.behaviour ?? form.attendanceData?.behaviour,
    }
  }
}
