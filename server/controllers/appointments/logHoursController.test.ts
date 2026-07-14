import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import LogHoursController from './logHoursController'
import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import offenderFullFactory from '../../testutils/factories/offenderFullFactory'
import LogHoursPage from '../../pages/appointments/logHoursPage'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import SessionService from '../../services/sessionService'

jest.mock('../../pages/appointments/logHoursPage')

describe('logHoursController', () => {
  const userName = 'user'
  const appointment = appointmentFactory.build({ offender: offenderFullFactory.build() })

  const request = createMock<Request>({ params: { appointmentId: appointment.id.toString() } })
  const response = createMock<Response>({ locals: { user: { username: userName } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const logHoursPage: jest.Mock = LogHoursPage as unknown as jest.Mock<LogHoursPage>
  const pageViewData = {
    someKey: 'some value',
  }

  let logHoursController: LogHoursController
  const appointmentService = createMock<AppointmentService>()
  const formService = createMock<AppointmentFormService>()
  const sessionService = createMock<SessionService>()

  beforeEach(() => {
    jest.resetAllMocks()
    logHoursController = new LogHoursController(appointmentService, formService, sessionService)
  })

  describe('show', () => {
    it('should render the log hours page', async () => {
      logHoursPage.mockImplementationOnce(() => {
        return {
          viewData: () => pageViewData,
        }
      })
      appointmentService.getAppointment.mockResolvedValue(appointment)

      const requestHandler = logHoursController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/logHours', pageViewData)
    })
  })

  describe('submit', () => {
    describe('when a validation error occurs', () => {
      it('should render the log hours page with errors', async () => {
        const errors = { someKey: { text: 'some error' } }
        const errorSummary = [{ text: 'errors', href: '#link' }]
        logHoursPage.mockImplementationOnce(() => ({
          viewData: () => pageViewData,
          validationErrors: () => ({
            hasErrors: true,
            errors,
            errorSummary,
          }),
        }))

        appointmentService.getAppointment.mockResolvedValue(appointment)

        const requestHandler = logHoursController.submit()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('appointments/update/logHours', {
          ...pageViewData,
          errors,
          errorSummary,
        })
      })
    })

    describe('when there are no validation errors', () => {
      const nextPath = '/next'
      const formToSave = { startTime: '09:00', contactOutcomeId: '1' }
      const formId = '123'
      const submitRequest = createMock<Request>({
        params: { appointmentId: appointment.id.toString() },
        body: { form: formId },
      })

      beforeEach(() => {
        logHoursPage.mockImplementationOnce(() => ({
          validationErrors: () => ({
            hasErrors: false,
            errors: {},
          }),
          next: () => nextPath,
          updateForm: () => formToSave,
        }))

        appointmentService.getAppointment.mockResolvedValue(appointment)
      })

      it('should redirect to the next page', async () => {
        const requestHandler = logHoursController.submit()
        await requestHandler(submitRequest, response, next)

        expect(response.redirect).toHaveBeenCalledWith(nextPath)
      })

      it('should handle form progress', async () => {
        const existingForm = appointmentOutcomeFormFactory.build({ startTime: '09:00' })

        formService.getForm.mockResolvedValue(existingForm)

        const requestHandler = logHoursController.submit()
        await requestHandler(submitRequest, response, next)

        expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
        expect(formService.saveForm).toHaveBeenCalledWith(formId, userName, formToSave)
      })
    })
  })
})
