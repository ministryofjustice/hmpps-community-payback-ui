import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import offenderFullFactory from '../../testutils/factories/offenderFullFactory'
import LogComplianceController from './logComplianceController'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'
import AppointmentFormService from '../../services/appointmentFormService'

jest.mock('../../models/offender')
jest.mock('../../pages/appointments/logCompliancePage')

describe('logComplianceController', () => {
  const userName = 'user'
  const appointment = appointmentFactory.build({ offender: offenderFullFactory.build() })

  const request = createMock<Request>({ params: { appointmentId: appointment.id.toString() } })
  const response = createMock<Response>({ locals: { user: { name: userName } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  let logComplianceController: LogComplianceController
  const appointmentService = createMock<AppointmentService>()
  const formService = createMock<AppointmentFormService>()

  const logCompliancePageMock: jest.Mock = LogCompliancePage as unknown as jest.Mock<LogCompliancePage>
  const pageViewData = {
    someKey: 'some value',
  }

  beforeEach(() => {
    jest.resetAllMocks()
    logComplianceController = new LogComplianceController(appointmentService, formService)
  })

  describe('show', () => {
    it('should render the log compliance page', async () => {
      appointmentService.getAppointment.mockResolvedValue(appointment)
      logCompliancePageMock.mockImplementationOnce(() => {
        return {
          viewData: () => pageViewData,
        }
      })

      const requestHandler = logComplianceController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/logCompliance', pageViewData)
    })
  })

  describe('submit', () => {
    describe('when a validation error occurs', () => {
      it('should render the log compliance page with errors', async () => {
        const requestWithoutFormData = createMock<Request>({
          ...request,
          body: {},
        })

        appointmentService.getAppointment.mockResolvedValue(appointment)

        logCompliancePageMock.mockImplementationOnce(() => {
          return {
            viewData: () => pageViewData,
            validate: () => {},
            hasError: true,
            validationErrors: { field: { text: 'Enter a value for field' } },
          }
        })

        const requestHandler = logComplianceController.submit()
        await requestHandler(requestWithoutFormData, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'appointments/update/logCompliance',
          expect.objectContaining({
            errorSummary: [
              {
                text: 'Enter a value for field',
                href: '#field',
                attributes: { 'data-cy-error-field': 'Enter a value for field' },
              },
            ],
            errors: { field: { text: 'Enter a value for field' } },
          }),
        )
      })
    })

    describe('when no validation errrors occur', () => {
      const nextPath = '/nextPath'
      const formToSave = { startTime: '09:00', contactOutcomeId: '1' }
      const formId = '123'

      beforeEach(() => {
        appointmentService.getAppointment.mockResolvedValue(appointment)

        logCompliancePageMock.mockImplementationOnce(() => {
          return {
            formId,
            validate: () => {},
            hasError: false,
            next: () => nextPath,
            form: () => formToSave,
          }
        })
      })

      it('should redirect to the confirm details page', async () => {
        const requestHandler = logComplianceController.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(nextPath)
      })

      it('should handle form progress', async () => {
        const existingForm = { key: { id: formId, type: 'Some_type' }, data: { startTime: '09:00' } }

        formService.getForm.mockResolvedValue(existingForm)

        const requestHandler = logComplianceController.submit()
        await requestHandler(request, response, next)

        expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
        expect(formService.saveForm).toHaveBeenCalledWith(formId, userName, formToSave)
      })
    })
  })
})
