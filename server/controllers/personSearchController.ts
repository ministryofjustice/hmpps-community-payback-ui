import type { Request, RequestHandler, Response } from 'express'
import AuditService from '../services/auditService'

export default class PersonSearchController {
  constructor(private readonly auditService: AuditService) {}

  show(auditPageAction: string, { resultPath, backPath }: { resultPath?: string; backPath: string }): RequestHandler {
    return async (req: Request, res: Response) => {
      if (res.locals.searchResults.response) {
        const people = res.locals.searchResults.response.content

        people.forEach((person: { otherIds: { crn: string } }) => {
          this.auditService.sendAuditMessage({
            action: auditPageAction,
            username: res.locals.user.username,
            details: req.params,
            correlationId: req.id,
            subjectType: 'CRN',
            subjectId: person.otherIds.crn,
          })
        })
      }

      return res.render('pages/findAPerson', { resultPath, backLink: backPath })
    }
  }
}
