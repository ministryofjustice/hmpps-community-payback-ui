import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import LogHoursController from './logHoursController'
import AppointmentService from '../../services/appointmentService'
import paths from '../../paths'
import Offender from '../../models/offender'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import offenderFullFactory from '../../testutils/factories/offenderFullFactory'

jest.mock('../../models/offender')

describe('logHoursController', () => {
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

  let logHoursController: LogHoursController
  const appointmentService = createMock<AppointmentService>()

  beforeEach(() => {
    jest.resetAllMocks()
    logHoursController = new LogHoursController(appointmentService)
    offenderMock.mockImplementation(() => {
      return offender
    })
  })

  describe('show', () => {
    it('should render the log hours page', async () => {
      appointmentService.getAppointment.mockResolvedValue(appointment)

      const requestHandler = logHoursController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/logHours', {
        offender,
        updatePath: paths.appointments.logHours({ appointmentId: appointment.id.toString() }),
        backLink: paths.appointments.attendanceOutcome({ appointmentId: appointment.id.toString() }),
      })
    })
  })
})
