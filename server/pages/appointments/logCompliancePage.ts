import { AppointmentDto, AttendanceDataDto } from '../../@types/shared'
import {
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  GovUkRadioOption,
  ValidationErrors,
  YesOrNo,
} from '../../@types/user-defined'
import paths from '../../paths'
import GovUkRadioGroup from '../../forms/GovUkRadioGroup'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'

interface ViewData extends AppointmentUpdatePageViewData {
  hiVisItems: GovUkRadioOption[]
  workedIntensivelyItems: GovUkRadioOption[]
  workQualityItems: GovUkRadioOption[]
  behaviourItems: GovUkRadioOption[]
  notes?: string
}

interface Body {
  hiVis: YesOrNo
  workedIntensively: YesOrNo
  workQuality: NonNullable<AttendanceDataDto['workQuality']>
  behaviour: NonNullable<AttendanceDataDto['behaviour']>
  notes?: string
}

export interface LogComplianceQuery extends AppointmentUpdateQuery {
  hiVis?: YesOrNo
  workedIntensively?: YesOrNo
  workQuality?: AttendanceDataDto['workQuality']
  behaviour?: AttendanceDataDto['behaviour']
  notes?: string
}

export default class LogCompliancePage extends BaseAppointmentUpdatePage {
  hasError: boolean

  validationErrors: ValidationErrors<Body> = {}

  constructor(private readonly query: LogComplianceQuery) {
    super(query)
  }

  getForm(data: AppointmentOutcomeForm): AppointmentOutcomeForm {
    return {
      ...data,
      notes: this.query.notes,
      attendanceData: {
        ...data.attendanceData,
        hiVisWorn: GovUkRadioGroup.valueFromYesOrNoItem(this.query.hiVis),
        workedIntensively: GovUkRadioGroup.valueFromYesOrNoItem(this.query.workedIntensively),
        workQuality: this.query.workQuality,
        behaviour: this.query.behaviour,
      },
    }
  }

  viewData(appointment: AppointmentDto, form: AppointmentOutcomeForm): ViewData {
    const formValues = this.getFormDisplayValues(form)
    return {
      ...this.commonViewData(appointment),
      hiVisItems: GovUkRadioGroup.yesNoItems({
        checkedValue: formValues.hiVis,
      }),
      workedIntensivelyItems: GovUkRadioGroup.yesNoItems({
        checkedValue: formValues.workedIntensively,
      }),
      workQualityItems: this.getItems(formValues.workQuality),
      behaviourItems: this.getItems(formValues.behaviour),
      notes: formValues.notes,
    }
  }

  validate() {
    if (!this.query.hiVis) {
      this.validationErrors.hiVis = { text: 'Select whether a Hi-Vis was worn' }
    }

    if (!this.query.workedIntensively) {
      this.validationErrors.workedIntensively = { text: 'Select whether they worked intensively' }
    }

    if (!this.query.workQuality) {
      this.validationErrors.workQuality = { text: 'Select their work quality' }
    }

    if (!this.query.behaviour) {
      this.validationErrors.behaviour = { text: 'Select their behaviour' }
    }

    this.hasError = Object.keys(this.validationErrors).length > 0
  }

  protected backPath(appointment: AppointmentDto): string {
    return paths.appointments.logHours({
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
    })
  }

  protected nextPath(projectCode: string, appointmentId: string): string {
    return paths.appointments.confirm({ projectCode, appointmentId })
  }

  protected updatePath(appointment: AppointmentDto): string {
    return paths.appointments.logCompliance({
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
    })
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
      hiVis: GovUkRadioGroup.determineCheckedValue(form.attendanceData?.hiVisWorn),
      workedIntensively: GovUkRadioGroup.determineCheckedValue(form.attendanceData?.workedIntensively),
      workQuality: form.attendanceData?.workQuality,
      behaviour: form.attendanceData?.behaviour,
      notes: form.notes,
    }
  }
}
