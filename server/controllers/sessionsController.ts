import type { Request, RequestHandler, Response } from 'express'
import ProviderService from '../services/providerService'
import { ProjectAllocationDto, ProjectAllocationsDto } from '../@types/shared'
import SessionService from '../services/sessionService'

export default class SessionsController {
  constructor(
    private readonly providerService: ProviderService,
    private readonly sessionService: SessionService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const providerId = '1000'
      const teams = await this.providerService.getTeams(providerId, res.locals.user.username)

      const teamItems = teams.providers.map(team => ({
        value: team.id,
        text: team.name,
      }))

      res.render('sessions/show', { teamItems })
    }
  }

  search(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const teamId = Number(_req.query.team)
      const startDate = `${_req.query['startDate-year']}-${_req.query['startDate-month']}-${_req.query['startDate-day']}`
      const endDate = `${_req.query['endDate-year']}-${_req.query['endDate-month']}-${_req.query['endDate-day']}`

      try {
        const providerId = '1000'
        const teams = await this.providerService.getTeams(providerId, res.locals.user.username)

        const teamItems = teams.providers.map(team => ({
          value: team.id,
          text: team.name,
        }))

        const sessions = await this.sessionService.getSessions({ username: res.locals.user.username, teamId, startDate, endDate })

        res.render('sessions/show', { teamItems, sessionRows: this.sessionRows(sessions) })
      } catch (e) {
        res.render('sessions/show', { teamItems: [], sessionRows: [] })
      }
    }
  }

  private sessionRows(sessions: ProjectAllocationsDto) {
    return sessions.allocations.map(session => {
      return [
        { text: session.date },
        { text: session.projectName },
        { text: session.projectCode },
        { text: session.startTime },
        { text: session.endTime },
        { text: session.numberOfOffendersAllocated },
        { text: session.numberOfOffendersWithOutcomes },
        { text: session.numberOfOffendersWithEA },
      ]
    })
  }
}
