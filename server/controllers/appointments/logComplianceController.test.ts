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
  let logHoursController: LogComplianceController
  const appointmentService = createMock<AppointmentService>()

  const logCompliancePageMock: jest.Mock = LogCompliancePage as unknown as jest.Mock<LogCompliancePage>
  const pageViewData = {
    someKey: 'some value',
  }

  beforeEach(() => {
    jest.resetAllMocks()
    logHoursController = new LogComplianceController(appointmentService)
  })

  describe('show', () => {
    it('should render the log hours page', async () => {
      appointmentService.getAppointment.mockResolvedValue(appointment)
      logCompliancePageMock.mockImplementationOnce(() => {
        return {
          viewData: () => pageViewData,
        }
      })

      const requestHandler = logHoursController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/logCompliance', pageViewData)
    })
  })
})
