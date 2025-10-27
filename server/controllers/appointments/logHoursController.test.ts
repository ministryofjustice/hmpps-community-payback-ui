import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import LogHoursController from './logHoursController'
import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import offenderFullFactory from '../../testutils/factories/offenderFullFactory'
import generateErrorSummary from '../../utils/errorUtils'
import LogHoursPage from '../../pages/appointments/logHoursPage'


jest.mock('../../pages/appointments/logHoursPage')
jest.mock('../../utils/errorUtils')


describe('logHoursController', () => {
  const appointment = appointmentFactory.build({ offender: offenderFullFactory.build() })

  const request = createMock<Request>({ params: { appointmentId: appointment.id.toString() } })
  const response = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
    const logHoursPage: jest.Mock =
      LogHoursPage as unknown as jest.Mock<LogHoursPage>
    const generateErrorSummaryMock: jest.Mock = generateErrorSummary as jest.Mock
    const pageViewData = {
      someKey: 'some value',
    }

  let logHoursController: LogHoursController
  const appointmentService = createMock<AppointmentService>()

  beforeEach(() => {
    jest.resetAllMocks()
    logHoursController = new LogHoursController(appointmentService)
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

        expect(response.render).toHaveBeenCalledWith(
          'appointments/update/logHours',
          {...pageViewData, errors, errorSummary}
        )
      })
    })

    describe('when there are no validation errors', () => {
      it('should redirect to the next page', async () => {
        const nextPath = '/next'

        logHoursPage.mockImplementationOnce(() => ({
          validate: () => {},
          hasErrors: false,
          validationErrors: {},
          next: () => nextPath,
          form: () => {},
        }))

        appointmentService.getAppointment.mockResolvedValue(appointment)

        const requestHandler = logHoursController.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(nextPath)
      })
    })
  })
})
