import { SuperAgentRequest } from 'superagent'
import { ADJUSTMENT_UPDATE_FORM_TYPE, AdjustmentForm } from '../../server/services/forms/adjustmentFormService'
import { stubFor } from './wiremock'

export default {
  stubGetAdjustmentForm: (form: AdjustmentForm): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/common/forms/${ADJUSTMENT_UPDATE_FORM_TYPE}/([a-f0-9\\-]*)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: form,
      },
    }),
  stubSaveAdjustmentForm: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        urlPathPattern: `/common/forms/${ADJUSTMENT_UPDATE_FORM_TYPE}/([a-f0-9\\-]*)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    }),
}
