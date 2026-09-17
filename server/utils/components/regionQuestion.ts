import { ProviderSummaryDto, ProviderTeamSummaryDto, SupervisorSummaryDto } from '../../@types/shared'
import { GovUkSelectOption, ValidationErrors } from '../../@types/user-defined'
import GovUkSelectInput from '../../forms/GovUkSelectInput'

export type RegionQuestionBody = {
  provider: string
}

export type RegionQuestionViewData = {
  providers: Array<ProviderSummaryDto>
}

export type RegionQuestionStepViewData = {
  providerItems: Array<GovUkSelectOption>
}

type RegionQuestionForm = {
  provider?: ProviderSummaryDto
  supervisingTeam?: ProviderTeamSummaryDto
  supervisor?: SupervisorSummaryDto
  projectTeam?: ProviderTeamSummaryDto
  project?: ProviderTeamSummaryDto
}

export default class RegionQuestion {
  static validate(query: RegionQuestionBody): ValidationErrors<RegionQuestionBody> {
    if (!query.provider) {
      return {
        provider: { text: 'Choose a region' },
      }
    }
    return {}
  }

  static viewData(
    form: Pick<RegionQuestionForm, 'provider'>,
    { providers }: RegionQuestionViewData,
    query: Partial<RegionQuestionBody> = {},
  ): RegionQuestionStepViewData {
    const selectedProvider = query.provider ?? form.provider?.code

    return {
      providerItems: GovUkSelectInput.getOptions(providers, 'name', 'code', 'Choose region', selectedProvider),
    }
  }

  static updateFormData<T extends RegionQuestionForm>(
    form: T,
    query: RegionQuestionBody,
    { providers }: RegionQuestionViewData,
  ): T {
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
}
