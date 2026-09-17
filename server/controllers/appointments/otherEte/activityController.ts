import type { Request, Response } from 'express'
import { ValidationErrors } from '../../../@types/user-defined'
import { OtherEteFormPage } from '../../../pages/appointments/otherEte/pathMap'
import RecordActivityPage, {
  RecordActivityBody,
  RecordActivityContext,
} from '../../../pages/appointments/otherEte/recordActivityPage'
import RecordActivityFormService, { RecordActivityForm } from '../../../services/forms/recordActivityFormService'
import OffenderService from '../../../services/offenderService'
import ReferenceDataService from '../../../services/referenceDataService'
import BaseOtherEteController, { OtherEteStepViewDataParams } from './baseOtherEteController'

export default class ActivityController extends BaseOtherEteController<RecordActivityContext> {
  protected pageName: OtherEteFormPage = 'outcome'

  constructor(
    formService: RecordActivityFormService,
    offenderService: OffenderService,
    private readonly referenceDataService: ReferenceDataService,
  ) {
    super(formService, offenderService)
  }

  protected nextPage(): OtherEteFormPage {
    return 'compliance'
  }

  protected backPage(): OtherEteFormPage {
    return 'project'
  }

  protected getTemplatePath(): string {
    return 'appointments/recordActivity'
  }

  protected async getContextData({
    res,
    form,
  }: {
    req: Request
    res: Response
    form: RecordActivityForm
  }): Promise<RecordActivityContext> {
    const { username } = res.locals.user

    const { contactOutcomes } = await this.referenceDataService.getAvailableContactOutcomes(username)
    const offenderSummary = await this.offenderService.getOffenderSummary({ username, crn: form.crn })

    return {
      contactOutcomes: contactOutcomes.filter(outcome => outcome.attended),
      unpaidWorkDetails: offenderSummary.unpaidWorkDetails,
    }
  }

  protected async getStepViewData({
    req,
    form,
    contextData,
  }: OtherEteStepViewDataParams<RecordActivityContext>): Promise<object> {
    return RecordActivityPage.viewData(form, contextData, req.body as RecordActivityBody)
  }

  protected validate(query: RecordActivityBody): ValidationErrors<RecordActivityBody> {
    return RecordActivityPage.validate(query)
  }

  protected updateForm(
    form: RecordActivityForm,
    body: RecordActivityBody,
    contextData: RecordActivityContext,
  ): RecordActivityForm {
    return RecordActivityPage.updateFormData(form, body, contextData)
  }
}
