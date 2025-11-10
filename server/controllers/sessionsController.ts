import type { Request, RequestHandler, Response } from 'express'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import SessionUtils from '../utils/sessionUtils'
import TrackProgressPage, { TrackProgressPageInput } from '../pages/trackProgressPage'
import DateTimeFormats from '../utils/dateTimeUtils'
import GovUkSelectInput from '../forms/GovUkSelectInput'

export default class SessionsController {
  constructor(
    private readonly providerService: ProviderService,
    private readonly sessionService: SessionService,
  ) {}

  start(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const providerItems = await this.getProviders(res)

      res.render('sessions/start', { providerItems })
    }
  }

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const providerCode = _req.query.provider.toString()
      const providers = await this.providerService.getProviders(res.locals.user.name)
      const provider = providers.find(p => p.code === providerCode)
      const teamItems = await this.getTeams(providerCode, res)

      res.render('sessions/index', { teamItems, provider })
    }
  }

  search(): RequestHandler {
    return async (_req: Request, res: Response) => {
      let teamItems

      // Assigning the query object to a standard object prototype to resolve TypeError: Cannot convert object to primitive value
      const query = { ..._req.query }
      const providerCode = query.provider?.toString()
      const teamCode = query.team?.toString() ?? undefined

      try {
        teamItems = await this.getTeams(providerCode, res, teamCode)
      } catch {
        throw new Error('Something went wrong')
      }

      const providers = await this.providerService.getProviders(res.locals.user.name)
      const provider = providers.find(p => p.code === providerCode)
      const page = new TrackProgressPage(_req.query as TrackProgressPageInput)
      const validationErrors = page.validationErrors()
      const pageSearchValues = page.items()

      try {
        if (Object.keys(validationErrors).length !== 0) {
          throw new Error('Validation error')
        }

        const startDate = `${query['startDate-year']}-${query['startDate-month']}-${query['startDate-day']}`
        const endDate = `${query['endDate-year']}-${query['endDate-month']}-${query['endDate-day']}`

        const sessions = await this.sessionService.getSessions({
          username: res.locals.user.username,
          teamCode,
          startDate,
          endDate,
        })

        res.render('sessions/index', {
          ...pageSearchValues,
          teamItems,
          provider,
          sessionRows: SessionUtils.sessionResultTableRows(sessions),
        })
      } catch {
        const errorSummary = Object.keys(validationErrors).map(k => ({
          text: validationErrors[k as keyof TrackProgressPageInput].text,
          href: `#${k}`,
        }))

        res.render('sessions/index', {
          errorSummary,
          errors: validationErrors,
          provider,
          teamItems,
          sessionRows: [],
          ...pageSearchValues,
        })
      }
    }
  }

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { projectCode } = _req.params
      const { date, startTime, endTime } = _req.query

      const request = {
        username: res.locals.user.username,
        projectCode,
        date: date.toString(),
        startTime: startTime.toString(),
        endTime: endTime.toString(),
      }

      const session = await this.sessionService.getSession(request)
      const sessionList = SessionUtils.sessionListTableRows(session.appointmentSummaries)
      const dateAndTime = DateTimeFormats.dateAndTimePeriod(session.date, session.startTime, session.endTime, {
        format: 'medium',
      })
      res.render('sessions/show', {
        session: {
          ...session,
          dateAndTime,
        },
        sessionList,
      })
    }
  }

  private async getProviders(res: Response, providerCode: string | undefined = undefined) {
    const providers = await this.providerService.getProviders(res.locals.user.name)
    const providerItems = GovUkSelectInput.getOptions(providers, 'name', 'code', undefined, providerCode)
    return providerItems
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
