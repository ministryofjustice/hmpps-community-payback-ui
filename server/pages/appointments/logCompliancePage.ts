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

  viewData(appointment: AppointmentDto): ViewData {
    return {
      ...this.commonViewData(appointment),
      hiVisItems: GovUkRadioGroup.yesNoItems({
        checkedValue: appointment.attendanceData?.hiVisWorn,
      }),
      workedIntensivelyItems: GovUkRadioGroup.yesNoItems({
        checkedValue: appointment.attendanceData?.workedIntensively,
      }),
      workQualityItems: this.getItems(appointment.attendanceData?.workQuality),
      behaviourItems: this.getItems(appointment.attendanceData?.behaviour),
      notes: appointment.notes,
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
    if (this.form.contactOutcome && this.form.contactOutcome.enforceable) {
      return paths.appointments.enforcement({ projectCode, appointmentId })
    }

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
}
