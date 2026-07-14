import type { Request, RequestHandler, Response } from 'express'

import AppointmentFormService from '../../services/forms/appointmentFormService'
import paths from '../../paths'
import { newAppointmentId } from '../../pages/appointments/pathMap'
import { pathWithQuery } from '../../utils/utils'
import ProjectService from '../../services/projectService'

export default class AppointmentController {
  constructor(
    private readonly formService: AppointmentFormService,
    private readonly projectService: ProjectService,
  ) {}

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, event, projectCode, date } = req.params
      const { username } = res.locals.user

      const project = await this.projectService.getProject({ username, projectCode })

      const { key } = await this.formService.createNewAppointmentForm({
        username,
        query: req.query as Record<string, string>,
        crn,
        deliusEventNumber: event,
        date,
        project,
      })

      res.redirect(
        pathWithQuery(paths.appointments.update({ projectCode, appointmentId: newAppointmentId, page: 'date' }), {
          form: key.id,
        }),
      )
    }
  }
}
