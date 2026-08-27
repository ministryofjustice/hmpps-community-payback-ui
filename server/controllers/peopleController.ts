import type { Request, RequestHandler, Response } from 'express'
import AuditService from '../services/auditService'
import AppointmentFormService, { CreateAppointmentForm } from '../services/forms/appointmentFormService'
import { originalPathOr, pathWithQuery } from '../utils/utils'

export default class PeopleController {
  constructor(
    private readonly auditService: AuditService,
    private readonly formService: AppointmentFormService,
  ) {}

  search(auditPageAction: string, { resultPath, backPath }: { resultPath: string; backPath: string }): RequestHandler {
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

      const form = req.query?.form?.toString()
      let originalPath = req.query?.originalPath?.toString()

      if (form) {
        const formData = (await this.formService.getForm(form, res.locals.user.username)) as CreateAppointmentForm
        originalPath = formData.originalPath
      }
      const backLink = originalPathOr(
        { originalPath },
        pathWithQuery(backPath, req.query as Record<string, string>, { encode: true }),
      )
      const paths = {
        resultPath: pathWithQuery(resultPath, req.query as Record<string, string>, { encode: true }),
        backLink,
      }

      return res.render('people/index', paths)
    }
  }
}
