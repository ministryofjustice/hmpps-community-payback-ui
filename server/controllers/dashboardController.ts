import type { Request, RequestHandler, Response } from 'express'
import config from '../config'

export default class DashboardController {
  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      res.render('pages/index', {
        travelTimeEnabled: config.featureFlags.travelTimeEnabled,
      })
    }
  }
}
