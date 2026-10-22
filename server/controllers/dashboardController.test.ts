import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import DashboardController from './dashboardController'
import config from '../config'

describe('DashboardController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let dashboardController: DashboardController

  beforeEach(() => {
    jest.clearAllMocks()
    dashboardController = new DashboardController()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('index', () => {
    it('should render the dashboard page', async () => {
      const requestHandler = dashboardController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('pages/index', {
        findAPersonEnabled: config.featureFlags.findAPersonEnabled,
        travelTimeEnabled: config.featureFlags.travelTimeEnabled,
        courseCompletionsEnabled: config.featureFlags.courseCompletionsEnabled,
      })
    })
  })

  describe('when feature flags are enabled', () => {
    it('renders the dashboard page with feature flags set to true', async () => {
      jest.replaceProperty(config, 'featureFlags', {
        ...config.featureFlags,
        findAPersonEnabled: true,
        travelTimeEnabled: true,
        courseCompletionsEnabled: true,
      })

      const requestHandler = dashboardController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('pages/index', {
        findAPersonEnabled: true,
        travelTimeEnabled: true,
        courseCompletionsEnabled: true,
      })
    })

    it('renders the dashboard page with feature flags set to false', async () => {
      jest.replaceProperty(config, 'featureFlags', {
        ...config.featureFlags,
        findAPersonEnabled: false,
        travelTimeEnabled: false,
        courseCompletionsEnabled: false,
      })

      const requestHandler = dashboardController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('pages/index', {
        findAPersonEnabled: false,
        travelTimeEnabled: false,
        courseCompletionsEnabled: false,
      })
    })
  })
})
