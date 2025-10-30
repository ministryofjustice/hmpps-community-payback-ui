import { AppointmentDto, EnforcementActionDto } from '../../@types/shared'
import {
  AppointmentOutcomeForm,
  AppointmentUpdatePageViewData,
  AppointmentUpdateQuery,
  GovUkSelectOption,
  ValidationErrors,
} from '../../@types/user-defined'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import paths from '../../paths'
import { Form } from '../../services/appointmentFormService'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'

interface EnforcementViewData extends AppointmentUpdatePageViewData {
  enforcementItems: GovUkSelectOption[]
}

interface EnforcementQuery extends AppointmentUpdateQuery {
  enforcement?: string
}

interface Body {
  enforcement: string
}

export default class EnforcementPage extends BaseAppointmentUpdatePage {
  validationErrors: ValidationErrors<Body> = {}

  hasErrors: boolean

  constructor(private readonly query: EnforcementQuery) {
    super(query)
  }

  form({ key, data }: Form, enforcementActions: EnforcementActionDto[]): AppointmentOutcomeForm {
    this.formId = key.id

    const enforcement = enforcementActions.find(action => action.id === this.query.enforcement)

    return {
      ...data,
      enforcement,
    }
  }

  viewData(appointment: AppointmentDto, enforcementActions: EnforcementActionDto[]): EnforcementViewData {
    return {
      ...this.commonViewData(appointment),
      enforcementItems: this.enforcementItems(enforcementActions, appointment),
    }
  }

  validate() {
    if (!this.query.enforcement) {
      this.validationErrors.enforcement = { text: 'Select an enforcement action' }
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

  private enforcementItems(enforcementActions: EnforcementActionDto[], appointment: AppointmentDto) {
    return GovUkSelectInput.getOptions(
      enforcementActions,
      'name',
      'id',
      'Choose enforcement action',
      appointment.enforcementData?.enforcementActionId,
    )
  }
}
