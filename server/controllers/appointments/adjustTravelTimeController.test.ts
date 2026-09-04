import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import UpdateTravelTimePage from '../../pages/appointments/updateTravelTimePage'
import AdjustTravelTimeController from './adjustTravelTimeController'
import AppointmentService from '../../services/appointmentService'
import ProviderService from '../../services/providerService'
import SearchTravelTimePage from '../../pages/appointments/searchTravelTimePage'
import OffenderService from '../../services/offenderService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import * as ErrorUtils from '../../utils/errorUtils'
import ReferenceDataService from '../../services/referenceDataService'
import { contactOutcomesFactory } from '../../testutils/factories/contactOutcomeFactory'
import ProjectService from '../../services/projectService'
import projectFactory from '../../testutils/factories/projectFactory'
import pagedModelAppointmentTaskSummaryFactory from '../../testutils/factories/pagedModelAppointmentTaskSummaryFactory'
import pagedMetadataFactory from '../../testutils/factories/pagedMetadataFactory'
import { getPaginationRequestParams } from '../../utils/paginationUtils'
import AuditService from '../../services/auditService'
import AdjustmentService from '../../services/adjustmentService'
import adjustmentFactory from '../../testutils/factories/adjustmentFactory'
import DateTimeFormats from '../../utils/dateTimeUtils'
import paths from '../../paths'
import Offender from '../../models/offender'
import AdjustmentUtils from '../../utils/adjustmentUtils'

jest.mock('../../utils/paginationUtils')
jest.mock('../../pages/appointments/searchTravelTimePage')

