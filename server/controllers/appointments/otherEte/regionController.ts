import type { Request, Response } from 'express'
import { OtherEteFormPage } from '../../../pages/appointments/otherEte/pathMap'
import AppointmentFormService, { CreateAppointmentForm } from '../../../services/forms/appointmentFormService'
import OffenderService from '../../../services/offenderService'
import ProviderService from '../../../services/providerService'
import RegionQuestion, { RegionQuestionBody, RegionQuestionViewData } from '../../../utils/components/regionQuestion'
import { ValidationErrors } from '../../../@types/user-defined'
import BaseOtherEteController, { OtherEteStepViewDataParams } from './baseOtherEteController'

export default class RegionController extends BaseOtherEteController<RegionQuestionBody, RegionQuestionViewData> {
  protected pageName: OtherEteFormPage = 'region'

  protected templatePath = 'appointments/update/chooseRegion'

  constructor(
    formService: AppointmentFormService,
    offenderService: OffenderService,
    private readonly providerService: ProviderService,
  ) {
    super(formService, offenderService)
  }

  protected nextPage(): OtherEteFormPage {
    return 'project'
  }

  // No back page configured: the base controller falls back to the choose-appointment-type page
  protected backPage(): OtherEteFormPage | undefined {
    return undefined
  }

  protected async getContextData({ res }: { req: Request; res: Response }): Promise<RegionQuestionViewData> {
    const providers = await this.providerService.getProviders(res.locals.user.username)
    return { providers }
  }

  protected validate(query: RegionQuestionBody): ValidationErrors<RegionQuestionBody> {
    return RegionQuestion.validate(query)
  }

  protected async getStepViewData({
    req,
    form,
    contextData,
  }: OtherEteStepViewDataParams<RegionQuestionViewData>): Promise<object> {
    return RegionQuestion.viewData(form, contextData, req.body as RegionQuestionBody)
  }

  protected updateForm(
    form: CreateAppointmentForm,
    body: RegionQuestionBody,
    contextData: RegionQuestionViewData,
  ): CreateAppointmentForm {
    return RegionQuestion.updateFormData(form, body, contextData)
  }
}
