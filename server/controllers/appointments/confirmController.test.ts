import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import ConfirmPage from '../../pages/appointments/confirmPage'
import ConfirmController from './confirmController'
import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import AppointmentFormService from '../../services/forms/appointmentFormService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'
import projectFactory from '../../testutils/factories/projectFactory'
import ProjectService from '../../services/projectService'
import getAppointmentOrSession from '../shared/getAppointmentOrSession'
import * as ErrorUtils from '../../utils/errorUtils'
import SessionService from '../../services/sessionService'
import AuditService from '../../services/auditService'
import updateAppointmentOutcomeResultFactory from '../../testutils/factories/updateAppointmentOutcomeResultFactory'
import HtmlUtils from '../../utils/htmlUtils'
import paths from '../../paths'
import OffenderService from '../../services/offenderService'
import caseDetailsSummaryFactory from '../../testutils/factories/caseDetailsSummaryFactory'
import createAppointmentFormFactory from '../../testutils/factories/createAppointmentFormFactory'
import providerTeamSummaryFactory from '../../testutils/factories/providerTeamSummaryFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'

jest.mock('../../pages/appointments/confirmPage')
jest.mock('../shared/getAppointmentOrSession')

describe('ConfirmController', () => {
  const appointmentId = '1'
  const projectCode = '2'
  const formId = '123'

  const request: DeepMocked<Request> = createMock<Request>({
    params: { appointmentId, projectCode },
    query: { form: formId },
    flash: jest.fn(),
  })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const confirmPageMock: jest.Mock = ConfirmPage as unknown as jest.Mock<ConfirmPage>
  const getAppointmentOrSessionMock: jest.Mock = getAppointmentOrSession as unknown as jest.Mock
  const pageViewData = {
    preventDoubleClick: true,
    someKey: 'some value',
  }
  const submittedItems = [{ key: { text: 'Some item' }, value: { text: 'Some value' } }]

  let mockPageInstance: {
    validationErrors: jest.Mock
    commonViewData: jest.Mock
    alertQuestionDetails: jest.Mock
    formItems: jest.Mock
    createFormItems: jest.Mock
    paths: jest.Mock
    offenderHeading: jest.Mock
    isAlertSelected: jest.Mock
    exitForm: jest.Mock
    updatePath: jest.Mock
  }
  let confirmController: ConfirmController
  const appointmentService = createMock<AppointmentService>()
  const appointmentFormService = createMock<AppointmentFormService>()
  const projectService = createMock<ProjectService>()
  const sessionService = createMock<SessionService>()
  const auditService = createMock<AuditService>()
  const offenderService = createMock<OffenderService>()

  beforeEach(() => {
    jest.resetAllMocks()

    mockPageInstance = {
      validationErrors: jest.fn().mockReturnValue({
        hasErrors: false,
        errors: {},
        errorSummary: [],
      }),
      commonViewData: jest.fn().mockReturnValue(pageViewData),
      alertQuestionDetails: jest.fn().mockReturnValue(pageViewData),
      formItems: jest.fn(),
      createFormItems: jest.fn().mockReturnValue([]),
      paths: jest.fn().mockReturnValue({}),
      offenderHeading: jest.fn().mockReturnValue({ title: 'Some Name', caption: 'X123456' }),
      isAlertSelected: jest.fn().mockReturnValue(true),
      exitForm: jest.fn().mockReturnValue('/default'),
      updatePath: jest.fn().mockReturnValue('/default'),
    }

    confirmPageMock.mockReturnValue(mockPageInstance)

    confirmController = new ConfirmController(
      appointmentService,
      appointmentFormService,
      projectService,
      sessionService,
      auditService,
      offenderService,
    )

    getAppointmentOrSessionMock.mockImplementation(async ({ appointmentOrSessionParams, res }) => {
      if (appointmentOrSessionParams.appointmentId) {
        return {
          appointment: await appointmentService.getAppointment({
            projectCode: appointmentOrSessionParams.projectCode,
            appointmentId: appointmentOrSessionParams.appointmentId,
            username: res.locals.user.username,
          }),
        }
      }

      const project = await projectService.getProject({
        username: res.locals.user.username,
        projectCode: appointmentOrSessionParams.projectCode,
      })

      return {
        session: sessionFactory.build({
          ...project,
          projectCode: project?.projectCode ?? appointmentOrSessionParams.projectCode,
          date: appointmentOrSessionParams.date,
        }),
      }
    })
  })

  describe('create', () => {
    it('should render the check appointment details page for a new appointment', async () => {
      const form = appointmentOutcomeFormFactory.build({ date: '2026-01-01' })
      const navigationPaths = { backLink: '/back', updatePath: '/update' }
      const caseDetailsSummary = caseDetailsSummaryFactory.build()
      const project = projectFactory.build({ projectCode })
      const heading = { title: 'Some Name', caption: 'X123456' }
      const unpaidWorkItems = [{ key: { text: 'Requirement' }, value: { html: 'some requirement summary' } }]

      const alertQuestionDetailsSpy = jest.fn().mockReturnValue(pageViewData)
      const formItemsSpy = jest.fn().mockReturnValue(submittedItems)
      const createFormItemsSpy = jest.fn().mockReturnValue(unpaidWorkItems)
      const pathsSpy = jest.fn().mockReturnValue(navigationPaths)
      const offenderHeadingSpy = jest.fn().mockReturnValue(heading)
      mockPageInstance.paths.mockImplementation(pathsSpy)
      mockPageInstance.alertQuestionDetails.mockImplementation(alertQuestionDetailsSpy)
      mockPageInstance.formItems.mockImplementation(formItemsSpy)
      mockPageInstance.createFormItems.mockImplementation(createFormItemsSpy)
      mockPageInstance.offenderHeading.mockImplementation(offenderHeadingSpy)

      const response = createMock<Response>({ locals: { user: { username: 'user-name' }, errorMessages: [] } })
      appointmentFormService.getForm.mockResolvedValue(form)
      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
      projectService.getProject.mockResolvedValue(project)

      const requestHandler = confirmController.create()
      await requestHandler(request, response, next)

      expect(pathsSpy).toHaveBeenCalledWith({
        form,
        formId,
      })
      expect(alertQuestionDetailsSpy).toHaveBeenCalledWith(undefined, form)
      expect(createFormItemsSpy).toHaveBeenCalledWith({
        form,
        undefined,
        formId,
        offenderSummary: caseDetailsSummary,
        projectType: project.projectType.group,
      })
      expect(formItemsSpy).toHaveBeenCalledWith(form, undefined, undefined, formId, { includeDateItem: true })
      expect(offenderHeadingSpy).toHaveBeenCalledWith(caseDetailsSummary.offender)
      expect(response.render).toHaveBeenCalledWith('appointments/update/confirm', {
        heading,
        ...navigationPaths,
        ...pageViewData,
        submittedItems: [...unpaidWorkItems, ...submittedItems],
        errorList: undefined,
        preventDoubleClick: true,
      })
    })

    it('should render the page with errorList when errorMessages are present', async () => {
      const errorMessages = ['Start time is required', 'End time is required']
      const form = appointmentOutcomeFormFactory.build({ date: '2026-01-01' })
      const caseDetailsSummary = caseDetailsSummaryFactory.build()
      const project = projectFactory.build({ projectCode })

      mockPageInstance.paths.mockReturnValue({})
      mockPageInstance.alertQuestionDetails.mockReturnValue(pageViewData)
      mockPageInstance.offenderHeading.mockReturnValue({ title: 'Some Name', caption: 'X123456' })
      mockPageInstance.formItems.mockReturnValue(submittedItems)

      const response = createMock<Response>({
        locals: { user: { username: 'user-name' }, errorMessages },
      })
      appointmentFormService.getForm.mockResolvedValue(form)
      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
      projectService.getProject.mockResolvedValue(project)

      const requestHandler = confirmController.create()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/confirm',
        expect.objectContaining({
          errorList: [{ text: 'Start time is required' }, { text: 'End time is required' }],
        }),
      )
    })
  })

  describe('show', () => {
    it('should render the check appointment details page', async () => {
      const form = appointmentOutcomeFormFactory.build()

      mockPageInstance.commonViewData.mockReturnValue({})
      mockPageInstance.alertQuestionDetails.mockReturnValue(pageViewData)
      const appointment = appointmentFactory.build()

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      appointmentFormService.getForm.mockResolvedValue(form)

      const requestHandler = confirmController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/confirm', pageViewData)
    })

    it('should render the page with errorList when errorMessages are present', async () => {
      const errorMessages = ['Start time is required', 'End time is required']
      const responseWithErrors = createMock<Response>({
        locals: { user: { username: 'user-name' }, errorMessages },
      })

      const form = appointmentOutcomeFormFactory.build()
      const appointment = appointmentFactory.build()

      mockPageInstance.commonViewData.mockReturnValue({})
      mockPageInstance.alertQuestionDetails.mockReturnValue(pageViewData)

      appointmentService.getAppointment.mockResolvedValue(appointment)
      appointmentFormService.getForm.mockResolvedValue(form)

      const requestHandler = confirmController.show()
      await requestHandler(request, responseWithErrors, next)

      const expectedErrorList = [{ text: 'Start time is required' }, { text: 'End time is required' }]

      expect(responseWithErrors.render).toHaveBeenCalledWith(
        'appointments/update/confirm',
        expect.objectContaining({ errorList: expectedErrorList }),
      )
    })
  })

  describe('submitCreate', () => {
    it('should create appointment data and redirect to checkAppointmentDetails page', async () => {
      const project = projectFactory.build({ projectCode })
      const nextPath = 'next'
      const exitFormSpy = jest.fn().mockReturnValue(nextPath)
      mockPageInstance.exitForm.mockImplementation(exitFormSpy)
      mockPageInstance.isAlertSelected.mockReturnValue(true)

      const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })
      const requestWithNewAppointment = createMock<Request>({
        params: { projectCode },
        query: { form: formId },
        flash: jest.fn(),
      })

      const form = createAppointmentFormFactory.build({
        project: { code: projectCode, name: 'Project name' },
        date: '2026-06-09',
        deliusEventNumber: '1001',
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
        originalSearch: { provider: 'provider' },
      })

      projectService.getProject.mockResolvedValue(project)
      appointmentFormService.getForm.mockResolvedValue(form)

      const requestHandler = confirmController.submitCreate()
      await requestHandler(requestWithNewAppointment, response, next)

      expect(appointmentService.createAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          crn: form.crn,
          deliusEventNumber: 1001,
          projectCode,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          contactOutcomeCode: form.contactOutcome.code,
          attendanceData: form.attendanceData,
          supervisorOfficerCode: form.supervisor.code,
          alertActive: true,
        }),
        'user-name',
      )
      expect(exitFormSpy).toHaveBeenCalledWith({ projectCode, date: form.date }, 'GROUP', form.originalSearch)
      expect(response.redirect).toHaveBeenCalledWith(nextPath)
      expect(requestWithNewAppointment.flash).toHaveBeenCalledWith('success', 'Attendance recorded')
    })

    it('should create appointment data without attendance data if did not attend', async () => {
      mockPageInstance.exitForm.mockReturnValue('next')
      mockPageInstance.isAlertSelected.mockReturnValue(true)

      const project = projectFactory.build({ projectCode })
      const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })
      const requestWithNewAppointment = createMock<Request>({
        params: { projectCode },
        query: { form: formId },
        flash: jest.fn(),
      })

      const form = createAppointmentFormFactory.build({
        project: { code: projectCode, name: 'Project name' },
        date: '2026-06-09',
        deliusEventNumber: '1001',
        contactOutcome: contactOutcomeFactory.build({ attended: false }),
      })

      projectService.getProject.mockResolvedValue(project)
      appointmentFormService.getForm.mockResolvedValue(form)

      const requestHandler = confirmController.submitCreate()
      await requestHandler(requestWithNewAppointment, response, next)

      expect(appointmentService.createAppointment).toHaveBeenCalledWith(
        expect.objectContaining({ attendanceData: undefined }),
        'user-name',
      )
    })

    describe('start and end times', () => {
      it('uses the form value when the outcome is attended', async () => {
        mockPageInstance.exitForm.mockReturnValue('next')
        mockPageInstance.isAlertSelected.mockReturnValue(true)

        const project = projectFactory.build({ projectCode })
        const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })
        const requestWithNewAppointment = createMock<Request>({
          params: { projectCode },
          query: { form: formId },
          flash: jest.fn(),
        })

        const form = createAppointmentFormFactory.build({
          project: { code: projectCode, name: 'Project name' },
          date: '2026-06-09',
          deliusEventNumber: '1001',
          contactOutcome: contactOutcomeFactory.build({ attended: true }),
          startTime: '11:00',
          endTime: '12:00',
        })

        projectService.getProject.mockResolvedValue(project)
        appointmentFormService.getForm.mockResolvedValue(form)

        const requestHandler = confirmController.submitCreate()
        await requestHandler(requestWithNewAppointment, response, next)

        expect(appointmentService.createAppointment).toHaveBeenCalledWith(
          expect.objectContaining({ startTime: form.startTime, endTime: form.endTime }),
          'user-name',
        )
      })

      it('submits undefined when the outcome is not attended, ignoring any edited form value', async () => {
        mockPageInstance.exitForm.mockReturnValue('next')
        mockPageInstance.isAlertSelected.mockReturnValue(true)

        const project = projectFactory.build({ projectCode })
        const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })
        const requestWithNewAppointment = createMock<Request>({
          params: { projectCode },
          query: { form: formId },
          flash: jest.fn(),
        })

        const form = createAppointmentFormFactory.build({
          project: { code: projectCode, name: 'Project name' },
          date: '2026-06-09',
          deliusEventNumber: '1001',
          contactOutcome: contactOutcomeFactory.build({ attended: false }),
          startTime: '13:00',
          endTime: '14:00',
        })

        projectService.getProject.mockResolvedValue(project)
        appointmentFormService.getForm.mockResolvedValue(form)

        const requestHandler = confirmController.submitCreate()
        await requestHandler(requestWithNewAppointment, response, next)

        expect(appointmentService.createAppointment).toHaveBeenCalledWith(
          expect.objectContaining({ startTime: undefined, endTime: undefined }),
          'user-name',
        )
      })
    })

    it('should set the audit subject to the CRN', async () => {
      mockPageInstance.exitForm.mockReturnValue('next')
      mockPageInstance.isAlertSelected.mockReturnValue(true)

      const project = projectFactory.build({ projectCode })
      const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })
      const requestWithNewAppointment = createMock<Request>({
        params: { projectCode },
        query: { form: formId },
        flash: jest.fn(),
      })

      const form = createAppointmentFormFactory.build({
        project: { code: projectCode, name: 'Project name' },
        date: '2026-06-09',
        deliusEventNumber: '1001',
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
      })

      projectService.getProject.mockResolvedValue(project)
      appointmentFormService.getForm.mockResolvedValue(form)

      const requestHandler = confirmController.submitCreate()
      await requestHandler(requestWithNewAppointment, response, next)

      expect(response.locals.audit).toEqual({ subjectType: 'CRN', subjectId: form.crn })
    })

    it.each([true, false])('uses the alert value selected by the user', async (userSelectedValue: boolean) => {
      mockPageInstance.exitForm.mockReturnValue('next')
      mockPageInstance.isAlertSelected.mockReturnValue(userSelectedValue)

      const project = projectFactory.build({ projectCode })
      const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })
      const requestWithNewAppointment = createMock<Request>({
        params: { projectCode },
        query: { form: formId },
        flash: jest.fn(),
      })

      const form = createAppointmentFormFactory.build({
        project: { code: projectCode, name: 'Project name' },
        date: '2026-06-09',
        deliusEventNumber: '1001',
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
      })

      projectService.getProject.mockResolvedValue(project)
      appointmentFormService.getForm.mockResolvedValue(form)

      const requestHandler = confirmController.submitCreate()
      await requestHandler(requestWithNewAppointment, response, next)

      expect(appointmentService.createAppointment).toHaveBeenCalledWith(
        expect.objectContaining({ alertActive: userSelectedValue }),
        'user-name',
      )
    })

    it('calls catchApiValidationErrorOrPropagate when createAppointment throws a SanitisedError', async () => {
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

      mockPageInstance.isAlertSelected.mockReturnValue(true)
      mockPageInstance.updatePath.mockReturnValue('/update/path')

      const project = projectFactory.build({ projectCode })
      const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })
      const requestWithNewAppointment = createMock<Request>({
        params: { projectCode },
        query: { form: formId },
        flash: jest.fn(),
      })

      const form = createAppointmentFormFactory.build({
        project: { code: projectCode, name: 'Project name' },
        date: '2026-06-09',
        deliusEventNumber: '1001',
        contactOutcome: contactOutcomeFactory.build({ attended: true }),
      })

      projectService.getProject.mockResolvedValue(project)
      appointmentFormService.getForm.mockResolvedValue(form)
      appointmentService.createAppointment.mockRejectedValue(error)

      const requestHandler = confirmController.submitCreate()
      await requestHandler(requestWithNewAppointment, response, next)

      expect(ErrorUtils.catchApiValidationErrorOrPropagate).toHaveBeenCalledWith(
        requestWithNewAppointment,
        response,
        error,
        '/update/path',
      )
    })

    describe('given validation errors', () => {
      it('renders the page with submittedItems built from createFormItems and formItems', async () => {
        const project = projectFactory.build({ projectCode })
        const caseDetailsSummary = caseDetailsSummaryFactory.build()
        const unpaidWorkItems = [{ key: { text: 'Requirement' }, value: { html: 'some requirement summary' } }]

        const createFormItemsSpy = jest.fn().mockReturnValue(unpaidWorkItems)
        const formItemsSpy = jest.fn().mockReturnValue(submittedItems)
        mockPageInstance.createFormItems.mockImplementation(createFormItemsSpy)
        mockPageInstance.formItems.mockImplementation(formItemsSpy)
        mockPageInstance.offenderHeading.mockReturnValue({ title: 'Some Name', caption: 'X123456' })
        mockPageInstance.validationErrors.mockReturnValue({
          hasErrors: true,
          errors: { alertPractitioner: { text: 'error' } },
          errorSummary: [{ text: 'error', href: '#alertPractitioner' }],
        })

        const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })
        const requestWithNewAppointment = createMock<Request>({
          params: { projectCode },
          query: { form: formId },
          flash: jest.fn(),
        })

        const form = createAppointmentFormFactory.build({
          project: { code: projectCode, name: 'Project name' },
          date: '2026-06-09',
          deliusEventNumber: '1001',
          contactOutcome: contactOutcomeFactory.build({ attended: true }),
        })

        projectService.getProject.mockResolvedValue(project)
        appointmentFormService.getForm.mockResolvedValue(form)
        offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

        const requestHandler = confirmController.submitCreate()
        await requestHandler(requestWithNewAppointment, response, next)

        expect(createFormItemsSpy).toHaveBeenCalledWith({
          form,
          formId,
          offenderSummary: caseDetailsSummary,
          projectType: project.projectType.group,
        })
        expect(formItemsSpy).toHaveBeenCalledWith(form, undefined, undefined, formId, { includeDateItem: true })
        expect(response.render).toHaveBeenCalledWith('appointments/update/confirm', {
          heading: { title: 'Some Name', caption: 'X123456' },
          ...pageViewData,
          submittedItems: [...unpaidWorkItems, ...submittedItems],
          errorSummary: [{ text: 'error', href: '#alertPractitioner' }],
          errors: { alertPractitioner: { text: 'error' } },
          preventDoubleClick: true,
        })
        expect(appointmentService.createAppointment).not.toHaveBeenCalled()
      })
    })
  })

  describe('submit', () => {
    let formAppointmentVersion: string
    let appointmentVersion: string

    beforeEach(() => {
      formAppointmentVersion = '1'
      appointmentVersion = '1'
    })

    describe('given an individual appointment route', () => {
      it('should send appointment data and redirect to session page with success message', async () => {
        const nextPath = 'next'
        mockPageInstance.exitForm.mockReturnValue(nextPath)
        mockPageInstance.isAlertSelected.mockReturnValue(true)
        const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })
        const project = projectFactory.build()
        const appointment = appointmentFactory.build({ version: appointmentVersion })
        const contactOutcome = contactOutcomeFactory.build({ attended: true })
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome,
          deliusVersion: formAppointmentVersion,
          isSensitive: 'yes',
          project: { code: project.projectCode },
        })

        projectService.getProject.mockResolvedValue(project)
        appointmentService.getAppointment.mockResolvedValue(appointment)
        appointmentFormService.getForm.mockResolvedValue(form)

        const requestHandler = confirmController.submitUpdate()
        await requestHandler(request, response, next)

        expect(appointmentService.saveAppointment).toHaveBeenCalledWith(
          appointment.projectCode,
          {
            deliusId: appointment.id,
            deliusVersionToUpdate: appointment.version,
            alertActive: true,
            sensitive: true,
            startTime: form.startTime,
            endTime: form.endTime,
            contactOutcomeCode: form.contactOutcome.code,
            attendanceData: form.attendanceData,
            supervisorOfficerCode: form.supervisor.code,
            notes: form.notes,
            date: appointment.date,
            projectCode: form.project.code,
          },
          'user-name',
        )
        expect(response.redirect).toHaveBeenCalledWith(nextPath)
        expect(request.flash).toHaveBeenCalledWith('success', 'Attendance recorded')
      })

      it('should add a session link to the success message if project has changed', async () => {
        const nextPath = 'next'
        mockPageInstance.exitForm.mockReturnValue(nextPath)
        mockPageInstance.isAlertSelected.mockReturnValue(true)
        const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })
        const project = projectFactory.build()
        const appointment = appointmentFactory.build({ version: appointmentVersion })
        const contactOutcome = contactOutcomeFactory.build({ attended: true })
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome,
          deliusVersion: formAppointmentVersion,
          isSensitive: 'yes',
        })

        projectService.getProject.mockResolvedValue(project)
        appointmentService.getAppointment.mockResolvedValue(appointment)
        appointmentFormService.getForm.mockResolvedValue(form)

        jest.spyOn(HtmlUtils, 'getAnchor').mockReturnValue('<a></a>')

        const requestHandler = confirmController.submitUpdate()
        await requestHandler(request, response, next)

        expect(appointmentService.saveAppointment).toHaveBeenCalledWith(
          appointment.projectCode,
          {
            deliusId: appointment.id,
            deliusVersionToUpdate: appointment.version,
            alertActive: true,
            sensitive: true,
            startTime: form.startTime,
            endTime: form.endTime,
            contactOutcomeCode: form.contactOutcome.code,
            attendanceData: form.attendanceData,
            supervisorOfficerCode: form.supervisor.code,
            notes: form.notes,
            date: appointment.date,
            projectCode: form.project.code,
          },
          'user-name',
        )
        expect(response.redirect).toHaveBeenCalledWith(nextPath)
        expect(request.flash).toHaveBeenCalledWith('success', 'Attendance recorded on a different session. <a></a>')
        expect(HtmlUtils.getAnchor).toHaveBeenCalledWith(
          'View session',
          paths.sessions.show({ projectCode: form.project.code, date: appointment.date }),
        )
      })

      it('should save appointmentData without attendance data if did not attend', async () => {
        const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

        const appointment = appointmentFactory.build({ version: appointmentVersion })
        const contactOutcome = contactOutcomeFactory.build({ attended: false })
        const form = appointmentOutcomeFormFactory.build({ contactOutcome, deliusVersion: formAppointmentVersion })

        appointmentService.getAppointment.mockResolvedValue(appointment)
        appointmentFormService.getForm.mockResolvedValue(form)

        const requestHandler = confirmController.submitUpdate()
        await requestHandler(request, response, next)

        expect(appointmentService.saveAppointment).toHaveBeenCalledWith(
          appointment.projectCode,
          expect.objectContaining({ attendanceData: undefined }),
          'user-name',
        )
      })

      describe('start and end times', () => {
        it('uses the form value when the outcome is attended', async () => {
          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointment = appointmentFactory.build({
            version: appointmentVersion,
            startTime: '09:00',
            endTime: '12:00',
          })
          const contactOutcome = contactOutcomeFactory.build({ attended: true })
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome,
            deliusVersion: formAppointmentVersion,
            startTime: '13:00',
            endTime: '16:00',
          })

          appointmentService.getAppointment.mockResolvedValue(appointment)
          appointmentFormService.getForm.mockResolvedValue(form)

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(request, response, next)

          expect(appointmentService.saveAppointment).toHaveBeenCalledWith(
            appointment.projectCode,
            expect.objectContaining({ startTime: form.startTime, endTime: form.endTime }),
            'user-name',
          )
        })

        it('falls back to the appointment value when the outcome is attended and the form value is undefined', async () => {
          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointment = appointmentFactory.build({ version: appointmentVersion })
          const contactOutcome = contactOutcomeFactory.build({ attended: true })
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome,
            deliusVersion: formAppointmentVersion,
            startTime: undefined,
            endTime: undefined,
          })

          appointmentService.getAppointment.mockResolvedValue(appointment)
          appointmentFormService.getForm.mockResolvedValue(form)

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(request, response, next)

          expect(appointmentService.saveAppointment).toHaveBeenCalledWith(
            appointment.projectCode,
            expect.objectContaining({ startTime: appointment.startTime, endTime: appointment.endTime }),
            'user-name',
          )
        })

        it('uses the appointment value when the outcome is not attended, ignoring any edited form value', async () => {
          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointment = appointmentFactory.build({
            version: appointmentVersion,
          })
          const contactOutcome = contactOutcomeFactory.build({ attended: false })
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome,
            deliusVersion: formAppointmentVersion,
            startTime: '13:00',
            endTime: '14:00',
          })

          appointmentService.getAppointment.mockResolvedValue(appointment)
          appointmentFormService.getForm.mockResolvedValue(form)

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(request, response, next)

          expect(appointmentService.saveAppointment).toHaveBeenCalledWith(
            appointment.projectCode,
            expect.objectContaining({ startTime: appointment.startTime, endTime: appointment.endTime }),
            'user-name',
          )
        })
      })

      describe('alertActive', () => {
        it.each([true, false])(
          'any user selected value is submitted with the update',
          async (userSelectedValue: boolean) => {
            mockPageInstance.isAlertSelected.mockReturnValue(userSelectedValue)
            mockPageInstance.exitForm.mockReturnValue('')
            const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

            const appointment = appointmentFactory.build({ version: appointmentVersion })
            const contactOutcome = contactOutcomeFactory.build({ attended: false })
            const form = appointmentOutcomeFormFactory.build({ contactOutcome, deliusVersion: formAppointmentVersion })

            appointmentService.getAppointment.mockResolvedValue(appointment)
            appointmentFormService.getForm.mockResolvedValue(form)

            const requestHandler = confirmController.submitUpdate()
            await requestHandler(request, response, next)

            expect(appointmentService.saveAppointment).toHaveBeenCalledWith(
              appointment.projectCode,
              expect.objectContaining({ alertActive: userSelectedValue }),
              'user-name',
            )
          },
        )

        it.each([true, false, undefined])(
          'sends original appointment value if user selected value is undefined',
          async (appointmentValue?: boolean) => {
            mockPageInstance.isAlertSelected.mockReturnValue(null)
            mockPageInstance.exitForm.mockReturnValue('')
            const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

            const appointment = appointmentFactory.build({ version: appointmentVersion, alertActive: appointmentValue })
            const contactOutcome = contactOutcomeFactory.build({ attended: false })
            const form = appointmentOutcomeFormFactory.build({ contactOutcome, deliusVersion: formAppointmentVersion })

            appointmentService.getAppointment.mockResolvedValue(appointment)
            appointmentFormService.getForm.mockResolvedValue(form)

            const requestHandler = confirmController.submitUpdate()
            await requestHandler(request, response, next)

            expect(appointmentService.saveAppointment).toHaveBeenCalledWith(
              appointment.projectCode,
              expect.objectContaining({ alertActive: appointmentValue }),
              'user-name',
            )
          },
        )
      })

      describe('sensitive', () => {
        it('sends the appointment value if the appointment value is true', async () => {
          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointment = appointmentFactory.build({ version: '1', sensitive: true })
          const form = appointmentOutcomeFormFactory.build({ deliusVersion: '1' })

          appointmentService.getAppointment.mockResolvedValue(appointment)
          appointmentFormService.getForm.mockResolvedValue(form)

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(request, response, next)

          expect(appointmentService.saveAppointment).toHaveBeenCalledWith(
            appointment.projectCode,
            expect.objectContaining({ sensitive: true }),
            'user-name',
          )
        })

        it.each([false, undefined, null])(
          'sends the form value if the appointment value is not true',
          async (appointmentIsSensitive?: boolean) => {
            const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

            const appointment = appointmentFactory.build({ version: '1', sensitive: appointmentIsSensitive })
            const form = appointmentOutcomeFormFactory.build({ deliusVersion: '1', isSensitive: 'yes' })

            appointmentService.getAppointment.mockResolvedValue(appointment)
            appointmentFormService.getForm.mockResolvedValue(form)

            const requestHandler = confirmController.submitUpdate()
            await requestHandler(request, response, next)

            expect(appointmentService.saveAppointment).toHaveBeenCalledWith(
              appointment.projectCode,
              expect.objectContaining({ sensitive: true }),
              'user-name',
            )
          },
        )
      })

      it('redirects to next page if appointment was updated elsewhere', async () => {
        const nextPath = 'next'
        mockPageInstance.exitForm.mockReturnValue(nextPath)
        mockPageInstance.isAlertSelected.mockReturnValue(null)
        formAppointmentVersion = '1'
        appointmentVersion = '2'

        const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

        const appointment = appointmentFactory.build({ version: appointmentVersion })
        const contactOutcome = contactOutcomeFactory.build({ attended: false })
        const form = appointmentOutcomeFormFactory.build({ contactOutcome, deliusVersion: formAppointmentVersion })

        appointmentService.getAppointment.mockResolvedValue(appointment)
        appointmentFormService.getForm.mockResolvedValue(form)

        const requestHandler = confirmController.submitUpdate()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(nextPath)
        expect(request.flash).toHaveBeenCalledWith(
          'error',
          'The arrival time has already been updated in the database, try again.',
        )
      })

      it('calls catchApiValidationErrorOrPropagate when saveAppointment throws a SanitisedError', async () => {
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

        mockPageInstance.isAlertSelected.mockReturnValue(true)
        mockPageInstance.updatePath.mockReturnValue('/update/path')
        const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

        const appointment = appointmentFactory.build({ version: appointmentVersion })
        const contactOutcome = contactOutcomeFactory.build({ attended: true })
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome,
          deliusVersion: formAppointmentVersion,
        })

        appointmentService.getAppointment.mockResolvedValue(appointment)
        appointmentFormService.getForm.mockResolvedValue(form)
        appointmentService.saveAppointment.mockRejectedValue(error)

        const requestHandler = confirmController.submitUpdate()
        await requestHandler(request, response, next)

        expect(ErrorUtils.catchApiValidationErrorOrPropagate).toHaveBeenCalledWith(
          request,
          response,
          error,
          '/update/path',
        )
      })
    })

    describe('given a session route', () => {
      let bulkRequest: DeepMocked<Request>
      const sessionDate = '2026-06-01'

      beforeEach(() => {
        bulkRequest = createMock<Request>({
          params: { projectCode, date: sessionDate },
          query: { form: formId },
          flash: jest.fn(),
        })
        projectService.getProject.mockResolvedValue(projectFactory.build({ projectCode }))
      })

      it('should send multiple appointment updates via saveAppointments and redirect', async () => {
        const nextPath = 'next'
        mockPageInstance.exitForm.mockReturnValue(nextPath)
        mockPageInstance.isAlertSelected.mockReturnValue(true)
        const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

        const appointments = appointmentFactory.buildList(2, { version: appointmentVersion })
        const contactOutcome = contactOutcomeFactory.build({ attended: true })
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome,
          deliusVersion: formAppointmentVersion,
          isSensitive: 'yes',
          appointments: [
            { id: appointments[0].id, deliusVersion: appointmentVersion },
            { id: appointments[1].id, deliusVersion: appointmentVersion },
          ],
        })

        const updateAppointmentOutcomeResults = updateAppointmentOutcomeResultFactory.buildList(2, {
          result: 'SUCCESS',
        })

        appointmentService.getAppointment
          .mockResolvedValueOnce(appointments[0])
          .mockResolvedValueOnce(appointments[1])
          .mockResolvedValueOnce(appointments[0])
          .mockResolvedValueOnce(appointments[1])
        appointmentFormService.getForm.mockResolvedValue(form)
        appointmentService.saveAppointments.mockResolvedValue({
          results: updateAppointmentOutcomeResults,
        })

        const requestHandler = confirmController.submitUpdate()
        await requestHandler(bulkRequest, response, next)

        expect(appointmentService.getAppointment).toHaveBeenCalledTimes(4)
        expect(auditService.sendAuditMessage).toHaveBeenCalledTimes(4)
        expect(auditService.sendAuditMessage).toHaveBeenNthCalledWith(1, {
          action: 'EDIT_APPOINTMENT',
          username: 'user-name',
          details: { projectCode, date: sessionDate },
          correlationId: bulkRequest.id,
          subjectType: 'CRN',
          subjectId: appointments[0].offender.crn,
        })
        expect(auditService.sendAuditMessage).toHaveBeenNthCalledWith(2, {
          action: 'EDIT_APPOINTMENT',
          username: 'user-name',
          details: { projectCode, date: sessionDate },
          correlationId: bulkRequest.id,
          subjectType: 'CRN',
          subjectId: appointments[1].offender.crn,
        })
        expect(auditService.sendAuditMessage).toHaveBeenNthCalledWith(3, {
          action: 'EDIT_BULK_APPOINTMENT_SUCCESS',
          username: 'user-name',
          details: { projectCode, date: sessionDate },
          correlationId: bulkRequest.id,
          subjectType: 'CRN',
          subjectId: appointments[0].offender.crn,
        })
        expect(auditService.sendAuditMessage).toHaveBeenNthCalledWith(4, {
          action: 'EDIT_BULK_APPOINTMENT_SUCCESS',
          username: 'user-name',
          details: { projectCode, date: sessionDate },
          correlationId: bulkRequest.id,
          subjectType: 'CRN',
          subjectId: appointments[1].offender.crn,
        })
        expect(appointmentService.saveAppointments).toHaveBeenCalledWith(
          projectCode,
          {
            updates: [
              {
                deliusId: appointments[0].id,
                deliusVersionToUpdate: appointments[0].version,
                alertActive: true,
                sensitive: appointments[0].sensitive,
                startTime: form.startTime,
                endTime: form.endTime,
                contactOutcomeCode: form.contactOutcome.code,
                attendanceData: form.attendanceData,
                supervisorOfficerCode: form.supervisor.code,
                date: appointments[0].date,
                notes: form.notes,
                projectCode: form.project.code,
              },
              {
                deliusId: appointments[1].id,
                deliusVersionToUpdate: appointments[1].version,
                alertActive: true,
                sensitive: appointments[1].sensitive,
                startTime: form.startTime,
                endTime: form.endTime,
                contactOutcomeCode: form.contactOutcome.code,
                attendanceData: form.attendanceData,
                supervisorOfficerCode: form.supervisor.code,
                date: appointments[1].date,
                notes: form.notes,
                projectCode: form.project.code,
              },
            ],
          },
          'user-name',
        )
        expect(response.redirect).toHaveBeenCalledWith(nextPath)
      })

      it('should include attendance data when didAttend is true', async () => {
        mockPageInstance.exitForm.mockReturnValue('')
        mockPageInstance.isAlertSelected.mockReturnValue(false)
        const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

        const appointment = appointmentFactory.build({ version: appointmentVersion })
        const contactOutcome = contactOutcomeFactory.build({ attended: true })
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome,
          deliusVersion: formAppointmentVersion,
          appointments: [{ id: 1, deliusVersion: formAppointmentVersion }],
        })

        appointmentService.getAppointment.mockResolvedValue(appointment)
        appointmentFormService.getForm.mockResolvedValue(form)

        const requestHandler = confirmController.submitUpdate()
        await requestHandler(bulkRequest, response, next)

        expect(appointmentService.saveAppointments).toHaveBeenCalledWith(
          projectCode,
          {
            updates: [
              expect.objectContaining({
                attendanceData: form.attendanceData,
              }),
            ],
          },
          'user-name',
        )
      })

      it('should exclude attendance data when didAttend is false', async () => {
        mockPageInstance.exitForm.mockReturnValue('')
        mockPageInstance.isAlertSelected.mockReturnValue(false)
        const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

        const appointment = appointmentFactory.build({ version: appointmentVersion })
        const contactOutcome = contactOutcomeFactory.build({ attended: false })
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome,
          deliusVersion: formAppointmentVersion,
          appointments: [{ id: 1, deliusVersion: formAppointmentVersion }],
        })

        appointmentService.getAppointment.mockResolvedValue(appointment)
        appointmentFormService.getForm.mockResolvedValue(form)

        const requestHandler = confirmController.submitUpdate()
        await requestHandler(bulkRequest, response, next)

        expect(appointmentService.saveAppointments).toHaveBeenCalledWith(
          projectCode,
          {
            updates: [
              expect.objectContaining({
                attendanceData: undefined,
              }),
            ],
          },
          'user-name',
        )
      })

      describe('start and end times', () => {
        it('uses the form value when the outcome is attended', async () => {
          mockPageInstance.exitForm.mockReturnValue('')
          mockPageInstance.isAlertSelected.mockReturnValue(false)

          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointment = appointmentFactory.build({
            version: appointmentVersion,
            startTime: '09:00',
            endTime: '12:00',
          })
          const contactOutcome = contactOutcomeFactory.build({ attended: true })
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome,
            appointments: [{ id: 1, deliusVersion: formAppointmentVersion }],
            startTime: '13:00',
            endTime: '16:00',
          })

          appointmentService.getAppointment.mockResolvedValue(appointment)
          appointmentFormService.getForm.mockResolvedValue(form)

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(bulkRequest, response, next)

          expect(appointmentService.saveAppointments).toHaveBeenCalledWith(
            projectCode,
            {
              updates: [
                expect.objectContaining({
                  startTime: form.startTime,
                  endTime: form.endTime,
                }),
              ],
            },
            'user-name',
          )
        })

        it('falls back to the appointment value when the outcome is attended and the form value is undefined', async () => {
          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointment = appointmentFactory.build({ version: appointmentVersion })
          const contactOutcome = contactOutcomeFactory.build({ attended: true })
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome,
            deliusVersion: formAppointmentVersion,
            startTime: undefined,
            endTime: undefined,
            appointments: [{ id: appointment.id, deliusVersion: appointmentVersion }],
          })

          appointmentService.getAppointment.mockResolvedValue(appointment)
          appointmentFormService.getForm.mockResolvedValue(form)

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(bulkRequest, response, next)

          expect(appointmentService.saveAppointments).toHaveBeenCalledWith(
            projectCode,
            {
              updates: [
                expect.objectContaining({
                  startTime: appointment.startTime,
                  endTime: appointment.endTime,
                }),
              ],
            },
            'user-name',
          )
        })

        it('uses the appointment value when the outcome is not attended, ignoring any edited form value', async () => {
          mockPageInstance.exitForm.mockReturnValue('')
          mockPageInstance.isAlertSelected.mockReturnValue(false)
          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointment = appointmentFactory.build({
            version: appointmentVersion,
          })
          const contactOutcome = contactOutcomeFactory.build({ attended: false })
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome,
            deliusVersion: formAppointmentVersion,
            startTime: '13:00',
            endTime: '14:00',
            appointments: [{ id: 1, deliusVersion: formAppointmentVersion }],
          })

          appointmentService.getAppointment.mockResolvedValue(appointment)
          appointmentFormService.getForm.mockResolvedValue(form)

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(bulkRequest, response, next)

          expect(appointmentService.saveAppointments).toHaveBeenCalledWith(
            projectCode,
            {
              updates: [
                expect.objectContaining({
                  startTime: appointment.startTime,
                  endTime: appointment.endTime,
                }),
              ],
            },
            'user-name',
          )
        })
      })

      describe('supervisorTeamCode', () => {
        it('should include supervisor team code when this is set on the form', async () => {
          mockPageInstance.exitForm.mockReturnValue('')
          mockPageInstance.isAlertSelected.mockReturnValue(false)
          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointment = appointmentFactory.build({ version: appointmentVersion })
          const contactOutcome = contactOutcomeFactory.build({ attended: false })
          const team = providerTeamSummaryFactory.build()
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome,
            deliusVersion: formAppointmentVersion,
            appointments: [{ id: 1, deliusVersion: formAppointmentVersion }],
            supervisingTeam: team,
          })

          appointmentService.getAppointment.mockResolvedValue(appointment)
          appointmentFormService.getForm.mockResolvedValue(form)

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(bulkRequest, response, next)

          expect(appointmentService.saveAppointments).toHaveBeenCalledWith(
            projectCode,
            {
              updates: [
                expect.objectContaining({
                  supervisorTeamCode: team.code,
                }),
              ],
            },
            'user-name',
          )
        })
      })

      describe('alertActive', () => {
        it.each([true, false])('uses user selected value for alertActive', async (userSelectedValue: boolean) => {
          mockPageInstance.isAlertSelected.mockReturnValue(userSelectedValue)
          mockPageInstance.exitForm.mockReturnValue('')
          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointment = appointmentFactory.build({ version: appointmentVersion, alertActive: false })
          const contactOutcome = contactOutcomeFactory.build({ attended: false })
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome,
            deliusVersion: formAppointmentVersion,
            appointments: [{ id: 1, deliusVersion: formAppointmentVersion }],
          })

          appointmentService.getAppointment.mockResolvedValue(appointment)
          appointmentFormService.getForm.mockResolvedValue(form)

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(bulkRequest, response, next)

          expect(appointmentService.saveAppointments).toHaveBeenCalledWith(
            projectCode,
            {
              updates: [
                expect.objectContaining({
                  alertActive: userSelectedValue,
                }),
              ],
            },
            'user-name',
          )
        })

        it.each([true, false, undefined])(
          'uses appointment value when user selected value is not set',
          async (appointmentValue?: boolean) => {
            mockPageInstance.isAlertSelected.mockReturnValue(null)
            mockPageInstance.exitForm.mockReturnValue('')
            const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

            const appointment = appointmentFactory.build({
              version: appointmentVersion,
              alertActive: appointmentValue,
            })
            const contactOutcome = contactOutcomeFactory.build({ attended: false })
            const form = appointmentOutcomeFormFactory.build({
              contactOutcome,
              deliusVersion: formAppointmentVersion,
              appointments: [{ id: 1, deliusVersion: formAppointmentVersion }],
            })

            appointmentService.getAppointment.mockResolvedValue(appointment)
            appointmentFormService.getForm.mockResolvedValue(form)

            const requestHandler = confirmController.submitUpdate()
            await requestHandler(bulkRequest, response, next)

            expect(appointmentService.saveAppointments).toHaveBeenCalledWith(
              projectCode,
              {
                updates: [
                  expect.objectContaining({
                    alertActive: appointmentValue,
                  }),
                ],
              },
              'user-name',
            )
          },
        )
      })

      describe('bulk sensitive data', () => {
        it.each([false, undefined, null, true])('uses appointment value', async (appointmentIsSensitive?: boolean) => {
          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointment = appointmentFactory.build({
            version: appointmentVersion,
            sensitive: appointmentIsSensitive,
          })
          const form = appointmentOutcomeFormFactory.build({
            deliusVersion: formAppointmentVersion,
            isSensitive: 'yes',
            appointments: [{ id: 1, deliusVersion: formAppointmentVersion }],
          })

          appointmentService.getAppointment.mockResolvedValue(appointment)
          appointmentFormService.getForm.mockResolvedValue(form)

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(bulkRequest, response, next)

          expect(appointmentService.saveAppointments).toHaveBeenCalledWith(
            projectCode,
            {
              updates: [
                expect.objectContaining({
                  sensitive: appointmentIsSensitive,
                }),
              ],
            },
            'user-name',
          )
        })
      })

      it('should send appointment start and end times if undefined on form', async () => {
        const nextPath = 'next'

        mockPageInstance.exitForm.mockReturnValue(nextPath)
        mockPageInstance.isAlertSelected.mockReturnValue(true)
        const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

        const appointment = appointmentFactory.build({ version: appointmentVersion })
        const contactOutcome = contactOutcomeFactory.build({ attended: true })
        const form = appointmentOutcomeFormFactory.build({
          startTime: undefined,
          endTime: undefined,
          contactOutcome,
          deliusVersion: formAppointmentVersion,
          isSensitive: 'yes',
          appointments: [{ id: appointment.id, deliusVersion: appointmentVersion }],
        })

        appointmentService.getAppointment.mockResolvedValueOnce(appointment)
        appointmentFormService.getForm.mockResolvedValue(form)

        const requestHandler = confirmController.submitUpdate()
        await requestHandler(bulkRequest, response, next)

        expect(appointmentService.saveAppointments).toHaveBeenCalledWith(
          projectCode,
          {
            updates: [
              {
                deliusId: appointment.id,
                deliusVersionToUpdate: appointment.version,
                alertActive: true,
                sensitive: appointment.sensitive,
                startTime: appointment.startTime,
                endTime: appointment.endTime,
                contactOutcomeCode: form.contactOutcome.code,
                attendanceData: form.attendanceData,
                supervisorOfficerCode: form.supervisor.code,
                date: appointment.date,
                notes: form.notes,
                projectCode: form.project.code,
              },
            ],
          },
          'user-name',
        )
      })

      describe('bulk update response handling', () => {
        it('should flash success message when all results are successful', async () => {
          const nextPath = 'next'
          mockPageInstance.exitForm.mockReturnValue(nextPath)
          mockPageInstance.isAlertSelected.mockReturnValue(true)
          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })
          const project = projectFactory.build()
          const appointments = appointmentFactory.buildList(2, { version: appointmentVersion })
          const contactOutcome = contactOutcomeFactory.build({ attended: true })
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome,
            deliusVersion: formAppointmentVersion,
            isSensitive: 'yes',
            appointments: [
              { id: appointments[0].id, deliusVersion: appointmentVersion },
              { id: appointments[1].id, deliusVersion: appointmentVersion },
            ],
            project: { code: project.projectCode },
          })

          projectService.getProject.mockResolvedValue(project)

          appointmentService.getAppointment
            .mockResolvedValueOnce(appointments[0])
            .mockResolvedValueOnce(appointments[1])
          appointmentFormService.getForm.mockResolvedValue(form)
          appointmentService.saveAppointments.mockResolvedValue({
            results: [
              updateAppointmentOutcomeResultFactory.build({ result: 'SUCCESS' }),
              updateAppointmentOutcomeResultFactory.build({ result: 'SUCCESS' }),
            ],
          })

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(bulkRequest, response, next)

          expect(bulkRequest.flash).toHaveBeenCalledWith('success', 'Attendance recorded for all selected people')
          expect(response.redirect).toHaveBeenCalledWith(nextPath)
        })

        it('should add a session link to the success message if project has changed', async () => {
          const nextPath = 'next'
          mockPageInstance.exitForm.mockReturnValue(nextPath)
          mockPageInstance.isAlertSelected.mockReturnValue(true)
          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })
          const project = projectFactory.build()
          const appointments = appointmentFactory.buildList(2, { version: appointmentVersion })
          const contactOutcome = contactOutcomeFactory.build({ attended: true })
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome,
            deliusVersion: formAppointmentVersion,
            isSensitive: 'yes',
            appointments: [
              { id: appointments[0].id, deliusVersion: appointmentVersion },
              { id: appointments[1].id, deliusVersion: appointmentVersion },
            ],
          })

          projectService.getProject.mockResolvedValue(project)

          appointmentService.getAppointment
            .mockResolvedValueOnce(appointments[0])
            .mockResolvedValueOnce(appointments[1])
          appointmentFormService.getForm.mockResolvedValue(form)
          appointmentService.saveAppointments.mockResolvedValue({
            results: [
              updateAppointmentOutcomeResultFactory.build({ result: 'SUCCESS' }),
              updateAppointmentOutcomeResultFactory.build({ result: 'SUCCESS' }),
            ],
          })

          jest.spyOn(HtmlUtils, 'getAnchor').mockReturnValue('<a></a>')

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(bulkRequest, response, next)

          expect(bulkRequest.flash).toHaveBeenCalledWith(
            'success',
            'Attendance recorded for all selected people on a different session. <a></a>',
          )
          expect(response.redirect).toHaveBeenCalledWith(nextPath)
          expect(HtmlUtils.getAnchor).toHaveBeenCalledWith(
            'View session',
            paths.sessions.show({ projectCode: form.project.code, date: sessionDate }),
          )
        })

        it('should flash error message when some results have errors', async () => {
          const nextPath = 'next'
          mockPageInstance.exitForm.mockReturnValue(nextPath)
          mockPageInstance.isAlertSelected.mockReturnValue(true)
          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointments = appointmentFactory.buildList(2, { version: appointmentVersion })
          const contactOutcome = contactOutcomeFactory.build({ attended: true })
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome,
            deliusVersion: formAppointmentVersion,
            isSensitive: 'yes',
            appointments: [
              { id: appointments[0].id, deliusVersion: appointmentVersion },
              { id: appointments[1].id, deliusVersion: appointmentVersion },
            ],
          })

          appointmentService.getAppointment
            .mockResolvedValueOnce(appointments[0])
            .mockResolvedValueOnce(appointments[1])
          appointmentFormService.getForm.mockResolvedValue(form)
          // Mock the response from saveAppointments with mixed results
          appointmentService.saveAppointments.mockResolvedValue({
            results: [
              updateAppointmentOutcomeResultFactory.build(),
              updateAppointmentOutcomeResultFactory.build({ result: 'SERVER_ERROR' }),
            ],
          })

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(bulkRequest, response, next)

          expect(bulkRequest.flash).toHaveBeenCalledWith(
            'error',
            'Some information could not be bulk updated. Update the missing attendance outcomes individually',
          )
          expect(response.redirect).toHaveBeenCalledWith(nextPath)
        })

        it('should flash error message when all results have errors', async () => {
          const nextPath = 'next'
          mockPageInstance.exitForm.mockReturnValue(nextPath)
          mockPageInstance.isAlertSelected.mockReturnValue(true)
          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointments = appointmentFactory.buildList(2, { version: appointmentVersion })
          const contactOutcome = contactOutcomeFactory.build({ attended: true })
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome,
            deliusVersion: formAppointmentVersion,
            isSensitive: 'yes',
            appointments: [
              { id: appointments[0].id, deliusVersion: appointmentVersion },
              { id: appointments[1].id, deliusVersion: appointmentVersion },
            ],
          })

          appointmentService.getAppointment
            .mockResolvedValueOnce(appointments[0])
            .mockResolvedValueOnce(appointments[1])
          appointmentFormService.getForm.mockResolvedValue(form)
          // Mock the response from saveAppointments with all errors
          appointmentService.saveAppointments.mockResolvedValue({
            results: [
              updateAppointmentOutcomeResultFactory.build({ result: 'VERSION_CONFLICT' }),
              updateAppointmentOutcomeResultFactory.build({ result: 'SERVER_ERROR' }),
            ],
          })

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(bulkRequest, response, next)

          expect(bulkRequest.flash).toHaveBeenCalledWith(
            'error',
            'Some information could not be bulk updated. Update the missing attendance outcomes individually',
          )
          expect(response.redirect).toHaveBeenCalledWith(nextPath)
        })

        it('calls catchApiValidationErrorOrPropagate when saveAppointment throws a SanitisedError', async () => {
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

          mockPageInstance.isAlertSelected.mockReturnValue(true)
          mockPageInstance.updatePath.mockReturnValue('/update/path')
          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointment = appointmentFactory.build({ version: appointmentVersion })
          const contactOutcome = contactOutcomeFactory.build({ attended: true })
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome,
            deliusVersion: formAppointmentVersion,
          })

          appointmentService.getAppointment.mockResolvedValue(appointment)
          appointmentFormService.getForm.mockResolvedValue(form)
          appointmentService.saveAppointment.mockRejectedValue(error)

          const requestHandler = confirmController.submitUpdate()
          await requestHandler(request, response, next)

          expect(ErrorUtils.catchApiValidationErrorOrPropagate).toHaveBeenCalledWith(
            request,
            response,
            error,
            '/update/path',
          )
        })
      })
    })

    it('does not call projectService.getProject when getAppointmentOrSession returns session', async () => {
      const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })
      const form = appointmentOutcomeFormFactory.build()
      const session = sessionFactory.build({ projectCode })

      getAppointmentOrSessionMock.mockResolvedValue({ session })
      appointmentFormService.getForm.mockResolvedValue(form)
      mockPageInstance.validationErrors.mockReturnValue({
        hasErrors: true,
        errors: { alertPractitioner: { text: 'error' } },
        errorSummary: [{ text: 'error', href: '#alertPractitioner' }],
      })

      const requestHandler = confirmController.submitUpdate()
      await requestHandler(request, response, next)

      expect(projectService.getProject).not.toHaveBeenCalled()
    })

    it('calls projectService.getProject when getAppointmentOrSession returns appointment', async () => {
      const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })
      const form = appointmentOutcomeFormFactory.build()
      const appointment = appointmentFactory.build()

      getAppointmentOrSessionMock.mockResolvedValue({ appointment })
      appointmentFormService.getForm.mockResolvedValue(form)
      projectService.getProject.mockResolvedValue(projectFactory.build({ projectCode }))
      mockPageInstance.validationErrors.mockReturnValue({
        hasErrors: true,
        errors: { alertPractitioner: { text: 'error' } },
        errorSummary: [{ text: 'error', href: '#alertPractitioner' }],
      })

      const requestHandler = confirmController.submitUpdate()
      await requestHandler(request, response, next)

      expect(projectService.getProject).toHaveBeenCalledWith({
        username: 'user-name',
        projectCode,
      })
    })
  })
})
