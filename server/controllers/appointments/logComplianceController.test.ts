import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import offenderFullFactory from '../../testutils/factories/offenderFullFactory'
import LogComplianceController from './logComplianceController'
import LogCompliancePage from '../../pages/appointments/logCompliancePage'

jest.mock('../../models/offender')
jest.mock('../../pages/appointments/logCompliancePage')

describe('logComplianceController', () => {
  const appointment = appointmentFactory.build({ offender: offenderFullFactory.build() })

  const request = createMock<Request>({ params: { appointmentId: appointment.id.toString() } })
  const response = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  let logComplianceController: LogComplianceController
  const appointmentService = createMock<AppointmentService>()

  const logCompliancePageMock: jest.Mock = LogCompliancePage as unknown as jest.Mock<LogCompliancePage>
  const pageViewData = {
    someKey: 'some value',
  }

  beforeEach(() => {
    jest.resetAllMocks()
    logComplianceController = new LogComplianceController(appointmentService)
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
      it('should redirect to the confirm details page', async () => {
        const nextPath = '/nextPath'
        appointmentService.getAppointment.mockResolvedValue(appointment)

        logCompliancePageMock.mockImplementationOnce(() => {
          return {
            validate: () => {},
            hasError: false,
            next: () => nextPath,
          }
        })

        const requestHandler = logComplianceController.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(nextPath)
      })
    })
  })
})
