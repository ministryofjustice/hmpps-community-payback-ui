import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import LogHoursController from './logHoursController'
import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import offenderFullFactory from '../../testutils/factories/offenderFullFactory'
import { generateErrorSummary } from '../../utils/errorUtils'
import LogHoursPage from '../../pages/appointments/logHoursPage'
import AppointmentFormService from '../../services/appointmentFormService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'

jest.mock('../../pages/appointments/logHoursPage')
jest.mock('../../utils/errorUtils')

describe('logHoursController', () => {
  const userName = 'user'
  const appointment = appointmentFactory.build({ offender: offenderFullFactory.build() })

  const request = createMock<Request>({ params: { appointmentId: appointment.id.toString() } })
  const response = createMock<Response>({ locals: { user: { username: userName } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const logHoursPage: jest.Mock = LogHoursPage as unknown as jest.Mock<LogHoursPage>
  const generateErrorSummaryMock: jest.Mock = generateErrorSummary as jest.Mock
  const pageViewData = {
    someKey: 'some value',
  }

  let logHoursController: LogHoursController
  const appointmentService = createMock<AppointmentService>()
  const formService = createMock<AppointmentFormService>()

  beforeEach(() => {
    jest.resetAllMocks()
    logHoursController = new LogHoursController(appointmentService, formService)
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
        logHoursPage.mockImplementationOnce(() => ({
          viewData: () => pageViewData,
          validate: () => {},
          hasErrors: true,
          validationErrors: errors,
        }))

        const errorSummary = {
          text: 'errors',
          href: '#link',
        }
        generateErrorSummaryMock.mockImplementation(() => errorSummary)

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

      beforeEach(() => {
        logHoursPage.mockImplementationOnce(() => ({
          formId,
          validate: () => {},
          hasErrors: false,
          validationErrors: {},
          next: () => nextPath,
          updateForm: () => formToSave,
        }))

        appointmentService.getAppointment.mockResolvedValue(appointment)
      })

      it('should redirect to the next page', async () => {
        const requestHandler = logHoursController.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(nextPath)
      })

      it('should handle form progress', async () => {
        const existingForm = appointmentOutcomeFormFactory.build({ startTime: '09:00' })

        formService.getForm.mockResolvedValue(existingForm)

        const requestHandler = logHoursController.submit()
        await requestHandler(request, response, next)

        expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
        expect(formService.saveForm).toHaveBeenCalledWith(formId, userName, formToSave)
      })
    })
  })
})
