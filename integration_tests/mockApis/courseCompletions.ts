import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import type { EteCourseCompletionEventDto, PagedModelEteCourseCompletionEventDto } from '../../server/@types/shared'
import { GetCourseCompletionsRequest } from '../../server/@types/user-defined'

export default {
  stubFindCourseCompletion: ({
    courseCompletion,
  }: {
    courseCompletion: EteCourseCompletionEventDto
  }): SuperAgentRequest => {
    const pattern = paths.courseCompletions.singleCourseCompletion({ id: courseCompletion.id })
    return stubFor({
      request: {
        method: 'GET',
        urlPath: pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: courseCompletion,
      },
    })
  },
  stubGetCourseCompletions: ({
    request,
    courseCompletions,
  }: {
    request: GetCourseCompletionsRequest
    courseCompletions: PagedModelEteCourseCompletionEventDto
  }): SuperAgentRequest => {
    const queryParameters: Record<string, unknown> = {
      dateFrom: {
        equalTo: request.dateFrom,
      },
      dateTo: {
        equalTo: request.dateTo,
      },
    }
    const pattern = paths.courseCompletions.filter(request)
    return stubFor({
      request: {
        method: 'GET',
        urlPath: pattern,
        queryParameters,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: courseCompletions,
      },
    })
  },
}
