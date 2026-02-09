import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import type { EteCourseCompletionEventDto } from '../../server/@types/shared'

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
}
