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
import * as ErrorUtils from '../../utils/errorUtils'
import SessionService from '../../services/sessionService'
import updateAppointmentOutcomeResultFactory from '../../testutils/factories/updateAppointmentOutcomeResultFactory'
import HtmlUtils from '../../utils/htmlUtils'
import paths from '../../paths'
import OffenderService from '../../services/offenderService'
import caseDetailsSummaryFactory from '../../testutils/factories/caseDetailsSummaryFactory'

jest.mock('../../pages/appointments/confirmPage')

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
  const pageViewData = {
    preventDoubleClick: true,
    someKey: 'some value',
  }

  let confirmController: ConfirmController
  const appointmentService = createMock<AppointmentService>()
  const appointmentFormService = createMock<AppointmentFormService>()
  const projectService = createMock<ProjectService>()
  const sessionService = createMock<SessionService>()
  const offenderService = createMock<OffenderService>()

  beforeEach(() => {
    jest.resetAllMocks()
    confirmController = new ConfirmController(
      appointmentService,
      appointmentFormService,
      projectService,
      sessionService,
      offenderService,
    )
  })

  describe('create', () => {
    it('should render the check appointment details page for a new appointment', async () => {
      const form = appointmentOutcomeFormFactory.build({ date: '2026-01-01' })
      const navigationPaths = { backLink: '/back', updatePath: '/update' }
      const caseDetailsSummary = caseDetailsSummaryFactory.build()
      const heading = { title: 'Some Name', caption: 'X123456' }

      const viewDataSpy = jest.fn().mockReturnValue(pageViewData)
      const pathsSpy = jest.fn().mockReturnValue(navigationPaths)
      const offenderHeadingSpy = jest.fn().mockReturnValue(heading)
      confirmPageMock.mockImplementationOnce(() => {
        return {
          paths: pathsSpy,
          viewData: viewDataSpy,
          offenderHeading: offenderHeadingSpy,
        }
      })

      const response = createMock<Response>({ locals: { user: { username: 'user-name' }, errorMessages: [] } })
      appointmentFormService.getForm.mockResolvedValue(form)
      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

      const requestHandler = confirmController.create()
      await requestHandler(request, response, next)

      expect(pathsSpy).toHaveBeenCalledWith({
        pathData: { projectCode, appointmentId: 'create' },
        form,
        formId,
      })
      expect(viewDataSpy).toHaveBeenCalledWith(
        undefined,
        { projectCode, appointmentId: 'create', date: form.date },
        form,
        formId,
      )
      expect(offenderHeadingSpy).toHaveBeenCalledWith(caseDetailsSummary.offender)
      expect(response.render).toHaveBeenCalledWith('appointments/update/confirm', {
        heading,
        ...navigationPaths,
        ...pageViewData,
        errorList: undefined,
        preventDoubleClick: true,
      })
    })

    it('should render the page with errorList when errorMessages are present', async () => {
      const errorMessages = ['Start time is required', 'End time is required']
      const form = appointmentOutcomeFormFactory.build({ date: '2026-01-01' })
      const caseDetailsSummary = caseDetailsSummaryFactory.build()

      confirmPageMock.mockImplementationOnce(() => {
        return {
          paths: () => ({}),
          viewData: () => pageViewData,
          offenderHeading: () => ({ title: 'Some Name', caption: 'X123456' }),
        }
      })

      const response = createMock<Response>({
        locals: { user: { username: 'user-name' }, errorMessages },
      })
      appointmentFormService.getForm.mockResolvedValue(form)
      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

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

      confirmPageMock.mockImplementationOnce(() => {
        return {
          commonViewData: () => ({}),
          viewData: () => pageViewData,
        }
      })
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

      confirmPageMock.mockImplementationOnce(() => {
        return {
          commonViewData: () => ({}),
          viewData: () => pageViewData,
        }
      })

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
        confirmPageMock.mockImplementationOnce(() => {
          return {
            exitForm: () => nextPath,
            isAlertSelected: () => true,
          }
        })
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
        confirmPageMock.mockImplementationOnce(() => {
          return {
            exitForm: () => nextPath,
            isAlertSelected: () => true,
          }
        })
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

      describe('alertActive', () => {
        it.each([true, false])(
          'any user selected value is submitted with the update',
          async (userSelectedValue: boolean) => {
            confirmPageMock.mockImplementationOnce(() => {
              return {
                isAlertSelected: () => userSelectedValue,
                exitForm: () => '',
              }
            })
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
            confirmPageMock.mockImplementationOnce(() => {
              return {
                isAlertSelected: (): boolean | null => null,
                exitForm: () => '',
              }
            })
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
        confirmPageMock.mockImplementationOnce(() => {
          return {
            exitForm: () => nextPath,
            isAlertSelected: (): boolean | null => null,
          }
        })
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

        confirmPageMock.mockImplementationOnce(() => {
          return {
            isAlertSelected: () => true,
            updatePath: () => '/update/path',
          }
        })
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
        confirmPageMock.mockImplementationOnce(() => {
          return {
            exitForm: () => nextPath,
            isAlertSelected: () => true,
          }
        })
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

        appointmentService.getAppointment.mockResolvedValueOnce(appointments[0]).mockResolvedValueOnce(appointments[1])
        appointmentFormService.getForm.mockResolvedValue(form)

        const requestHandler = confirmController.submitUpdate()
        await requestHandler(bulkRequest, response, next)

        expect(appointmentService.getAppointment).toHaveBeenCalledTimes(2)
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
        confirmPageMock.mockImplementationOnce(() => {
          return {
            exitForm: () => '',
            isAlertSelected: () => false,
          }
        })
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
        confirmPageMock.mockImplementationOnce(() => {
          return {
            exitForm: () => '',
            isAlertSelected: () => false,
          }
        })
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

      describe('alertActive', () => {
        it.each([true, false])('uses user selected value for alertActive', async (userSelectedValue: boolean) => {
          confirmPageMock.mockImplementationOnce(() => {
            return {
              isAlertSelected: () => userSelectedValue,
              exitForm: () => '',
            }
          })
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
            confirmPageMock.mockImplementationOnce(() => {
              return {
                isAlertSelected: (): boolean | null => null,
                exitForm: () => '',
              }
            })
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

        confirmPageMock.mockImplementationOnce(() => {
          return {
            exitForm: () => nextPath,
            isAlertSelected: () => true,
          }
        })
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
          confirmPageMock.mockImplementationOnce(() => {
            return {
              exitForm: () => nextPath,
              isAlertSelected: () => true,
            }
          })
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
          confirmPageMock.mockImplementationOnce(() => {
            return {
              exitForm: () => nextPath,
              isAlertSelected: () => true,
            }
          })
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
          confirmPageMock.mockImplementationOnce(() => {
            return {
              exitForm: () => nextPath,
              isAlertSelected: () => true,
            }
          })
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
          confirmPageMock.mockImplementationOnce(() => {
            return {
              exitForm: () => nextPath,
              isAlertSelected: () => true,
            }
          })
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

          confirmPageMock.mockImplementationOnce(() => {
            return {
              isAlertSelected: () => true,
              updatePath: () => '/update/path',
            }
          })
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
  })
})