describe('AdjustTravelTimeController', () => {
  const username = 'user'
  const templatePath = 'appointments/update/travelTime/update'
  const page = createMock<UpdateTravelTimePage>()
  const auditService = createMock<AuditService>()
  const appointmentService = createMock<AppointmentService>()
  const providerService = createMock<ProviderService>()
  const offenderService = createMock<OffenderService>()
  const referenceDataService = createMock<ReferenceDataService>()
  const projectService = createMock<ProjectService>()
  const adjustmentService = createMock<AdjustmentService>()
  const response = createMock<Response>({ locals: { user: { username } } })
  const next = createMock<NextFunction>({})
  let controller: AdjustTravelTimeController

  const getPaginationRequestParamsMock: jest.Mock = getPaginationRequestParams as unknown as jest.Mock<
    ReturnType<typeof getPaginationRequestParams>
  >

  const providerItems = [{ text: 'Provider 1', value: '1' }]

  const searchPageMock: jest.Mock = SearchTravelTimePage as unknown as jest.Mock<SearchTravelTimePage>

  beforeEach(() => {
    jest.resetAllMocks()
    controller = new AdjustTravelTimeController(
      page,
      auditService,
      providerService,
      appointmentService,
      offenderService,
      referenceDataService,
      projectService,
      adjustmentService,
    )

    searchPageMock.mockImplementation(() => {
      return {
        validationErrors: jest.fn().mockReturnValue({}),
      }
    })

    getPaginationRequestParamsMock.mockReturnValue({
      hrefPrefix: 'someHrefPrefix',
    })
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

      const tasks = pagedModelAppointmentTaskSummaryFactory.build({
        page: { ...pagedMetadataFactory.build(), number: 2 },
      })

      appointmentService.getAppointmentTasks.mockResolvedValue(tasks)

      const requestHandler = controller.filter()

      const tableHeaders = [
        { text: 'Name' },
        { text: 'CRN' },
        { text: 'date' },
        { text: 'Appointment type' },
        { text: 'Action' },
      ]
      const rows = [[{ text: 'some value' }, { text: 'some other value' }]]
      jest.spyOn(SearchTravelTimePage, 'getRows').mockReturnValue(rows)
      jest.spyOn(SearchTravelTimePage, 'tableHeaders').mockReturnValue(tableHeaders)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/travelTime/index', {
        form: { providerItems },
        backLink: '/',
        rows,
        tableHeaders,
        pageNumber: tasks.page.number,
        pageSize: tasks.page.size,
        totalElements: tasks.page.totalElements,
        totalPages: tasks.page.totalPages,
        hrefPrefix: 'someHrefPrefix',
      })
    })
  })

  describe('update', () => {
    const viewData = {
      heading: { caption: '1234', title: 'Sam Smith' },
      backLink: '/back',
      updatePath: '/update',
      completeTaskPath: '/complete',
      appointment: {
        date: '10 Jan 2024',
        startTime: '09:00',
        endTime: '17:00',
        contactOutcome: 'Attended',
      },
      project: {
        name: 'Project',
        type: 'Group',
      },
      preventDoubleClick: true,
      withAppointmentLink: false,
      appointmentLink: '',
    }
    const appointmentId = '1'
    const projectCode = '2'
    const taskId = '123'
    const params = { appointmentId, projectCode, taskId }

    beforeEach(() => {
      page.viewData.mockReturnValue(viewData)
      appointmentService.getAppointment.mockResolvedValue(appointmentFactory.build())
      referenceDataService.getAvailableContactOutcomes.mockResolvedValue(contactOutcomesFactory.build())
      projectService.getProject.mockResolvedValue(projectFactory.build())
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

    describe('isTask', () => {
      const paramsWithoutTaskId = { appointmentId, projectCode }

      describe('given taskId in params', () => {
        it('passes isTask as true to page.viewData', async () => {
          const appointment = appointmentFactory.build()
          const project = projectFactory.build()
          appointmentService.getAppointment.mockResolvedValue(appointment)
          projectService.getProject.mockResolvedValue(project)
          referenceDataService.getContactOutcome.mockResolvedValue(undefined)

          const request = createMock<Request>({ params, query: {} })

          const requestHandler = controller.update()
          await requestHandler(request, response, next)

          expect(page.viewData).toHaveBeenCalledWith({
            appointment,
            taskId,
            contactOutcome: undefined,
            project,
            originalSearch: {},
            req: request,
            isTask: true,
          })
        })
      })

      describe('given no taskId in params', () => {
        it('passes isTask as false to page.viewData', async () => {
          const appointment = appointmentFactory.build()
          const project = projectFactory.build()
          appointmentService.getAppointment.mockResolvedValue(appointment)
          projectService.getProject.mockResolvedValue(project)
          referenceDataService.getContactOutcome.mockResolvedValue(undefined)

          const request = createMock<Request>({ params: paramsWithoutTaskId, query: {} })

          const requestHandler = controller.update()
          await requestHandler(request, response, next)

          expect(page.viewData).toHaveBeenCalledWith({
            appointment,
            taskId: undefined,
            contactOutcome: undefined,
            project,
            originalSearch: {},
            req: request,
            isTask: false,
          })
        })
      })
    })
  })

  describe('submitUpdate', () => {
    const viewData = {
      heading: { caption: '1234', title: 'Sam Smith' },
      backLink: '/back',
      updatePath: '/update',
      completeTaskPath: '/complete',
      appointment: {
        date: '10 Jan 2024',
        startTime: '09:00',
        endTime: '17:00',
        contactOutcome: 'Attended',
      },
      project: {
        name: 'Project',
        type: 'Group',
      },
      preventDoubleClick: true,
      withAppointmentLink: false,
      appointmentLink: '',
    }
    const appointmentId = '1'
    const projectCode = '2'
    const taskId = '123'
    const params = { appointmentId, projectCode, taskId }

    beforeEach(() => {
      page.viewData.mockReturnValue(viewData)
      appointmentService.getAppointment.mockResolvedValue(appointmentFactory.build())
      referenceDataService.getAvailableContactOutcomes.mockResolvedValue(contactOutcomesFactory.build())
      projectService.getProject.mockResolvedValue(projectFactory.build())
    })

    describe('no errors', () => {
      it('submits and redirects to the next page', async () => {
        const redirectPath = '/next'
        const appointment = appointmentFactory.build()
        appointmentService.getAppointment.mockResolvedValue(appointment)

        page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })
        const requestBody = { appointmentId: appointment.communityPaybackId, minutes: 12 }
        page.requestBody.mockReturnValue(requestBody)

        const body = { hours: '1', minutes: '2' }
        const query = { provider: '1' }
        page.exitPath.mockReturnValue(redirectPath)
        const request = createMock<Request>({ params, body, query })

        const requestHandler = controller.submitUpdate()
        await requestHandler(request, response, next)

        expect(page.requestBody).toHaveBeenCalledWith(body, appointment)

        expect(offenderService.adjustTravelTime).toHaveBeenCalledWith(
          {
            username,
            deliusEventNumber: appointment.deliusEventNumber,
            crn: appointment.offender.crn,
          },
          requestBody,
        )
        expect(response.redirect).toHaveBeenCalledWith(redirectPath)
        expect(page.exitPath).toHaveBeenCalledWith(query, appointment, true)
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

        page.requestBody.mockReturnValue({ appointmentId: '1', minutes: 1 })
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
        const errors = { time: { text: 'Error' } }

        const appointment = appointmentFactory.build()
        appointmentService.getAppointment.mockResolvedValue(appointment)
        page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

        const body = { time: 60 }
        const request = createMock<Request>({ params, body })

        const requestHandler = controller.submitUpdate()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(templatePath, {
          ...viewData,
          errors,
          errorSummary,
        })

        expect(page.validationErrors).toHaveBeenCalledWith(body)
      })
    })

    describe('isTask', () => {
      const paramsWithoutTaskId = { appointmentId, projectCode }
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

      describe('given taskId in params', () => {
        it('passes isTask as true to page.viewData when there are validation errors', async () => {
          const errorSummary = [{ text: 'Error 1', href: '#1', attributes: { 'some-attr': 'value' } }]
          const errors = { time: { text: 'Error' } }
          const appointment = appointmentFactory.build()
          const project = projectFactory.build()

          appointmentService.getAppointment.mockResolvedValue(appointment)
          projectService.getProject.mockResolvedValue(project)
          referenceDataService.getContactOutcome.mockResolvedValue(undefined)
          page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

          const body = { time: 60 }
          const request = createMock<Request>({ params, body, query: {} })

          const requestHandler = controller.submitUpdate()
          await requestHandler(request, response, next)

          expect(page.viewData).toHaveBeenCalledWith({
            appointment,
            taskId,
            contactOutcome: undefined,
            project,
            originalSearch: {},
            req: request,
            isTask: true,
          })
        })

        it('calls page.exitPath with isTask as true on successful submission', async () => {
          const redirectPath = '/next'
          const appointment = appointmentFactory.build()
          appointmentService.getAppointment.mockResolvedValue(appointment)

          page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })
          const requestBody = { appointmentId: appointment.communityPaybackId, minutes: 12 }
          page.requestBody.mockReturnValue(requestBody)
          page.exitPath.mockReturnValue(redirectPath)

          const body = { hours: '1', minutes: '2' }
          const query = { provider: '1' }
          const request = createMock<Request>({ params, body, query })

          const requestHandler = controller.submitUpdate()
          await requestHandler(request, response, next)

          expect(page.exitPath).toHaveBeenCalledWith(query, appointment, true)
        })

        it('calls page.updatePath with isTask as true when submission fails', async () => {
          const appointment = appointmentFactory.build()
          appointmentService.getAppointment.mockResolvedValue(appointment)
          page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })
          page.requestBody.mockReturnValue({ appointmentId: '1', minutes: 1 })
          const path = '/path'
          page.updatePath.mockReturnValue(path)
          offenderService.adjustTravelTime.mockRejectedValue(error)

          const body = { hours: '1', minutes: '2' }
          const query = { provider: '1' }
          const request = createMock<Request>({ params, body, query })

          const requestHandler = controller.submitUpdate()
          await requestHandler(request, response, next)

          expect(page.updatePath).toHaveBeenCalledWith(appointment, taskId, query, true)
        })
      })

      describe('given no taskId in params', () => {
        it('passes isTask as false to page.viewData when there are validation errors', async () => {
          const errorSummary = [{ text: 'Error 1', href: '#1', attributes: { 'some-attr': 'value' } }]
          const errors = { time: { text: 'Error' } }
          const appointment = appointmentFactory.build()
          const project = projectFactory.build()

          appointmentService.getAppointment.mockResolvedValue(appointment)
          projectService.getProject.mockResolvedValue(project)
          referenceDataService.getContactOutcome.mockResolvedValue(undefined)
          page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

          const body = { time: 60 }
          const request = createMock<Request>({ params: paramsWithoutTaskId, body, query: {} })

          const requestHandler = controller.submitUpdate()
          await requestHandler(request, response, next)

          expect(page.viewData).toHaveBeenCalledWith({
            appointment,
            taskId: undefined,
            contactOutcome: undefined,
            project,
            originalSearch: {},
            req: request,
            isTask: false,
          })
        })

        it('calls page.exitPath with isTask as false on successful submission', async () => {
          const redirectPath = '/next'
          const appointment = appointmentFactory.build()
          appointmentService.getAppointment.mockResolvedValue(appointment)

          page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })
          const requestBody = { appointmentId: appointment.communityPaybackId, minutes: 12 }
          page.requestBody.mockReturnValue(requestBody)
          page.exitPath.mockReturnValue(redirectPath)

          const body = { hours: '1', minutes: '2' }
          const query = { provider: '1' }
          const request = createMock<Request>({ params: paramsWithoutTaskId, body, query })

          const requestHandler = controller.submitUpdate()
          await requestHandler(request, response, next)

          expect(page.exitPath).toHaveBeenCalledWith(query, appointment, false)
        })

        it('calls page.updatePath with isTask as false when submission fails', async () => {
          const appointment = appointmentFactory.build()
          appointmentService.getAppointment.mockResolvedValue(appointment)
          page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })
          page.requestBody.mockReturnValue({ appointmentId: '1', minutes: 1 })
          const path = '/path'
          page.updatePath.mockReturnValue(path)
          offenderService.adjustTravelTime.mockRejectedValue(error)

          const body = { hours: '1', minutes: '2' }
          const query = { provider: '1' }
          const request = createMock<Request>({ params: paramsWithoutTaskId, body, query })

          const requestHandler = controller.submitUpdate()
          await requestHandler(request, response, next)

          expect(page.updatePath).toHaveBeenCalledWith(appointment, undefined, query, false)
        })
      })
    })
  })

  describe('completeTask', () => {
    it('submits request and redirects with success message', async () => {
      const redirectPath = '/next'
      const appointmentId = '1'
      const projectCode = '2'
      const taskId = '123'
      const params = { appointmentId, projectCode, taskId }
      const query = { provider: '1' }

      const appointment = appointmentFactory.build()
      appointmentService.getAppointment.mockResolvedValue(appointment)

      const successMessage = 'success'
      page.successMessage.mockReturnValue(successMessage)
      page.exitPath.mockReturnValue(redirectPath)

      const request = createMock<Request>({ params, query })

      const requestHandler = controller.completeTask()
      await requestHandler(request, response, next)

      expect(appointmentService.completeAppointmentTask).toHaveBeenLastCalledWith(username, taskId)
      expect(request.flash).toHaveBeenCalledWith('success', successMessage)
      expect(response.redirect).toHaveBeenCalledWith(redirectPath)
      expect(page.exitPath).toHaveBeenCalledWith(query, appointment)
    })

    it('calls catchApiValidationErrorOrPropagate when completeAppointmentTask throws a SanitisedError', async () => {
      const appointmentId = '1'
      const projectCode = '2'
      const taskId = '123'
      const params = { appointmentId, projectCode, taskId }
      const query = { provider: '1' }

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

      const appointment = appointmentFactory.build()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      appointmentService.completeAppointmentTask.mockRejectedValue(error)

      const path = '/update'
      page.updatePath.mockReturnValue(path)

      const request = createMock<Request>({ params, query })

      const requestHandler = controller.completeTask()
      await requestHandler(request, response, next)

      expect(ErrorUtils.catchApiValidationErrorOrPropagate).toHaveBeenCalledWith(request, response, error, path)
    })
  })

  describe('delete', () => {
    it('renders the delete adjustment page', async () => {
      const appointmentId = '1'
      const projectCode = '2'
      const params = { appointmentId, projectCode }
      const formattedDate = '1 April 2026'
      const travelTimeAmount = AdjustmentUtils.intervals['PT-1H'].duration
      const totalTravelTime = '1 hour'

      const appointment = appointmentFactory.build()
      const adjustment = adjustmentFactory.build({
        reasonCode: AdjustmentUtils.travelTimeReasonCode,
        amount: travelTimeAmount,
      })
      appointment.adjustments = [adjustment]
      appointmentService.getAppointment.mockResolvedValue(appointment)

      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(formattedDate)
      jest.spyOn(paths.appointments.travelTime, 'delete').mockReturnValue('/delete')
      jest.spyOn(paths.appointments, 'update').mockReturnValue('/details')

      const project = projectFactory.build()

      projectService.getProject.mockResolvedValue(project)

      const request = createMock<Request>({ params, query: {} })

      const requestHandler = controller.delete()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/travelTime/delete', {
        appointment,
        project,
        totalTravelTime,
        formattedDate,
        appointmentLink: '/details',
        backLink: '/details',
        updatePath: '/delete',
        errorList: undefined,
        heading: {
          title: new Offender(appointment.offender).name,
          caption: appointment.offender.crn,
        },
      })
    })

    it('redirects back to the appointments details page if there is no travel time adjustment', async () => {
      const appointmentId = '1'
      const projectCode = '2'
      const params = { appointmentId, projectCode }
      const travelTimeAmount = AdjustmentUtils.intervals['PT-1H'].duration

      const appointment = appointmentFactory.build()
      const adjustment = adjustmentFactory.build({
        reasonCode: 'FOO',
        amount: travelTimeAmount,
      })
      appointment.adjustments = [adjustment]
      appointmentService.getAppointment.mockResolvedValue(appointment)

      jest.spyOn(paths.appointments, 'update').mockReturnValue('/details')

      const request = createMock<Request>({ params, query: {} })

      const requestHandler = controller.delete()
      await requestHandler(request, response, next)

      expect(paths.appointments.update).toHaveBeenCalledWith({
        page: 'appointment-details',
        projectCode,
        appointmentId,
      })
      expect(response.redirect).toHaveBeenCalledWith('/details')
    })
  })

  describe('submitDelete', () => {
    it('redirects on a successful deletion', async () => {
      const appointmentId = '1'
      const projectCode = '2'
      const params = { appointmentId, projectCode }
      const travelTimeAmount = AdjustmentUtils.intervals['PT-1H'].duration

      const appointment = appointmentFactory.build()
      const adjustment = adjustmentFactory.build({
        reasonCode: AdjustmentUtils.travelTimeReasonCode,
        amount: travelTimeAmount,
      })
      appointment.adjustments = [adjustment]
      appointmentService.getAppointment.mockResolvedValue(appointment)

      jest.spyOn(paths.appointments, 'update').mockReturnValue('/details')

      const request = createMock<Request>({ params, query: {}, flash: jest.fn() })

      const requestHandler = controller.submitDelete()
      await requestHandler(request, response, next)

      expect(request.flash).toHaveBeenCalledWith('success', 'Travel time has been deleted.')

      expect(paths.appointments.update).toHaveBeenCalledWith({
        page: 'appointment-details',
        projectCode,
        appointmentId,
      })
      expect(response.redirect).toHaveBeenCalledWith('/details')
    })

    it('redirects back to the appointments details page if there is no travel time adjustment', async () => {
      const appointmentId = '1'
      const projectCode = '2'
      const params = { appointmentId, projectCode }
      const travelTimeAmount = AdjustmentUtils.intervals['PT-1H'].duration

      const appointment = appointmentFactory.build()
      const adjustment = adjustmentFactory.build({
        reasonCode: AdjustmentUtils.travelTimeReasonCode,
        amount: travelTimeAmount,
      })
      appointment.adjustments = [adjustment]
      appointmentService.getAppointment.mockResolvedValue(appointment)

      jest.spyOn(paths.appointments, 'update').mockReturnValue('/details')

      const request = createMock<Request>({ params, query: {} })

      const requestHandler = controller.submitDelete()
      await requestHandler(request, response, next)

      expect(paths.appointments.update).toHaveBeenCalledWith({
        page: 'appointment-details',
        projectCode,
        appointmentId,
      })
      expect(response.redirect).toHaveBeenCalledWith('/details')
    })

    it('calls catchApiValidationErrorOrPropagate when submitDelete throws a SanitisedError', async () => {
      const appointmentId = '1'
      const projectCode = '2'
      const params = { appointmentId, projectCode }
      const travelTimeAmount = AdjustmentUtils.intervals['PT-1H'].duration

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

      jest.spyOn(paths.appointments.travelTime, 'delete').mockReturnValue('/delete')

      const appointment = appointmentFactory.build()
      const adjustment = adjustmentFactory.build({
        reasonCode: AdjustmentUtils.travelTimeReasonCode,
        amount: travelTimeAmount,
      })
      appointment.adjustments = [adjustment]
      appointmentService.getAppointment.mockResolvedValue(appointment)
      adjustmentService.deleteAdjustment.mockRejectedValue(error)

      const request = createMock<Request>({ params, query: {} })

      const requestHandler = controller.submitDelete()
      await requestHandler(request, response, next)

      expect(ErrorUtils.catchApiValidationErrorOrPropagate).toHaveBeenCalledWith(request, response, error, '/delete')
    })
  })
})
