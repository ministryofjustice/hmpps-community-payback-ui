import type { Request, RequestHandler, Response } from 'express'

import AppointmentFormService, { CreateAppointmentForm } from '../../services/forms/appointmentFormService'
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

      let id = form

      if (form) {
        const formData = (await this.formService.getForm(form, username)) as CreateAppointmentForm
        await this.formService.saveForm(form, username, {
          ...formData,
          deliusEventNumber,
          crn,
        })
      } else {
        const newForm = await this.formService.createNewAppointmentForm(
          username,
          req.query as Record<string, string>,
          crn,
          deliusEventNumber,
          project,
          date,
        )
        id = newForm.key.id
      }

      const createPath = date
        ? paths.sessions.create.formSteps({ projectCode, date, page: 'date' })
        : paths.projects.create.formSteps({ projectCode, page: 'date' })

      res.redirect(pathWithQuery(createPath, { form: id }))
    }
  }
}
