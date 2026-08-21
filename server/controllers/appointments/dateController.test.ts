import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import SessionService from '../../services/sessionService'
import OffenderService from '../../services/offenderService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'
import DateController from './dateController'
import DatePage from '../../pages/appointments/datePage'

jest.mock('../shared/getAppointmentOrSession')

describe('DateController', () => {
  const userName = 'user'
  const appointmentId = '1'
  const projectCode = '2'
  const formId = '123'
  const request = createMock<Request>({ params: { appointmentId, projectCode }, query: { form: formId } })
  const response = createMock<Response>({ locals: { user: { username: userName } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const getAppointmentOrSessionMock: jest.Mock = getAppointmentOrSession as unknown as jest.Mock

  let dateController: DateController
  const appointmentService = createMock<AppointmentService>()
  const formService = createMock<AppointmentFormService>()
  const sessionService = createMock<SessionService>()
  const offenderService = createMock<OffenderService>()

  beforeEach(() => {
    jest.resetAllMocks()

    dateController = new DateController(appointmentService, formService, sessionService, offenderService)

    getAppointmentOrSessionMock.mockResolvedValue({ appointment: appointmentFactory.build() })
  })

  describe('show', () => {
    it('should throw when the form is not a create appointment form', async () => {
      const form = appointmentOutcomeFormFactory.build()
      formService.getForm.mockResolvedValue(form)
      jest
        .spyOn(DatePage.prototype, 'commonViewData')
        .mockReturnValue({ heading: { title: '', caption: '' }, backLink: '', updatePath: '' })

      const requestHandler = dateController.show()

      await expect(requestHandler(request, response, next)).rejects.toThrow(
        'Date form step is currently only implemented for create appointment journey.',
      )
    })
  })
})
