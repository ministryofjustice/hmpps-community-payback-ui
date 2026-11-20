import superagent, { type SuperAgentRequest, type Response } from 'superagent'
import { clearPopNames, recordPopNames } from './popNames'
import type { ApiResponseIssue, ErrorResponse } from '../../server/@types/shared'

const url = 'http://localhost:9091/__admin'

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest => {
  recordPopNames(mapping)
  return superagent.post(`${url}/mappings`).send(mapping)
}

const getMatchingRequests = body => superagent.post(`${url}/requests/find`).send(body)

const resetStubs = (): Promise<Array<Response>> => {
  clearPopNames()
  return Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])
}

const arrayToQueryStubMappings = (array: Array<unknown>) => array.map(value => ({ equalTo: value }))

type ApiIssues = {
  errors?: Array<ApiResponseIssue>
  warnings?: Array<ApiResponseIssue>
}

const badRequestResponseBody = ({ errors = [], warnings = [] }: ApiIssues): ErrorResponse => ({
  status: 400,
  success: false,
  hasContent: false,
  hasErrors: errors.length > 0,
  hasWarnings: warnings.length > 0,
  errors,
  warnings,
  userMessage: errors[0]?.data.message ?? null,
  developerMessage: 'Bad request',
})

export type { ApiIssues }
export { stubFor, getMatchingRequests, resetStubs, arrayToQueryStubMappings, badRequestResponseBody }
