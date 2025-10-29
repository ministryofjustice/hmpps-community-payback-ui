import { AppointmentDto, AttendanceDataDto, FormKeyDto } from '../../@types/shared'
import {
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  GovUkRadioOption,
  ValidationErrors,
  YesNoOrNotApplicable,
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
  hiVis: YesNoOrNotApplicable
  workedIntensively: YesOrNo
  workQuality: NonNullable<AttendanceDataDto['workQuality']>
  behaviour: NonNullable<AttendanceDataDto['behaviour']>
  notes?: string
}

export interface LogComplianceQuery extends AppointmentUpdateQuery {
  hiVis?: YesNoOrNotApplicable
  workedIntensively?: YesOrNo
  workQuality?: AttendanceDataDto['workQuality']
  behaviour?: AttendanceDataDto['behaviour']
  notes?: string
}

export default class LogCompliancePage extends BaseAppointmentUpdatePage {
  hasError: boolean

  validationErrors: ValidationErrors<Body> = {}

  form: AppointmentOutcomeForm = {}

  constructor(private readonly query: LogComplianceQuery) {
    super(query)
  }

  updateForm({ data, key }: { data: AppointmentOutcomeForm; key: FormKeyDto }): AppointmentOutcomeForm {
    this.formId = key.id

    this.form = {
      ...data,
      notes: this.query.notes,
      attendanceData: {
        ...data.attendanceData,
        hiVisWorn: GovUkRadioGroup.valueFromYesNoOrNotApplicableItem(this.query.hiVis),
        workedIntensively: GovUkRadioGroup.valueFromYesOrNoItem(this.query.workedIntensively),
        workQuality: this.query.workQuality,
        behaviour: this.query.behaviour,
      },
    }

    return this.form
  }

  viewData(appointment: AppointmentDto): ViewData {
    return {
      ...this.commonViewData(appointment),
      hiVisItems: GovUkRadioGroup.yesNoItems({
        includeNotApplicable: true,
        checkedValue: appointment.attendanceData?.hiVisWorn,
      }),
      workedIntensivelyItems: GovUkRadioGroup.yesNoItems({
        includeNotApplicable: false,
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
    return paths.appointments.logHours({ appointmentId: appointment.id.toString() })
  }

  protected nextPath(appointmentId: string): string {
    return paths.appointments.confirm({ appointmentId })
  }

  protected updatePath(appointment: AppointmentDto): string {
    return paths.appointments.logCompliance({ appointmentId: appointment.id.toString() })
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
