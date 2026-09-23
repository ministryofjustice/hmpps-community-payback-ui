import { ValidationErrors } from '../../../@types/user-defined'
import { OtherEteFormPage } from '../../../pages/appointments/otherEte/pathMap'
import RecordActivityFormService, { RecordActivityForm } from '../../../services/forms/recordActivityFormService'
import OffenderService from '../../../services/offenderService'
import ComplianceQuestions, { ComplianceQuestionsBody } from '../../../utils/components/complianceQuestions'
import BaseOtherEteController, { OtherEteStepViewDataParams } from './baseOtherEteController'

export default class ComplianceController extends BaseOtherEteController {
  protected pageName: OtherEteFormPage = 'compliance'

  constructor(formService: RecordActivityFormService, offenderService: OffenderService) {
    super(formService, offenderService)
  }

  protected nextPage(): OtherEteFormPage {
    return 'confirm'
  }

  protected backPage(): OtherEteFormPage {
    return 'outcome'
  }

  protected getTemplatePath(): string {
    return 'appointments/update/logCompliance'
  }

  protected async getContextData(): Promise<unknown> {
    return undefined
  }

  protected async getStepViewData({ req, form }: OtherEteStepViewDataParams<unknown>): Promise<object> {
    return ComplianceQuestions.viewData(form, req.body as ComplianceQuestionsBody)
  }

  protected validate(query: ComplianceQuestionsBody): ValidationErrors<ComplianceQuestionsBody> {
    return ComplianceQuestions.validate(query)
  }

  protected updateForm(form: RecordActivityForm, body: ComplianceQuestionsBody): RecordActivityForm {
    return ComplianceQuestions.updateFormData(form, body)
  }
}
