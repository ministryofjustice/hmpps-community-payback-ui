import { Factory } from 'fishery'
import { ErrorResponse } from '../../@types/shared'
import apiResponseIssueFactory from './apiResponseIssueFactory'

export default Factory.define<ErrorResponse>(() => ({
  status: 400,
  success: false,
  hasContent: false,
  hasErrors: true,
  hasWarnings: false,
  errors: [apiResponseIssueFactory.build()],
  warnings: [],
  developerMessage: '',
}))
