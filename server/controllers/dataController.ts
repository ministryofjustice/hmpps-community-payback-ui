import type { Request, RequestHandler, Response } from 'express'
import { getTeams } from './shared/getTeams'
import ProviderService from '../services/providerService'

export default class DataController {
  constructor(private readonly providerService: ProviderService) {}
  teams(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { provider } = _req.params
      const teams = await getTeams({
        providerService: this.providerService,
        providerCode: provider,
        response: res,
      })
      res.send({ teams })
    }
  }
}
