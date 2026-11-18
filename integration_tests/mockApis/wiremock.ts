import superagent, { type SuperAgentRequest, type Response } from 'superagent'
import { clearPopNames, recordPopNames } from './popNames'
import type { ErrorResponse } from '../../server/@types/shared'

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

const badRequestResponseBody = (userMessage: string): ErrorResponse => ({
  status: 400,
  success: false,
  hasContent: false,
  hasErrors: true,
  hasWarnings: false,
  errors: [],
  warnings: [],
  userMessage,
  developerMessage: 'Bad request',
})

export { stubFor, getMatchingRequests, resetStubs, arrayToQueryStubMappings, badRequestResponseBody }
