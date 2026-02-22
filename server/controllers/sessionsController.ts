import type { Request, RequestHandler, Response } from 'express'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import SessionUtils from '../utils/sessionUtils'
import TrackProgressPage, { TrackProgressPageInput } from '../pages/trackProgressPage'
import DateTimeFormats from '../utils/dateTimeUtils'
import LocationUtils from '../utils/locationUtils'
import getTeams from './shared/getTeams'
import { generateErrorTextList } from '../utils/errorUtils'
import GovUkSelectInput from '../forms/GovUkSelectInput'

export default class SessionsController {
  constructor(
    private readonly providerService: ProviderService,
    private readonly sessionService: SessionService,
  ) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const providers = await this.providerService.getProviders(res.locals.user.username)

      if (providers.length === 1) {
        const [provider] = providers
        const teamItems = await getTeams({
          providerService: this.providerService,
          providerCode: provider.code,
          response: res,
        })

        return res.render('sessions/index', { teamItems, providerCode: provider.code, provider })
      }

      const providerCode = _req.query.provider?.toString()

      const providerItems = GovUkSelectInput.getOptions(providers, 'name', 'code', 'Choose region', providerCode)

      const teamItems = await getTeams({
        providerService: this.providerService,
        providerCode,
        response: res,
      })

      res.render('sessions/index', { teamItems, providerItems, providerCode })
    }
  }

  search(): RequestHandler {
    return async (_req: Request, res: Response) => {
      // Assigning the query object to a standard object prototype to resolve TypeError: Cannot convert object to primitive value
      const query = { ..._req.query }
      const teamCode = query.team?.toString() ?? undefined

      const providers = await this.providerService.getProviders(res.locals.user.username)
      const provider = providers.length === 1 ? providers[0] : undefined
      const providerCode = provider?.code ?? query.provider?.toString()
      const providerItems = provider
        ? undefined
        : GovUkSelectInput.getOptions(providers, 'name', 'code', 'Choose region', providerCode)

      const teamItems = await getTeams({
        providerService: this.providerService,
        providerCode,
        response: res,
        teamCode,
      })

      const page = new TrackProgressPage(_req.query as TrackProgressPageInput)

      const validationErrors = page.validationErrors()

      if (Object.keys(validationErrors).length !== 0) {
        const errorSummary = Object.keys(validationErrors).map(k => ({
          text: validationErrors[k as keyof TrackProgressPageInput].text,
          href: `#${k}`,
        }))

        return res.render('sessions/index', {
          errorSummary,
          errors: validationErrors,
          teamItems,
          providerCode,
          providerItems,
          provider,
          sessionRows: [],
          ...page.items(validationErrors),
        })
      }

      const sessions = await this.sessionService.getSessions({
        ...page.searchValues(),
        username: res.locals.user.username,
        providerCode: providerCode,
      })

      const sessionRows = SessionUtils.sessionResultTableRows(sessions)

      return res.render('sessions/index', {
        ...page.items(),
        providerCode,
        providerItems,
        provider,
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
