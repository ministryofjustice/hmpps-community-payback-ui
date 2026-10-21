import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import CheckAppointmentDetailsPage from '../../pages/appointments/checkAppointmentDetailsPage'
import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import ProjectDetailsController from './appointmentDetailsController'
import AppointmentFormService, { AppointmentOutcomeForm } from '../../services/forms/appointmentFormService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import ProjectService from '../../services/projectService'
import projectFactory from '../../testutils/factories/projectFactory'
import ReferenceDataService from '../../services/referenceDataService'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'
import config from '../../config'
import appointmentDocumentFactory from '../../testutils/factories/appointmentDocumentFactory'
import OffenderService from '../../services/offenderService'
import UnpaidWorkUtils from '../../utils/unpaidWorkUtils'
import unpaidWorkDetailsFactory from '../../testutils/factories/unpaidWorkDetailsFactory'

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
  const offenderService = createMock<OffenderService>()

  beforeEach(() => {
    jest.resetAllMocks()
    appointmentsController = new ProjectDetailsController(
      appointmentService,
      formService,
      projectService,
      referenceDataService,
      offenderService,
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

      formService.createUpdateAppointmentForm.mockResolvedValue(newForm)

      const requestHandler = appointmentsController.show()
      const response = createMock<Response>({ locals: { user: { username: userName } } })

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalled()
      expect(formService.createUpdateAppointmentForm).toHaveBeenCalled()
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
      formService.createUpdateAppointmentForm.mockResolvedValue({
        key: { id: 'form-id', type: 'some-type' },
        data: appointmentOutcomeFormFactory.build(),
      })

      const requestHandler = appointmentsController.show()
      const response = createMock<Response>({ locals: { user: { username: userName } } })

      await requestHandler(request, response, next)

      expect(referenceDataService.getContactOutcome).not.toHaveBeenCalled()
    })

    describe('documents', () => {
      const appointment = appointmentFactory.build()
      const documents = appointmentDocumentFactory.buildList(1)
      const viewData = jest.fn().mockReturnValue({})

      beforeEach(() => {
        checkAppointmentDetailsPageMock.mockImplementationOnce(() => ({
          viewData,
          commonViewData: () => ({}),
        }))
        appointmentService.getAppointment.mockResolvedValue(appointment)
        appointmentService.getDocuments.mockResolvedValue(documents)
        formService.createUpdateAppointmentForm.mockResolvedValue({
          key: { id: 'form-id', type: 'some-type' },
          data: appointmentOutcomeFormFactory.build(),
        })
      })

      afterEach(() => {
        jest.restoreAllMocks()
      })

      it('should fetch documents and pass them to the page if the document upload feature flag is enabled', async () => {
        jest.replaceProperty(config, 'featureFlags', { ...config.featureFlags, documentUploadEnabled: true })

        const requestHandler = appointmentsController.show()
        const response = createMock<Response>({ locals: { user: { username: userName } } })

        await requestHandler(request, response, next)

        expect(appointmentService.getDocuments).toHaveBeenCalledWith(appointmentId, userName)
        expect(viewData).toHaveBeenCalledWith(expect.objectContaining({ documents }))
      })

      it('should not fetch documents if the document upload feature flag is disabled', async () => {
        jest.replaceProperty(config, 'featureFlags', { ...config.featureFlags, documentUploadEnabled: false })

        const requestHandler = appointmentsController.show()
        const response = createMock<Response>({ locals: { user: { username: userName } } })

        await requestHandler(request, response, next)

        expect(appointmentService.getDocuments).not.toHaveBeenCalled()
        expect(viewData).toHaveBeenCalledWith(expect.objectContaining({ documents: [] }))
      })
    })

    describe('unpaid work hours', () => {
      const appointment = appointmentFactory.build()

      beforeEach(() => {
        jest.replaceProperty(config, 'featureFlags', { ...config.featureFlags, displayHoursDetailsEnabled: true })
        checkAppointmentDetailsPageMock.mockImplementationOnce(() => ({
          viewData: () => ({}),
          commonViewData: () => ({}),
        }))
        appointmentService.getAppointment.mockResolvedValue(appointment)
        formService.createUpdateAppointmentForm.mockResolvedValue({
          key: { id: 'form-id', type: 'some-type' },
          data: appointmentOutcomeFormFactory.build(),
        })
      })

      afterEach(() => {
        jest.restoreAllMocks()
      })

      it('should pass the unpaid work hours cards to the view if the unpaid work detail is defined', async () => {
        const unpaidWorkDetail = unpaidWorkDetailsFactory.build({ eventNumber: appointment.deliusEventNumber })
        const unpaidWorkHoursItems = [{ key: 'Hours ordered', value: '10 hours' }]
        offenderService.getOffenderUnpaidWorkDetail.mockResolvedValue(unpaidWorkDetail)
        const cardListSpy = jest.spyOn(UnpaidWorkUtils, 'unpaidWorkHoursCardList').mockReturnValue(unpaidWorkHoursItems)

        const requestHandler = appointmentsController.show()
        const response = createMock<Response>({ locals: { user: { username: userName } } })

        await requestHandler(request, response, next)

        expect(offenderService.getOffenderUnpaidWorkDetail).toHaveBeenCalledWith({
          username: userName,
          crn: appointment.offender.crn,
          deliusEventNumber: appointment.deliusEventNumber,
        })
        expect(cardListSpy).toHaveBeenCalledWith(unpaidWorkDetail)
        expect(response.render).toHaveBeenCalledWith(
          'appointments/update/appointmentDetails',
          expect.objectContaining({ unpaidWorkHoursItems }),
        )
      })

      it('should not pass unpaid work hours cards to the view if the unpaid work detail is undefined', async () => {
        offenderService.getOffenderUnpaidWorkDetail.mockResolvedValue(undefined)
        const cardListSpy = jest.spyOn(UnpaidWorkUtils, 'unpaidWorkHoursCardList')

        const requestHandler = appointmentsController.show()
        const response = createMock<Response>({ locals: { user: { username: userName } } })

        await requestHandler(request, response, next)

        expect(offenderService.getOffenderUnpaidWorkDetail).toHaveBeenCalledWith({
          username: userName,
          crn: appointment.offender.crn,
          deliusEventNumber: appointment.deliusEventNumber,
        })
        expect(cardListSpy).not.toHaveBeenCalled()
        expect(response.render).toHaveBeenCalledWith(
          'appointments/update/appointmentDetails',
          expect.objectContaining({ unpaidWorkHoursItems: undefined }),
        )
      })
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

      const requestHandler = appointmentsController.submitUpdate()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
    })
  })
})
