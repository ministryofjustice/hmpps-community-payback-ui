import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import paths from '../../server/paths/api'
import { CommunityCampusPdusDto, ContactOutcomesDto } from '../../server/@types/shared'
import adjustmentReasonsJson from '../fixtures/adjustmentReasons.json'
import adjustmentReasonFactory from '../../server/testutils/factories/adjustmentReasonFactory'

export default {
  stubGetContactOutcomes: (args: { contactOutcomes: ContactOutcomesDto }): SuperAgentRequest => {
    const { pattern } = paths.referenceData.contactOutcomes
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...args.contactOutcomes,
        },
      },
    })
  },
  stubGetCommunityCampusPdus: (args: { pdus: CommunityCampusPdusDto }): SuperAgentRequest => {
    const { pattern } = paths.referenceData.communityCampusPdus
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          ...args.pdus,
        },
      },
    })
  },
  stubGetAdjustmentReasons: (): SuperAgentRequest => {
    const { pattern } = paths.referenceData.adjustmentReasons
    const adjustmentReasons = adjustmentReasonsJson.map(reason =>
      adjustmentReasonFactory.build({ name: reason.name, id: reason.id, deliusCode: reason.deliusCode }),
    )
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: pattern,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          adjustmentReasons,
        },
      },
    })
  },
}
