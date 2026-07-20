import { Request, Response } from 'express'
import { createMock } from '@golevelup/ts-jest'
import config from '../config'
import featureFlagMiddleware from './featureFlagMiddleware'

describe('featureFlagMiddleware', () => {
  const request = createMock<Request>({})
  const response = createMock<Response>({ redirect: jest.fn() })
  const next = jest.fn()

  const actualConfig = config.featureFlags

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    config.featureFlags = actualConfig
  })

  it('redirects to the home page if the given feature is not enabled', () => {
    config.featureFlags.createAppointmentEnabled = false

    const middleware = featureFlagMiddleware('createAppointmentEnabled')

    middleware(request, response, next)

    expect(response.redirect).toHaveBeenCalledWith('/')
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next when given feature is enabled', () => {
    config.featureFlags.createAppointmentEnabled = true

    const middleware = featureFlagMiddleware('createAppointmentEnabled')

    middleware(request, response, next)

    expect(response.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })
})
