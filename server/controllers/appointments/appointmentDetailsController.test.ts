import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import ProjectDetailsController from './appointmentDetailsController'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import { AppointmentOutcomeForm } from '../../@types/user-defined'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import ProjectService from '../../services/projectService'
import projectFactory from '../../testutils/factories/projectFactory'
import ReferenceDataService from '../../services/referenceDataService'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'

jest.mock('../../pages/appointments/checkAppointmentDetailsPage')
jest.mock('../../utils/errorUtils')

describe('AppointmentsController', () => {
  const userName = 'user'
  const appointmentId = '1'
  const formId = '123'
  const request: DeepMocked<Request> = createMock<Request>({ params: { appointmentId } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const checkAppointmentDetailsPageMock: jest.Mock =
    CheckAppointmentDetailsPage as unknown as jest.Mock<CheckAppointmentDetailsPage>
  const pageViewData = {
    someKey: 'some value',
  }

  let appointmentsController: ProjectDetailsController
  const appointmentService = createMock<AppointmentService>()
  const formService = createMock<AppointmentFormService>()
  const projectService = createMock<ProjectService>()
  const referenceDataService = createMock<ReferenceDataService>()

  beforeEach(() => {
    jest.resetAllMocks()
    appointmentsController = new ProjectDetailsController(
      appointmentService,
      formService,
      projectService,
      referenceDataService,
    )
  })

  describe('show', () => {
    it('should render the check appointment details page', async () => {
      checkAppointmentDetailsPageMock.mockImplementationOnce(() => {
        return {
          commonViewData: () => ({}),
          viewData: () => pageViewData,
        }
      })
      const appointment = appointmentFactory.build()
      const project = projectFactory.build()

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      projectService.getProject.mockResolvedValue(project)

      const requestHandler = appointmentsController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/appointmentDetails',
        expect.objectContaining({
          ...pageViewData,
        }),
      )
    })

    it('should create a form with the appointment if a form does not exist', async () => {
      const newFormId = 'some-id'
      const newForm = { key: { id: newFormId, type: 'some type' }, data: appointmentOutcomeFormFactory.build() }
      checkAppointmentDetailsPageMock.mockImplementationOnce(() => ({
        commonViewData: () => ({}),
        viewData: () => ({}),
      }))

      formService.createForm.mockResolvedValue(newForm)

      const requestHandler = appointmentsController.show()
      const response = createMock<Response>({ locals: { user: { username: userName } } })

      await requestHandler(request, response, next)

      expect(formService.createForm).toHaveBeenCalled()
    })

    it('should fetch the in progress form if it exists', async () => {
      const viewData = {
        someProp: '',
      }

      checkAppointmentDetailsPageMock.mockImplementationOnce(() => ({
        commonViewData: () => ({}),
        viewData: () => viewData,
      }))

      formService.getForm.mockResolvedValue(appointmentOutcomeFormFactory.build())

      const requestHandler = appointmentsController.show()
      const response = createMock<Response>({ locals: { user: { username: userName } } })
      const requestWithForm = createMock<Request>({
        params: { appointmentId: '1', projectCode: '2' },
        query: { form: formId },
      })
      await requestHandler(requestWithForm, response, next)

      expect(formService.getForm).toHaveBeenCalledWith(formId, userName)
      expect(response.render).toHaveBeenCalledWith('appointments/update/appointmentDetails', viewData)
    })

    it('should call reference data service if appointment has a contact outcome code', async () => {
      const appointment = appointmentFactory.build({ contactOutcomeCode: 'OUTCOME_001' })
      const contactOutcome = contactOutcomeFactory.build({ code: 'OUTCOME_001' })

      checkAppointmentDetailsPageMock.mockImplementationOnce(() => ({
        viewData: () => ({}),
        commonViewData: () => ({}),
      }))

      appointmentService.getAppointment.mockResolvedValue(appointment)

      referenceDataService.getContactOutcome.mockResolvedValue(contactOutcome)

      const requestHandler = appointmentsController.show()
      const response = createMock<Response>({ locals: { user: { username: userName } } })

      await requestHandler(request, response, next)

      expect(referenceDataService.getContactOutcome).toHaveBeenCalledWith(userName, 'OUTCOME_001')
    })

    it('should not call reference data service if appointment does not have a contact outcome code', async () => {
      const appointment = appointmentFactory.build({ contactOutcomeCode: undefined })

      checkAppointmentDetailsPageMock.mockImplementationOnce(() => ({
        viewData: () => ({}),
        commonViewData: () => ({}),
      }))

      appointmentService.getAppointment.mockResolvedValue(appointment)
      formService.createForm.mockResolvedValue({
        key: { id: 'form-id', type: 'some-type' },
        data: appointmentOutcomeFormFactory.build(),
      })

      const requestHandler = appointmentsController.show()
      const response = createMock<Response>({ locals: { user: { username: userName } } })

      await requestHandler(request, response, next)

      expect(referenceDataService.getContactOutcome).not.toHaveBeenCalled()
    })
  })

  describe('submit', () => {
    it('should redirect if no errors', async () => {
      const nextPath = '/nextPath'
      checkAppointmentDetailsPageMock.mockImplementationOnce(() => ({
        validate: () => {},
        hasErrors: false,
        validationErrors: {},
        next: () => nextPath,
        updateForm: (args: AppointmentOutcomeForm) => args,
      }))

      const appointment = appointmentFactory.build()
      const project = projectFactory.build()

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      projectService.getProject.mockResolvedValue(project)

      const requestHandler = appointmentsController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
    })
  })
})
