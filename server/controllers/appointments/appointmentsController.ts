import type { Request, RequestHandler, Response } from 'express'

import AppointmentFormService from '../../services/forms/appointmentFormService'
import paths from '../../paths'
import { pathWithQuery } from '../../utils/utils'
import ProjectService from '../../services/projectService'

export default class AppointmentsController {
  constructor(
    private readonly formService: AppointmentFormService,
    private readonly projectService: ProjectService,
  ) {}

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, deliusEventNumber, projectCode, date } = req.params
      const { username } = res.locals.user

      const project = await this.projectService.getProject({ username, projectCode })

      const form = req.query?.form?.toString()

      const id =
        form ||
        (
          await this.formService.createNewAppointmentForm(
            username,
            req.query as Record<string, string>,
            crn,
            deliusEventNumber,
            project,
            date,
          )
        ).key.id

      res.redirect(
        pathWithQuery(paths.appointments.create({ projectCode, page: 'date' }), {
          form: id,
        }),
      )
    }
  }
}
