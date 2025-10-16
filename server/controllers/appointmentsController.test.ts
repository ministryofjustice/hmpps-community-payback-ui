import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import AppointmentService from '../services/appointmentService'
import AppointmentsController from './appointmentsController'
import appointmentFactory from '../testutils/factories/appointmentFactory'
import ProviderService from '../services/providerService'
import CheckProjectDetailsPage from '../pages/appointments/checkProjectDetailsPage'
import supervisorSummaryFactory from '../testutils/factories/supervisorSummaryFactory'

jest.mock('../pages/appointments/checkProjectDetailsPage')

describe('AppointmentsController', () => {
  const appointmentId = '1'
  const request: DeepMocked<Request> = createMock<Request>({ params: { appointmentId } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const checkProjectDetailsPageMock: jest.Mock =
    CheckProjectDetailsPage as unknown as jest.Mock<CheckProjectDetailsPage>
  const pageViewData = {
    someKey: 'some value',
  }

  let appointmentsController: AppointmentsController
  const appointmentService = createMock<AppointmentService>()
  const providerDataService = createMock<ProviderService>()

  beforeEach(() => {
    jest.resetAllMocks()
    appointmentsController = new AppointmentsController(appointmentService, providerDataService)
  })

  describe('projectDetails', () => {
    it('should render the check project details page', async () => {
      checkProjectDetailsPageMock.mockImplementationOnce(() => {
        return {
          viewData: () => pageViewData,
        }
      })
      const appointment = appointmentFactory.build()
      const supervisors = supervisorSummaryFactory.buildList(2)

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      providerDataService.getSupervisors.mockResolvedValue(supervisors)

      const requestHandler = appointmentsController.projectDetails()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/projectDetails',
        expect.objectContaining({
          ...pageViewData,
        }),
      )
    })
  })
})
