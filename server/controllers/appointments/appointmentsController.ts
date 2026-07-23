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
      const { crn, requirement, projectCode, date } = req.params
      const { username } = res.locals.user

      const project = await this.projectService.getProject({ username, projectCode })

      const { key } = await this.formService.createNewAppointmentForm(
        username,
        req.query as Record<string, string>,
        crn,
        requirement,
        project,
        date,
      )

      res.redirect(
        pathWithQuery(paths.appointments.create({ projectCode, page: 'date' }), {
          form: key.id,
        }),
      )
    }
  }
}
