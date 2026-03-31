import type { Request, RequestHandler, Response } from 'express'

export default class AdjustTravelTimeController {
  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      res.render('appointments/update/adjustTravelTime')
    }
  }
}
