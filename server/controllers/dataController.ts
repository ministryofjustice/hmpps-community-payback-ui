import type { Request, RequestHandler, Response } from 'express'
import ProviderService from '../services/providerService'
import ProjectService from '../services/projectService'
import getTeams from './shared/getTeams'
import getProjects from './shared/getProjects'

export default class DataController {
  constructor(
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
  ) {}

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

  projects(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { providerCode, teamCode, projectTypeGroup } = _req.params
      const projects = await getProjects({
        projectTypeGroup: projectTypeGroup as Parameters<typeof getProjects>[0]['projectTypeGroup'],
        username: res.locals.user.username,
        providerCode,
        teamCode,
        projectService: this.projectService,
        response: res,
      })
      res.send({ projects })
    }
  }
}
