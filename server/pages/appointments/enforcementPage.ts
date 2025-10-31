import { AppointmentDto, EnforcementActionDto } from '../../@types/shared'
import {
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  ObjectWithDateParts,
  ValidationErrors,
} from '../../@types/user-defined'
import GovukFrontendDateInput, { GovUkFrontendDateInputItem } from '../../forms/GovukFrontendDateInput'
import paths from '../../paths'
import { Form } from '../../services/appointmentFormService'
import DateTimeFormats from '../../utils/dateTimeUtils'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'

interface EnforcementViewData extends AppointmentUpdatePageViewData {
  dateItems: GovUkFrontendDateInputItem[]
}

interface EnforcementQuery extends AppointmentUpdateQuery {
  'respondBy-day'?: string
  'respondBy-month'?: string
  'respondBy-year'?: string
}

interface Body {
  'respondBy-day'?: string
  'respondBy-month'?: string
  'respondBy-year'?: string
}

export default class EnforcementPage extends BaseAppointmentUpdatePage {
  static offenderManagerCode = 'ROM'

  validationErrors: ValidationErrors<Body> = {}

  hasErrors: boolean

  constructor(private readonly query: EnforcementQuery) {
    super(query)
  }

  form({ key, data }: Form, enforcementActions: EnforcementActionDto[]): AppointmentOutcomeForm {
    this.formId = key.id
    const date = this.query as ObjectWithDateParts<'respondBy'>

    const { respondBy } = DateTimeFormats.dateAndTimeInputsToIsoString(date, 'respondBy')

    return {
      ...data,
      enforcement: {
        action: this.enforcement(enforcementActions),
        respondBy,
      },
    }
  }

  viewData(appointment: AppointmentDto): EnforcementViewData {
    return {
      ...this.commonViewData(appointment),
      dateItems: this.dateItems(),
    }
  }

  validate() {
    const date = this.query as ObjectWithDateParts<'respondBy'>
    if (!GovukFrontendDateInput.dateIsComplete(date, 'respondBy')) {
      this.validationErrors['respondBy-day'] = { text: 'The date to respond by must include a day, month and year' }
    } else if (!GovukFrontendDateInput.dateIsValid(date, 'respondBy')) {
      this.validationErrors['respondBy-day'] = { text: 'The date to respond by must be a valid date' }
    }

    this.hasErrors = Object.keys(this.validationErrors).length > 0
  }

  protected nextPath(appointmentId: string): string {
    return paths.appointments.confirm({ appointmentId })
  }

  protected backPath(appointment: AppointmentDto): string {
    return paths.appointments.logCompliance({ appointmentId: appointment.id.toString() })
  }

  protected updatePath(appointment: AppointmentDto): string {
    return paths.appointments.enforcement({ appointmentId: appointment.id.toString() })
  }

  private dateItems() {
    const date = DateTimeFormats.getTodaysDatePlusDays(7)

    return GovukFrontendDateInput.getDateItemsFromStructuredDate(date, Boolean(this.validationErrors['respondBy-day']))
  }

  private enforcement(enforcementActions: EnforcementActionDto[]): EnforcementActionDto {
    return enforcementActions.find(enforcement => enforcement.code === EnforcementPage.offenderManagerCode)
  }
}
