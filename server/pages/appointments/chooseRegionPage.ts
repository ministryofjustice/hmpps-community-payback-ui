import { ProviderSummaryDto } from '../../@types/shared'
import { AppointmentOrSessionParams, ValidationErrors } from '../../@types/user-defined'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentPage } from './pathMap'

type Query = {
  provider: string
}

type PageData = {
  providers: Array<ProviderSummaryDto>
}

export default class ChooseRegionPage extends BaseAppointmentUpdatePage<Query, PageData> {
  protected page: AppointmentPage = 'region'

  protected nextPage(_form?: AppointmentOutcomeForm): AppointmentPage | undefined {
    return 'choose-supervisor'
  }

  protected backPage(
    _pathData: AppointmentOrSessionParams,
    _form?: AppointmentOutcomeForm,
  ): AppointmentPage | undefined {
    return 'date'
  }

  protected getForm(form: AppointmentOutcomeForm, query: Query, { providers }: PageData): AppointmentOutcomeForm {
    if (query.provider === form.provider?.code) {
      return form
    }

    const selected = providers.find(provider => provider.code === query.provider)

    if (!selected) {
      throw new Error(`Provider with code ${query.provider} not found`)
    }

    return {
      ...form,
      provider: selected,
      // the provider has changed, so the teams will be different and will need to be re-selected
      supervisingTeam: undefined,
      supervisor: undefined,
      projectTeam: undefined,
      project: undefined,
    }
  }

  protected getValidationErrors(query: Query, _additionalParams?: unknown): ValidationErrors<Query> {
    if (!query.provider) {
      return {
        provider: { text: 'Choose a region' },
      }
    }
    return {}
  }
}
