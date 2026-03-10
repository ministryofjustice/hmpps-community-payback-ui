import { SuperAgentRequest } from 'superagent'
import {
  COURSE_COMPLETION_PROCESS_FORM_TYPE,
  CourseCompletionForm,
} from '../../server/services/forms/courseCompletionFormService'

import { stubFor } from './wiremock'

export default {
  stubGetCourseCompletionForm: (form: CourseCompletionForm): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/common/forms/${COURSE_COMPLETION_PROCESS_FORM_TYPE}/([a-f0-9\\-]*)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: form,
      },
    }),
  stubSaveCourseCompletionForm: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        urlPathPattern: `/common/forms/${COURSE_COMPLETION_PROCESS_FORM_TYPE}/([a-f0-9\\-]*)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    }),
}
