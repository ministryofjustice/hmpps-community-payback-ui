import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import UpdateTravelTimePage from '../../pages/appointments/updateTravelTimePage'
import AdjustTravelTimeController from './adjustTravelTimeController'
import paths from '../../paths'
import AppointmentService from '../../services/appointmentService'
import Offender from '../../models/offender'
import ProviderService from '../../services/providerService'
import SearchTravelTimePage from '../../pages/appointments/searchTravelTimePage'
import OffenderService from '../../services/offenderService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import * as ErrorUtils from '../../utils/errorUtils'
import ReferenceDataService from '../../services/referenceDataService'
import { contactOutcomesFactory } from '../../testutils/factories/contactOutcomeFactory'

describe('AdjustTravelTimeController', () => {
  const username = 'user'
  const templatePath = 'appointments/update/travelTime/update'
  const page = createMock<UpdateTravelTimePage>()
  const appointmentService = createMock<AppointmentService>()
  const providerService = createMock<ProviderService>()
  const offenderService = createMock<OffenderService>()
  const referenceDataService = createMock<ReferenceDataService>()
  const response = createMock<Response>({ locals: { user: { username } } })
  const next = createMock<NextFunction>({})
  let controller: AdjustTravelTimeController

  const providerItems = [{ text: 'Provider 1', value: '1' }]

  beforeEach(() => {
    jest.resetAllMocks()
    controller = new AdjustTravelTimeController(
      page,
      providerService,
      appointmentService,
      offenderService,
      referenceDataService,
    )
  })

  describe('index', () => {
    it('should render the page', async () => {
      jest
        .spyOn(controller, 'getProviders' as unknown as keyof typeof controller)
        .mockResolvedValue({ providerItems } as never)

      const request = createMock<Request>()
      const requestHandler = controller.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/travelTime/index', {
        form: { providerItems },
        backLink: '/',
        rows: [],
      })
    })
  })

  describe('filter', () => {
    it('renders the index page with search results', async () => {
      jest
        .spyOn(controller, 'getProviders' as unknown as keyof typeof controller)
        .mockResolvedValue({ providerItems } as never)

      const request = createMock<Request>()
      request.query = { provider: 'N123' }

      const requestHandler = controller.filter()

      const rows = [[{ text: 'some value' }, { text: 'some other value' }]]
      jest.spyOn(SearchTravelTimePage, 'getRows').mockReturnValue(rows)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/travelTime/index', {
        form: { providerItems },
        backLink: '/',
        rows,
      })
    })
  })

  describe('update', () => {
    const viewData = {
      offender: { crn: '1234', name: 'Sam Smith', isLimited: false } as Offender,
      backLink: '/back',
      updatePath: '/update',
      completeTaskPath: '/complete',
      appointment: {
        date: '10 Jan 2024',
        startTime: '09:00',
        endTime: '17:00',
        contactOutcome: 'Attended',
      },
    }
    const appointmentId = '1'
    const projectCode = '2'
    const taskId = '123'
    const params = { appointmentId, projectCode, taskId }

    beforeEach(() => {
      page.viewData.mockReturnValue(viewData)
      appointmentService.getAppointment.mockResolvedValue(appointmentFactory.build())
      referenceDataService.getAvailableContactOutcomes.mockResolvedValue(contactOutcomesFactory.build())
    })

    it('should render the page', async () => {
      const request = createMock<Request>({ params })

      const requestHandler = controller.update()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, viewData)
    })

    it('should render any errors', async () => {
      const errorMessages = ['some error', 'another error']
      const errorList = [{ text: 'Some error' }, { text: 'Another error' }]
      jest.spyOn(ErrorUtils, 'generateErrorTextList').mockReturnValue(errorList)

      const request = createMock<Request>({ params })
      const responseWithErrors = createMock<Response>({
        locals: { user: { username }, errorMessages },
      })

      const requestHandler = controller.update()

      await requestHandler(request, responseWithErrors, next)

      expect(responseWithErrors.render).toHaveBeenCalledWith(templatePath, { ...viewData, errorList })
      expect(ErrorUtils.generateErrorTextList).toHaveBeenCalledWith(errorMessages)
    })
  })

  describe('submitUpdate', () => {
    const viewData = {
      offender: { crn: '1234', name: 'Sam Smith', isLimited: false } as Offender,
      backLink: '/back',
      updatePath: '/update',
      completeTaskPath: '/complete',
      appointment: {
        date: '10 Jan 2024',
        startTime: '09:00',
        endTime: '17:00',
        contactOutcome: 'Attended',
      },
    }
    const appointmentId = '1'
    const projectCode = '2'
    const taskId = '123'
    const params = { appointmentId, projectCode, taskId }

    beforeEach(() => {
      page.viewData.mockReturnValue(viewData)
      appointmentService.getAppointment.mockResolvedValue(appointmentFactory.build())
      referenceDataService.getAvailableContactOutcomes.mockResolvedValue(contactOutcomesFactory.build())
    })

    describe('no errors', () => {
      it('submits and redirects to the next page', async () => {
        const appointment = appointmentFactory.build()
        appointmentService.getAppointment.mockResolvedValue(appointment)

        page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })
        const requestBody = { taskId: '1', minutes: 12 }
        page.requestBody.mockReturnValue(requestBody)

        const body = { hours: '1', minutes: '2' }
        const request = createMock<Request>({ params, body })

        const requestHandler = controller.submitUpdate()
        await requestHandler(request, response, next)

        expect(page.requestBody).toHaveBeenCalledWith(body, taskId)

        expect(offenderService.adjustTravelTime).toHaveBeenCalledWith(
          {
            username,
            deliusEventNumber: appointment.deliusEventNumber,
            crn: appointment.offender.crn,
          },
          requestBody,
        )
        expect(response.redirect).toHaveBeenCalledWith(paths.appointments.travelTime.index({}))
      })

      it('calls catchApiValidationErrorOrPropagate when saveResolution throws a SanitisedError', async () => {
        page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })
        jest.spyOn(ErrorUtils, 'catchApiValidationErrorOrPropagate')
        const error: SanitisedError = {
          name: 'SanitisedError',
          message: 'API error',
          responseStatus: 400,
          data: {
            userMessage: 'An error occurred',
            developerMessage: 'Developer message',
            status: 400,
          },
        }

        page.requestBody.mockReturnValue({ taskId: '1', minutes: 1 })
        const path = '/path'
        page.updatePath.mockReturnValue(path)
        offenderService.adjustTravelTime.mockRejectedValue(error)

        const body = { hours: '1', minutes: '2' }
        const request = createMock<Request>({ params, body })

        const requestHandler = controller.submitUpdate()
        await requestHandler(request, response, next)

        expect(ErrorUtils.catchApiValidationErrorOrPropagate).toHaveBeenCalledWith(request, response, error, path)
      })
    })

    describe('has errors', () => {
      it('rerenders page if validation errors', async () => {
        const errorSummary = [{ text: 'Error 1', href: '#1', attributes: { 'some-attr': 'value' } }]
        const errors = { hours: { text: 'Error' } }
        page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

        const body = { hours: 't', minutes: 'r' }
        const request = createMock<Request>({ params, body })

        const requestHandler = controller.submitUpdate()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(templatePath, {
          ...viewData,
          errors,
          errorSummary,
          time: body,
        })

        expect(page.validationErrors).toHaveBeenCalledWith(body)
      })
    })
  })

  describe('completeTask', () => {
    it('submits request and redirects with success message', async () => {
      const appointmentId = '1'
      const projectCode = '2'
      const taskId = '123'
      const params = { appointmentId, projectCode, taskId }

      const appointment = appointmentFactory.build()
      appointmentService.getAppointment.mockResolvedValue(appointment)

      const successMessage = 'success'
      page.successMessage.mockReturnValue(successMessage)

      const request = createMock<Request>({ params })

      const requestHandler = controller.completeTask()
      await requestHandler(request, response, next)

      expect(appointmentService.completeAppointmentTask).toHaveBeenLastCalledWith(username, taskId)
      expect(request.flash).toHaveBeenCalledWith('success', successMessage)
      expect(response.redirect).toHaveBeenCalledWith(paths.appointments.travelTime.index({}))
    })
  })
})
