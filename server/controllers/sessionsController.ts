import type { Request, RequestHandler, Response } from 'express'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import SessionUtils from '../utils/sessionUtils'
import TrackProgressPage, { TrackProgressPageInput } from '../pages/trackProgressPage'
import DateTimeFormats from '../utils/dateTimeUtils'
import LocationUtils from '../utils/locationUtils'
import getTeams from './shared/getTeams'
import { generateErrorTextList } from '../utils/errorUtils'

export default class SessionsController {
  private readonly providerCode = 'N56'

  constructor(
    private readonly providerService: ProviderService,
    private readonly sessionService: SessionService,
  ) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const teamItems = await getTeams({
        providerService: this.providerService,
        providerCode: this.providerCode,
        response: res,
      })

      res.render('sessions/index', { teamItems })
    }
  }

  search(): RequestHandler {
    return async (_req: Request, res: Response) => {
      // Assigning the query object to a standard object prototype to resolve TypeError: Cannot convert object to primitive value
      const query = { ..._req.query }
      const teamCode = query.team?.toString() ?? undefined

      const teamItems = await getTeams({
        providerService: this.providerService,
        providerCode: this.providerCode,
        response: res,
        teamCode,
      })

      const page = new TrackProgressPage(_req.query as TrackProgressPageInput)
      const validationErrors = page.validationErrors()
      const pageSearchValues = page.items()

      if (Object.keys(validationErrors).length !== 0) {
        const errorSummary = Object.keys(validationErrors).map(k => ({
          text: validationErrors[k as keyof TrackProgressPageInput].text,
          href: `#${k}`,
        }))

        return res.render('sessions/index', {
          errorSummary,
          errors: validationErrors,
          teamItems,
          sessionRows: [],
          ...pageSearchValues,
        })
      }

      const sessions = await this.sessionService.getSessions({
        ...page.searchValues(),
        username: res.locals.user.username,
        providerCode: this.providerCode,
      })

      const sessionRows = SessionUtils.sessionResultTableRows(sessions)

      return res.render('sessions/index', {
        ...pageSearchValues,
        teamItems,
        sessionRows,
        showNoResultsMessage: sessionRows.length === 0,
      })
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
      const formattedLocation = LocationUtils.locationToString(session.location)
      const errorList = generateErrorTextList(res.locals.errorMessages)

      res.render('sessions/show', {
        session: {
          ...session,
          date: formattedDate,
          formattedLocation,
        },
        sessionList,
        errorList,
      })
    }
  }
}
