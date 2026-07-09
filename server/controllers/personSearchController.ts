import type { Request, RequestHandler, Response } from 'express'
import AuditService, { Page } from '../services/auditService'

export default class PersonSearchController {
  constructor(private readonly auditService: AuditService) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      if (res.locals.searchResults.response) {
        const people = res.locals.searchResults.response.content

        people.forEach((person: { otherIds: { crn: string } }) => {
          this.auditService.sendAuditMessage({
            action: Page.VIEW_SESSIONS_FIND_A_PERSON_RESULTS,
            username: res.locals.user.username,
            details: req.params,
            correlationId: req.id,
            subjectType: 'CRN',
            subjectId: person.otherIds.crn,
          })
        })
      }

      return res.render('pages/findAPerson')
    }
  }
}
