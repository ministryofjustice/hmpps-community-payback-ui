import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import BulkUpdateController from './bulkUpdateController'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import SessionService from '../../services/sessionService'
import AppointmentService from '../../services/appointmentService'
import BulkUpdatePage from '../../pages/appointments/bulkUpdatePage'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import ProjectService from '../../services/projectService'
import projectFactory from '../../testutils/factories/projectFactory'

describe('BulkUpdateController', () => {
  const username = 'username'
  const next = createMock<NextFunction>({})
  const response = createMock<Response>({ locals: { user: { username } } })

  let bulkUpdateController: BulkUpdateController
  const sessionService = createMock<SessionService>()
  const appointmentFormService = createMock<AppointmentFormService>()
  const appointmentService = createMock<AppointmentService>()
  const projectService = createMock<ProjectService>()
  const page = createMock<BulkUpdatePage>()

  const viewData = {
    backLink: '/back',
    updatePath: '/update',
    options: [{ text: 'Option 1', value: 'opt-1', checked: false }],
    heading: { title: 'Project', caption: '' },
  }

  beforeEach(() => {
    jest.resetAllMocks()
    bulkUpdateController = new BulkUpdateController(
      sessionService,
      appointmentFormService,
      page,
      appointmentService,
      projectService,
    )
  })

  describe('show', () => {
    it('creates a bulk form when request has no form query param', async () => {
      const projectCode = 'P123'
      const date = '2026-06-12'
      const formId = 'form-id-123'

      const session = sessionFactory.build({ projectCode, date })
      sessionService.getSession.mockResolvedValue(session)

      const project = projectFactory.build()
      projectService.getProject.mockResolvedValue(project)

      const formData = appointmentOutcomeFormFactory.build()
      appointmentFormService.createBulkForm.mockResolvedValue({
        key: { id: formId, type: 'APPOINTMENT_UPDATE_ADMIN' },
        data: formData,
      })

      page.viewData.mockReturnValue(viewData)

      const requestHandler = bulkUpdateController.show()

      const query = { search: 'something' }
      await requestHandler(createMock<Request>({ query, params: { projectCode, date } }), response, next)

      expect(appointmentFormService.createBulkForm).toHaveBeenCalledWith(project, date, username, query)
      expect(response.render).toHaveBeenCalledWith('appointments/update/bulk', viewData)
    })

    it('fetches existing form when request has form query param', async () => {
      const projectCode = 'P123'
      const date = '2026-06-12'
      const formId = 'form-id-123'

      const session = sessionFactory.build({ projectCode, date })
      sessionService.getSession.mockResolvedValue(session)

      const formData = appointmentOutcomeFormFactory.build()
      appointmentFormService.getForm.mockResolvedValue(formData)

      page.viewData.mockReturnValue(viewData)

      const requestHandler = bulkUpdateController.show()

      await requestHandler(
        createMock<Request>({ query: { form: formId }, params: { projectCode, date } }),
        response,
        next,
      )

      expect(appointmentFormService.getForm).toHaveBeenCalledWith(formId, username)
      expect(response.render).toHaveBeenCalledWith('appointments/update/bulk', viewData)
    })
  })

  describe('submit', () => {
    it('renders the page with errors when validation errors are returned', async () => {
      const projectCode = 'P123'
      const date = '2026-06-12'
      const formId = 'form-id-123'

      const formData = appointmentOutcomeFormFactory.build()
      appointmentFormService.getForm.mockResolvedValue(formData)

      const errorSummary = [
        { text: 'At least one appointment must be selected', href: '#appointments', attributes: {} },
      ]
      const errors = { appointments: { text: 'At least one appointment must be selected' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errorSummary, errors })

      const session = sessionFactory.build({ projectCode, date })
      sessionService.getSession.mockResolvedValue(session)

      page.viewData.mockReturnValue(viewData)

      const requestHandler = bulkUpdateController.submitUpdate()

      await requestHandler(
        createMock<Request>({ query: { form: formId }, params: { projectCode, date }, body: {} }),
        response,
        next,
      )

      expect(page.validationErrors).toHaveBeenCalledWith({})
      expect(response.render).toHaveBeenCalledWith('appointments/update/bulk', {
        ...viewData,
        errorSummary,
        errors,
      })
    })

    it('fetches appointments, updates form data and redirects when no validation errors', async () => {
      const projectCode = 'P123'
      const date = '2026-06-12'
      const formId = 'form-id-123'

      const formData = appointmentOutcomeFormFactory.build()
      appointmentFormService.getForm.mockResolvedValue(formData)

      page.validationErrors.mockReturnValue({ hasErrors: false, errorSummary: [], errors: {} })

      page.selectedAppointments.mockReturnValue(['apt-1', 'apt-2'])

      const appointments = appointmentFactory.buildList(2)
      appointmentService.getAppointment.mockResolvedValueOnce(appointments[0]).mockResolvedValueOnce(appointments[1])

      const updatedFormData = appointmentOutcomeFormFactory.build()
      page.getFormData.mockReturnValue(updatedFormData)

      const redirectPath = '/appointments/confirm'
      page.next.mockReturnValue(redirectPath)

      const requestHandler = bulkUpdateController.submitUpdate()

      await requestHandler(
        createMock<Request>({
          query: { form: formId },
          params: { projectCode, date },
          body: { appointments: ['apt-1', 'apt-2'] },
        }),
        response,
        next,
      )

      expect(appointmentService.getAppointment).toHaveBeenNthCalledWith(1, {
        username,
        projectCode,
        appointmentId: 'apt-1',
      })
      expect(appointmentService.getAppointment).toHaveBeenNthCalledWith(2, {
        username,
        projectCode,
        appointmentId: 'apt-2',
      })
      expect(page.getFormData).toHaveBeenCalledWith(formData, appointments)
      expect(appointmentFormService.saveForm).toHaveBeenCalledWith(formId, username, updatedFormData)
      expect(response.redirect).toHaveBeenCalledWith(redirectPath)
    })
  })
})
