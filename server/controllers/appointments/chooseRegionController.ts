import ChooseRegionPage from '../../pages/appointments/chooseRegionPage'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import SessionService from '../../services/sessionService'
import OffenderService from '../../services/offenderService'
import BaseAppointmentController, { AppointmentStepViewDataParams } from './baseAppointmentController'
import ProviderService from '../../services/providerService'
import GovUkSelectInput from '../../forms/GovUkSelectInput'
import { ProviderSummaryDto } from '../../@types/shared'

type ContextData = {
  providers: Array<ProviderSummaryDto>
}

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

  protected async getContextData({ req }: AppointmentStepViewDataParams): Promise<ContextData> {
    const providers = await this.providerService.getProviders(req.user.username)
    return { providers }
  }

  protected async getStepViewData({ req, form, contextData }: AppointmentStepViewDataParams): Promise<object> {
    const selectedProvider = req.body?.provider ?? form?.provider?.code

    return {
      providerItems: GovUkSelectInput.getOptions(
        (contextData as ContextData).providers,
        'name',
        'code',
        'Choose region',
        selectedProvider,
      ),
    }
  }

  protected getTemplatePath(): string {
    return 'appointments/update/chooseRegion'
  }
}
