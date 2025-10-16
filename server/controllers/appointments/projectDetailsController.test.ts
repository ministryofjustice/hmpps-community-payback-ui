import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import CheckProjectDetailsPage from '../../pages/appointments/checkProjectDetailsPage'
import paths from '../../paths'
import AppointmentService from '../../services/appointmentService'
import ProviderService from '../../services/providerService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import supervisorSummaryFactory from '../../testutils/factories/supervisorSummaryFactory'
import generateErrorSummary from '../../utils/errorUtils'
import ProjectDetailsController from './projectDetailsController'

jest.mock('../../pages/appointments/checkProjectDetailsPage')
jest.mock('../../utils/errorUtils')

describe('AppointmentsController', () => {
  const appointmentId = '1'
  const request: DeepMocked<Request> = createMock<Request>({ params: { appointmentId } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const checkProjectDetailsPageMock: jest.Mock =
    CheckProjectDetailsPage as unknown as jest.Mock<CheckProjectDetailsPage>
  const generateErrorSummaryMock: jest.Mock = generateErrorSummary as jest.Mock
  const pageViewData = {
    someKey: 'some value',
  }

  let appointmentsController: ProjectDetailsController
  const appointmentService = createMock<AppointmentService>()
  const providerDataService = createMock<ProviderService>()

  beforeEach(() => {
    jest.resetAllMocks()
    appointmentsController = new ProjectDetailsController(appointmentService, providerDataService)
  })

  describe('show', () => {
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

      const requestHandler = appointmentsController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/projectDetails',
        expect.objectContaining({
          ...pageViewData,
        }),
      )
    })
  })

  describe('submit', () => {
    it('should return view if errors', async () => {
      const errors = { someKey: { text: 'some error' } }
      checkProjectDetailsPageMock.mockImplementationOnce(() => ({
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

      const appointment = appointmentFactory.build()
      const supervisors = supervisorSummaryFactory.buildList(2)

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      providerDataService.getSupervisors.mockResolvedValue(supervisors)

      const requestHandler = appointmentsController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/projectDetails',
        expect.objectContaining({
          errors,
          errorSummary,
          ...pageViewData,
        }),
      )
    })

    it('should redirect if no errors', async () => {
      checkProjectDetailsPageMock.mockImplementationOnce(() => ({
        validate: () => {},
        hasErrors: false,
        validationErrors: {},
      }))

      const appointment = appointmentFactory.build()
      const supervisors = supervisorSummaryFactory.buildList(2)

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      providerDataService.getSupervisors.mockResolvedValue(supervisors)

      jest.spyOn(paths.appointments, 'attendanceOutcome').mockReturnValue('/attendance-outcome')

      const requestHandler = appointmentsController.submit()
      await requestHandler(request, response, next)

      expect(paths.appointments.attendanceOutcome).toHaveBeenCalledWith({ appointmentId })

      expect(response.redirect).toHaveBeenCalledWith('/attendance-outcome')
    })
  })
})
