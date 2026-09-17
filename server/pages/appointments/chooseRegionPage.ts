import { AppointmentOrSessionParams, ValidationErrors } from '../../@types/user-defined'
import { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import RegionQuestion, { RegionQuestionViewData } from '../../utils/components/regionQuestion'
import BaseAppointmentUpdatePage from './baseAppointmentUpdatePage'
import { AppointmentPage } from './pathMap'

type Query = {
  provider: string
}

export default class ChooseRegionPage extends BaseAppointmentUpdatePage<Query, RegionQuestionViewData> {
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

  protected getForm(
    form: AppointmentOutcomeForm,
    query: Query,
    viewData: RegionQuestionViewData,
  ): AppointmentOutcomeForm {
    return RegionQuestion.updateFormData(form, query, viewData)
  }

  protected getValidationErrors(query: Query, _additionalParams?: unknown): ValidationErrors<Query> {
    return RegionQuestion.validate(query)
  }
}
