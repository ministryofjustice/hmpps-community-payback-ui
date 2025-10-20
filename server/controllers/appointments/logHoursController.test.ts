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
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        penaltyHours: appointment.attendanceData?.penaltyTime,
      })
    })
  })

  describe('submit', () => {
    describe('when a validation error occurs', () => {
      it('should render the log hours page with errors', async () => {
        const requestWithoutFormData = createMock<Request>({
          ...request,
          body: { startTime: null, endTime: '17:00' },
        })

        appointmentService.getAppointment.mockResolvedValue(appointment)

        const requestHandler = logHoursController.submit()
        await requestHandler(requestWithoutFormData, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'appointments/update/logHours',
          expect.objectContaining({
            errorSummary: [
              {
                text: 'Enter a start time',
                href: '#startTime',
                attributes: { 'data-cy-error-startTime': 'Enter a start time' },
              },
            ],
            errors: { startTime: { text: 'Enter a start time' } },
          }),
        )
      })
    })

    describe('when there are no validation errors', () => {
      it('should redirect to the next page', async () => {
        const requestWithFormData = createMock<Request>({
          ...request,
          body: { startTime: '09:00', endTime: '17:00' },
        })

        appointmentService.getAppointment.mockResolvedValue(appointment)

        const requestHandler = logHoursController.submit()
        await requestHandler(requestWithFormData, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          paths.appointments.logCompliance({ appointmentId: appointment.id.toString() }),
        )
      })
    })
  })
})
