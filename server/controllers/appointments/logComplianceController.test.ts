import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import AppointmentService from '../../services/appointmentService'
import paths from '../../paths'
import Offender from '../../models/offender'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import offenderFullFactory from '../../testutils/factories/offenderFullFactory'
import LogComplianceController from './logComplianceController'

jest.mock('../../models/offender')

describe('logComplianceController', () => {
  const appointment = appointmentFactory.build({ offender: offenderFullFactory.build() })

  const request = createMock<Request>({ params: { appointmentId: appointment.id.toString() } })
  const response = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const offenderMock: jest.Mock = Offender as unknown as jest.Mock<Offender>
  const offender = {
    name: 'Sam Smith',
    crn: 'CRN123',
    isLimited: false,
  }

  let logHoursController: LogComplianceController
  const appointmentService = createMock<AppointmentService>()

  beforeEach(() => {
    jest.resetAllMocks()
    logHoursController = new LogComplianceController(appointmentService)
    offenderMock.mockImplementation(() => {
      return offender
    })
  })

  describe('show', () => {
    it('should render the log hours page', async () => {
      appointmentService.getAppointment.mockResolvedValue(appointment)

      const requestHandler = logHoursController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/logCompliance', {
        offender,
        updatePath: paths.appointments.logCompliance({ appointmentId: appointment.id.toString() }),
        backLink: paths.appointments.logHours({ appointmentId: appointment.id.toString() }),
      })
    })
  })
})
