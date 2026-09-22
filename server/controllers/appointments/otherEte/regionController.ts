import type { Request, Response } from 'express'
import { OtherEteFormPage } from '../../../pages/appointments/otherEte/pathMap'
import RecordActivityFormService, { RecordActivityForm } from '../../../services/forms/recordActivityFormService'
import OffenderService from '../../../services/offenderService'
import ProviderService from '../../../services/providerService'
import RegionQuestion, { RegionQuestionBody, RegionQuestionViewData } from '../../../utils/components/regionQuestion'
import { ValidationErrors } from '../../../@types/user-defined'
import BaseOtherEteController, { OtherEteStepViewDataParams } from './baseOtherEteController'

export default class RegionController extends BaseOtherEteController<RegionQuestionViewData> {
  protected pageName: OtherEteFormPage = 'region'

  constructor(
    formService: RecordActivityFormService,
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

  protected getTemplatePath(): string {
    return 'appointments/update/chooseRegion'
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
    form: RecordActivityForm,
    body: RegionQuestionBody,
    contextData: RegionQuestionViewData,
  ): RecordActivityForm {
    return RegionQuestion.updateFormData(form, body, contextData)
  }
}
