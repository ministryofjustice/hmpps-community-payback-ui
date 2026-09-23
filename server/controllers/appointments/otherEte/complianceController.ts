import { ValidationErrors } from '../../../@types/user-defined'
import { OtherEteFormPage } from '../../../pages/appointments/otherEte/pathMap'
import AppointmentFormService, { CreateAppointmentForm } from '../../../services/forms/appointmentFormService'
import OffenderService from '../../../services/offenderService'
import ComplianceQuestions, { ComplianceQuestionsBody } from '../../../utils/components/complianceQuestions'
import BaseOtherEteController, { OtherEteStepViewDataParams } from './baseOtherEteController'

export default class ComplianceController extends BaseOtherEteController<ComplianceQuestionsBody> {
  protected pageName: OtherEteFormPage = 'compliance'

  protected templatePath = 'appointments/update/logCompliance'

  constructor(formService: AppointmentFormService, offenderService: OffenderService) {
    super(formService, offenderService)
  }

  protected nextPage(): OtherEteFormPage {
    return 'confirm'
  }

  protected backPage(): OtherEteFormPage {
    return 'outcome'
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

  protected updateForm(form: CreateAppointmentForm, body: ComplianceQuestionsBody): CreateAppointmentForm {
    return ComplianceQuestions.updateFormData(form, body)
  }
}
