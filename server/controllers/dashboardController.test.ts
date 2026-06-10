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
        travelTimeEnabled: config.featureFlags.travelTimeEnabled,
      })
    })
  })

  describe('when travel time feature flag is enabled', () => {
    it('renders the dashboard page with feature flag set to true', async () => {
      jest.replaceProperty(config, 'featureFlags', { travelTimeEnabled: true })

      const requestHandler = dashboardController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('pages/index', {
        travelTimeEnabled: true,
      })
    })

    it('renders the dashboard page with feature flag set to false', async () => {
      jest.replaceProperty(config, 'featureFlags', { travelTimeEnabled: false })

      const requestHandler = dashboardController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('pages/index', {
        travelTimeEnabled: false,
      })
    })
  })
})
