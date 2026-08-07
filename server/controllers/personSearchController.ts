import type { Request, RequestHandler, Response } from 'express'
import AuditService from '../services/auditService'
import AppointmentFormService, { CreateAppointmentForm } from '../services/forms/appointmentFormService'
import { pathWithQuery } from '../utils/utils'

export default class PersonSearchController {
  constructor(
    private readonly auditService: AuditService,
    private readonly formService: AppointmentFormService,
  ) {}

  show(auditPageAction: string, { resultPath, backPath }: { resultPath: string; backPath: string }): RequestHandler {
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
      let originalSearch = req.query as Record<string, string>

      if (form) {
        const formData = (await this.formService.getForm(form, res.locals.user.username)) as CreateAppointmentForm
        originalSearch = formData.originalSearch
      }
      const paths = {
        resultPath: pathWithQuery(resultPath, req.query as Record<string, string>),
        backLink: pathWithQuery(backPath, originalSearch),
      }

      return res.render('pages/findAPerson', paths)
    }
  }
}
