import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import AppointmentsController from './appointmentsController'
import AppointmentFormService, { APPOINTMENT_UPDATE_FORM_TYPE } from '../../services/forms/appointmentFormService'
import ProjectService from '../../services/projectService'
import projectFactory from '../../testutils/factories/projectFactory'
import paths from '../../paths'
import { pathWithQuery } from '../../utils/utils'

describe('AppointmentsController', () => {
  const userName = 'user'
  const crn = 'X123456'
  const requirement = '1'
  const projectCode = '2'
  const date = '2026-01-01'
  const formId = 'some-form-id'

  const request = createMock<Request>({
    params: { crn, requirement, projectCode, date },
    query: { provider: 'provider-code' },
  })
  const response = createMock<Response>({ locals: { user: { username: userName } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const formService = createMock<AppointmentFormService>()
  const projectService = createMock<ProjectService>()

  let controller: AppointmentsController

  beforeEach(() => {
    jest.resetAllMocks()

    controller = new AppointmentsController(formService, projectService)
  })

  describe('create', () => {
    it('should create a new appointment form and redirect to the choose project page', async () => {
      const project = projectFactory.build({ projectCode })

      projectService.getProject.mockResolvedValue(project)
      formService.createNewAppointmentForm.mockResolvedValue({
        key: { id: formId, type: APPOINTMENT_UPDATE_FORM_TYPE },
        data: undefined,
      })

      const requestHandler = controller.create()
      await requestHandler(request, response, next)

      expect(projectService.getProject).toHaveBeenCalledWith({ username: userName, projectCode })

      expect(formService.createNewAppointmentForm).toHaveBeenCalledWith(
        userName,
        request.query,
        crn,
        requirement,
        project,
        date,
      )

      expect(response.redirect).toHaveBeenCalledWith(
        pathWithQuery(paths.appointments.create({ projectCode, page: 'choose-supervisor' }), {
          form: formId,
        }),
      )
    })
  })
})
