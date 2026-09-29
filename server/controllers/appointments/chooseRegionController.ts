import ChooseRegionPage from '../../pages/appointments/chooseRegionPage'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import SessionService from '../../services/sessionService'
import OffenderService from '../../services/offenderService'
import BaseAppointmentController, { AppointmentStepViewDataParams } from './baseAppointmentController'
import ProviderService from '../../services/providerService'
import RegionQuestion, { RegionQuestionViewData } from '../../utils/components/regionQuestion'

export default class ChooseRegionController extends BaseAppointmentController<ChooseRegionPage> {
  constructor(
    appointmentService: AppointmentService,
    appointmentFormService: AppointmentFormService,
    sessionService: SessionService,
    offenderService: OffenderService,
    private readonly providerService: ProviderService,
  ) {
    super(new ChooseRegionPage(), appointmentService, appointmentFormService, sessionService, offenderService)
  }

  protected async getContextData({ req }: AppointmentStepViewDataParams): Promise<RegionQuestionViewData> {
    const providers = await this.providerService.getProviders(req.user.username)
    return { providers }
  }

  protected async getStepViewData({ req, form, contextData }: AppointmentStepViewDataParams): Promise<object> {
    return RegionQuestion.viewData(form, contextData as RegionQuestionViewData, req.body)
  }

  protected getTemplatePath(): string {
    return 'appointments/update/chooseRegion'
  }
}
