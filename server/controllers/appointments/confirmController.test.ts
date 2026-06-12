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
import offenderFullFactory from '../../testutils/factories/offenderFullFactory'

jest.mock('../../pages/appointments/confirmPage')

describe('ConfirmController', () => {
  const appointmentId = '1'
  const projectCode = '2'
  const formId = '123'

  const request: DeepMocked<Request> = createMock<Request>({
    params: { appointmentId, projectCode, form: formId },
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

  beforeEach(() => {
    jest.resetAllMocks()
    confirmController = new ConfirmController(
      appointmentService,
      appointmentFormService,
      projectService,
      sessionService,
    )
  })

  describe('show', () => {
    it('should render the check appointment details page', async () => {
      const form = appointmentOutcomeFormFactory.build()

      confirmPageMock.mockImplementationOnce(() => {
        return {
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
          viewData: () => pageViewData,
          formId,
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
      it('should send appointment data and redirect to checkAppointmentDetails page', async () => {
        const nextPath = 'next'
        confirmPageMock.mockImplementationOnce(() => {
          return {
            exitForm: () => nextPath,
            isAlertSelected: true,
          }
        })
        const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

        const appointment = appointmentFactory.build({ version: appointmentVersion })
        const contactOutcome = contactOutcomeFactory.build({ attended: true })
        const form = appointmentOutcomeFormFactory.build({
          contactOutcome,
          deliusVersion: formAppointmentVersion,
          isSensitive: 'yes',
        })

        appointmentService.getAppointment.mockResolvedValue(appointment)
        appointmentFormService.getForm.mockResolvedValue(form)

        const requestHandler = confirmController.submit()
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
          },
          'user-name',
        )
        expect(response.redirect).toHaveBeenCalledWith(nextPath)
      })

      it('should save appointmentData without attendance data if did not attend', async () => {
        const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

        const appointment = appointmentFactory.build({ version: appointmentVersion })
        const contactOutcome = contactOutcomeFactory.build({ attended: false })
        const form = appointmentOutcomeFormFactory.build({ contactOutcome, deliusVersion: formAppointmentVersion })

        appointmentService.getAppointment.mockResolvedValue(appointment)
        appointmentFormService.getForm.mockResolvedValue(form)

        const requestHandler = confirmController.submit()
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
                isAlertSelected: userSelectedValue,
                exitForm: () => '',
              }
            })
            const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

            const appointment = appointmentFactory.build({ version: appointmentVersion })
            const contactOutcome = contactOutcomeFactory.build({ attended: false })
            const form = appointmentOutcomeFormFactory.build({ contactOutcome, deliusVersion: formAppointmentVersion })

            appointmentService.getAppointment.mockResolvedValue(appointment)
            appointmentFormService.getForm.mockResolvedValue(form)

            const requestHandler = confirmController.submit()
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
                isAlertSelected: null,
                exitForm: () => '',
              }
            })
            const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

            const appointment = appointmentFactory.build({ version: appointmentVersion, alertActive: appointmentValue })
            const contactOutcome = contactOutcomeFactory.build({ attended: false })
            const form = appointmentOutcomeFormFactory.build({ contactOutcome, deliusVersion: formAppointmentVersion })

            appointmentService.getAppointment.mockResolvedValue(appointment)
            appointmentFormService.getForm.mockResolvedValue(form)

            const requestHandler = confirmController.submit()
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

          const requestHandler = confirmController.submit()
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

            const requestHandler = confirmController.submit()
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

        const requestHandler = confirmController.submit()
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
            isAlertSelected: true,
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

        const requestHandler = confirmController.submit()
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

      beforeEach(() => {
        bulkRequest = createMock<Request>({
          params: { projectCode, date: '2026-06-01' },
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
            isAlertSelected: true,
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

        const requestHandler = confirmController.submit()
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
            isAlertSelected: false,
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

        const requestHandler = confirmController.submit()
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
            isAlertSelected: false,
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

        const requestHandler = confirmController.submit()
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
              isAlertSelected: userSelectedValue,
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

          const requestHandler = confirmController.submit()
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
                isAlertSelected: null,
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

            const requestHandler = confirmController.submit()
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

          const requestHandler = confirmController.submit()
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

      it('should call catchApiValidationErrorOrPropagate when saveAppointments throws a SanitisedError', async () => {
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
            isAlertSelected: false,
            updatePath: () => '/bulk/update/path',
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
        appointmentService.saveAppointments.mockRejectedValue(error)

        const requestHandler = confirmController.submit()
        await requestHandler(bulkRequest, response, next)

        expect(ErrorUtils.catchApiValidationErrorOrPropagate).toHaveBeenCalledWith(
          bulkRequest,
          response,
          error,
          '/bulk/update/path',
        )
      })

      it('should send appointment start and end times if undefined on form', async () => {
        const nextPath = 'next'

        confirmPageMock.mockImplementationOnce(() => {
          return {
            exitForm: () => nextPath,
            isAlertSelected: true,
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

        const requestHandler = confirmController.submit()
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
              },
            ],
          },
          'user-name',
        )
      })

      describe('validation errors', () => {
        it('calls flash with a single validation error', async () => {
          const offender = offenderFullFactory.build()
          const nextPath = 'next'
          const message = `The appointments have already been updated in the database. Try again.`
          const deliusVersionChangedMessage = jest.fn().mockReturnValue(message)
          confirmPageMock.mockImplementationOnce(() => {
            return {
              exitForm: () => nextPath,
              deliusVersionChangedMessage,
            }
          })
          formAppointmentVersion = '1'
          appointmentVersion = '2'

          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointments = appointmentFactory.buildList(2, {
            version: appointmentVersion,
            offender,
          })
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome: contactOutcomeFactory.build({ attended: false }),
            appointments: [
              { id: appointments[0].id, deliusVersion: formAppointmentVersion },
              { id: appointments[1].id, deliusVersion: appointmentVersion },
            ],
          })
          appointmentService.getAppointment
            .mockResolvedValueOnce(appointments[0])
            .mockResolvedValueOnce(appointments[1])
          appointmentFormService.getForm.mockResolvedValue(form)

          const requestHandler = confirmController.submit()
          await requestHandler(bulkRequest, response, next)

          expect(appointmentService.getAppointment).toHaveBeenCalledTimes(2)
          expect(appointmentService.saveAppointments).toHaveBeenCalledWith(
            projectCode,
            {
              updates: [
                expect.objectContaining({
                  deliusId: appointments[1].id,
                  deliusVersionToUpdate: appointments[1].version,
                }),
              ],
            },
            'user-name',
          )
          expect(bulkRequest.flash).toHaveBeenCalledWith('error', message)
          expect(deliusVersionChangedMessage).toHaveBeenCalledWith([appointments[0]])
          expect(bulkRequest.flash).toHaveBeenCalledWith('success', 'Attendance recorded')
          expect(response.redirect).toHaveBeenCalledWith(nextPath)
        })

        it('calls flash with multiple validation errors', async () => {
          const offenders = offenderFullFactory.buildList(3)
          const nextPath = 'next'
          const message = `The appointments have already been updated in the database. Try again.`
          const deliusVersionChangedMessage = jest.fn().mockReturnValue(message)
          confirmPageMock.mockImplementationOnce(() => {
            return {
              exitForm: () => nextPath,
              deliusVersionChangedMessage,
            }
          })
          formAppointmentVersion = '1'
          appointmentVersion = '2'

          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointments = offenders.map(offender =>
            appointmentFactory.build({
              version: appointmentVersion,
              offender,
            }),
          )
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome: contactOutcomeFactory.build({ attended: false }),
            appointments: [
              { id: appointments[0].id, deliusVersion: formAppointmentVersion },
              { id: appointments[1].id, deliusVersion: appointmentVersion },
              { id: appointments[2].id, deliusVersion: formAppointmentVersion },
            ],
          })
          appointmentService.getAppointment
            .mockResolvedValueOnce(appointments[0])
            .mockResolvedValueOnce(appointments[1])
            .mockResolvedValue(appointments[2])
          appointmentFormService.getForm.mockResolvedValue(form)

          const requestHandler = confirmController.submit()
          await requestHandler(bulkRequest, response, next)

          expect(appointmentService.saveAppointments).toHaveBeenCalledWith(
            projectCode,
            {
              updates: [
                expect.objectContaining({
                  deliusId: appointments[1].id,
                  deliusVersionToUpdate: appointments[1].version,
                }),
              ],
            },
            'user-name',
          )
          expect(bulkRequest.flash).toHaveBeenCalledWith('error', message)
          expect(deliusVersionChangedMessage).toHaveBeenCalledWith([appointments[0], appointments[2]])
          expect(bulkRequest.flash).toHaveBeenCalledWith('success', 'Attendance recorded')
          expect(response.redirect).toHaveBeenCalledWith(nextPath)
        })

        it('does not attempt submit if no valid appointments', async () => {
          const offenders = offenderFullFactory.buildList(2)
          const nextPath = 'next'
          const message = `The appointments have already been updated in the database. Try again.`
          const deliusVersionChangedMessage = jest.fn().mockReturnValue(message)
          confirmPageMock.mockImplementationOnce(() => {
            return {
              exitForm: () => nextPath,
              deliusVersionChangedMessage,
            }
          })
          formAppointmentVersion = '1'
          appointmentVersion = '2'

          const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

          const appointments = offenders.map(offender =>
            appointmentFactory.build({
              version: appointmentVersion,
              offender,
            }),
          )
          const form = appointmentOutcomeFormFactory.build({
            contactOutcome: contactOutcomeFactory.build({ attended: false }),
            appointments: [
              { id: appointments[0].id, deliusVersion: formAppointmentVersion },
              { id: appointments[1].id, deliusVersion: formAppointmentVersion },
            ],
          })
          appointmentService.getAppointment
            .mockResolvedValueOnce(appointments[0])
            .mockResolvedValueOnce(appointments[1])
          appointmentFormService.getForm.mockResolvedValue(form)

          const requestHandler = confirmController.submit()
          await requestHandler(bulkRequest, response, next)

          expect(appointmentService.saveAppointments).not.toHaveBeenCalled()

          expect(bulkRequest.flash).toHaveBeenCalledWith('error', message)
          expect(deliusVersionChangedMessage).toHaveBeenCalledWith(appointments)
          expect(bulkRequest.flash).not.toHaveBeenCalledWith('success', 'Attendance recorded')
          expect(response.redirect).toHaveBeenCalledWith(nextPath)
        })
      })
    })
  })
})
