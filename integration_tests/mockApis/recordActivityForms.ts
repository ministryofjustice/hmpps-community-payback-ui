import { SuperAgentRequest } from 'superagent'
import { RECORD_ACTIVITY_FORM_TYPE, RecordActivityForm } from '../../server/services/forms/recordActivityFormService'
import { stubFor } from './wiremock'

export default {
  stubGetRecordActivityForm: (form: RecordActivityForm): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/common/forms/${RECORD_ACTIVITY_FORM_TYPE}/([a-f0-9\\-]*)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: form,
      },
    }),
  stubSaveRecordActivityForm: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        urlPathPattern: `/common/forms/${RECORD_ACTIVITY_FORM_TYPE}/([a-f0-9\\-]*)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    }),
}
