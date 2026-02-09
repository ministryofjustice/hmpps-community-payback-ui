import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import type { ProjectDto } from '../../server/@types/shared'
import DateTimeFormats from '../../server/utils/dateTimeUtils'

export default {
  stubFindProject: ({ project }: { project: ProjectDto }): SuperAgentRequest => {
    const pattern = paths.projects.singleProject({ projectCode: project.projectCode })
    return stubFor({
      request: {
        method: 'GET',
        urlPath: pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: project,
      },
    })
  },
}

export const baseProjectAppointmentRequest = () => ({
  outcomeCodes: ['NO_OUTCOME'],
  toDate: DateTimeFormats.dateObjToIsoString(new Date()),
})
