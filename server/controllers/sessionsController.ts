import type { Request, RequestHandler, Response } from 'express'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import SessionUtils from '../utils/sessionUtils'
import TrackProgressPage, { TrackProgressPageInput } from '../pages/trackProgressPage'
import DateTimeFormats from '../utils/dateTimeUtils'

export default class SessionsController {
  private readonly providerCode = 'N56'

  constructor(
    private readonly providerService: ProviderService,
    private readonly sessionService: SessionService,
  ) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const teamItems = await this.getTeams(this.providerCode, res)

      res.render('sessions/index', { teamItems })
    }
  }

  search(): RequestHandler {
    return async (_req: Request, res: Response) => {
      let teamItems

      // Assigning the query object to a standard object prototype to resolve TypeError: Cannot convert object to primitive value
      const query = { ..._req.query }
      const teamCode = query.team?.toString() ?? undefined

      try {
        teamItems = await this.getTeams(this.providerCode, res, teamCode)
      } catch {
        throw new Error('Something went wrong')
      }

      const page = new TrackProgressPage(_req.query as TrackProgressPageInput)
      const validationErrors = page.validationErrors()
      const pageSearchValues = page.items()

      try {
        if (Object.keys(validationErrors).length !== 0) {
          throw new Error('Validation error')
        }

        const sessions = await this.sessionService.getSessions({
          ...page.searchValues(),
          username: res.locals.user.username,
          providerCode: this.providerCode,
        })

        const sessionRows = SessionUtils.sessionResultTableRows(sessions)

        res.render('sessions/index', {
          ...pageSearchValues,
          teamItems,
          sessionRows,
          showNoResultsMessage: sessionRows.length === 0,
        })
      } catch {
        const errorSummary = Object.keys(validationErrors).map(k => ({
          text: validationErrors[k as keyof TrackProgressPageInput].text,
          href: `#${k}`,
        }))

        res.render('sessions/index', {
          errorSummary,
          errors: validationErrors,
          teamItems,
          sessionRows: [],
          ...pageSearchValues,
        })
      }
    }
  }

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { projectCode, date } = _req.params

      const request = {
        username: res.locals.user.username,
        projectCode,
        date,
      }

      const session = await this.sessionService.getSession(request)
      const sessionList = SessionUtils.sessionListTableRows(session)
      const formattedDate = DateTimeFormats.isoDateToUIDate(date, { format: 'medium' })
      res.render('sessions/show', {
        session: {
          ...session,
          date: formattedDate,
        },
        sessionList,
      })
    }
  }

  private async getTeams(providerCode: string, res: Response, teamCode: string | undefined = undefined) {
    const teams = await this.providerService.getTeams(providerCode, res.locals.user.username)

    const teamItems = teams.providers.map(team => {
      const selected = teamCode ? team.code === teamCode : undefined

      return {
        value: team.code,
        text: team.name,
        selected,
      }
    })
    return teamItems
  }
}
