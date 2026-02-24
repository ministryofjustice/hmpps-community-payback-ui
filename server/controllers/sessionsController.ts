import type { Request, RequestHandler, Response } from 'express'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import SessionUtils from '../utils/sessionUtils'
import GroupSessionIndexPage, { GroupSessionIndexPageInput } from '../pages/groupSessionIndexPage'
import DateTimeFormats from '../utils/dateTimeUtils'
import LocationUtils from '../utils/locationUtils'
import getTeams from './shared/getTeams'
import { generateErrorTextList } from '../utils/errorUtils'
import getProviders from './shared/getProviders'

export default class SessionsController {
  private readonly providerCode = 'N56'

  constructor(
    private readonly providerService: ProviderService,
    private readonly sessionService: SessionService,
  ) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const providerCode = _req.query.provider?.toString() || undefined

      const providerItems = await getProviders({
        providerService: this.providerService,
        providerCode,
        response: res,
      })

      const teamItems = await getTeams({
        providerService: this.providerService,
        providerCode: this.providerCode,
        response: res,
      })

      res.render('sessions/index', { form: { teamItems, providerItems } })
    }
  }

  search(): RequestHandler {
    return async (_req: Request, res: Response) => {
      // Assigning the query object to a standard object prototype to resolve TypeError: Cannot convert object to primitive value
      const query = { ..._req.query }
      const teamCode = query.team?.toString() ?? undefined
      const providerCode = _req.query.provider?.toString() || undefined

      const providerItems = await getProviders({
        providerService: this.providerService,
        providerCode,
        response: res,
      })

      const teamItems = await getTeams({
        providerService: this.providerService,
        providerCode: this.providerCode,
        response: res,
        teamCode,
      })

      const page = new GroupSessionIndexPage(_req.query as GroupSessionIndexPageInput)
      const validationErrors = page.validationErrors()
      const pageSearchValues = page.items()

      if (Object.keys(validationErrors).length !== 0) {
        const errorSummary = Object.keys(validationErrors).map(k => ({
          text: validationErrors[k as keyof GroupSessionIndexPageInput].text,
          href: `#${k}`,
        }))

        return res.render('sessions/index', {
          errorSummary,
          errors: validationErrors,
          form: { teamItems, providerItems, ...pageSearchValues },
          sessionRows: [],
        })
      }

      const sessions = await this.sessionService.getSessions({
        ...page.searchValues(),
        username: res.locals.user.username,
        providerCode: this.providerCode,
      })

      const sessionRows = SessionUtils.sessionResultTableRows(sessions)

      return res.render('sessions/index', {
        form: {
          ...pageSearchValues,
          providerItems,
          teamItems,
        },
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
