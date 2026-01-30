import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import ConfirmPage from '../../pages/appointments/confirmPage'
import ConfirmController from './confirmController'
import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import AppointmentFormService from '../../services/appointmentFormService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import SessionUtils from '../../utils/sessionUtils'
import { contactOutcomeFactory } from '../../testutils/factories/contactOutcomeFactory'

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
    someKey: 'some value',
  }

  let confirmController: ConfirmController
  const appointmentService = createMock<AppointmentService>()
  const appointmentFormService = createMock<AppointmentFormService>()

  beforeEach(() => {
    jest.resetAllMocks()
    confirmController = new ConfirmController(appointmentService, appointmentFormService)
  })

  describe('show', () => {
    it('should render the check project details page', async () => {
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
  })

  describe('submit', () => {
    let formAppointmentVersion: string
    let appointmentVersion: string

    beforeEach(() => {
      formAppointmentVersion = '1'
      appointmentVersion = '1'
    })

    it('should send appointment data and redirect to checkProjectDetails page', async () => {
      const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

      const appointment = appointmentFactory.build({ version: appointmentVersion })
      const contactOutcome = contactOutcomeFactory.build({ attended: true })
      const form = appointmentOutcomeFormFactory.build({ contactOutcome, deliusVersion: formAppointmentVersion })
      const key = { id: '1', type: 'type' }

      appointmentService.getAppointment.mockResolvedValue(appointment)
      appointmentFormService.getForm.mockResolvedValue(form)
      appointmentFormService.getFormKey.mockReturnValue(key)

      const requestHandler = confirmController.submit()
      await requestHandler(request, response, next)

      expect(appointmentService.saveAppointment).toHaveBeenCalledWith(
        appointment.projectCode,
        {
          deliusId: appointment.id,
          deliusVersionToUpdate: appointment.version,
          alertActive: appointment.alertActive,
          sensitive: appointment.sensitive,
          startTime: form.startTime,
          endTime: form.endTime,
          contactOutcomeCode: form.contactOutcome.code,
          attendanceData: form.attendanceData,
          supervisorOfficerCode: form.supervisor.code,
          notes: form.notes,
          formKeyToDelete: key,
        },
        'user-name',
      )
      expect(response.redirect).toHaveBeenCalledWith(SessionUtils.getSessionPath(appointment))
    })

    it('should save appointmentData without attendance data if did not attend', async () => {
      const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

      const appointment = appointmentFactory.build({ version: appointmentVersion })
      const contactOutcome = contactOutcomeFactory.build({ attended: false })
      const form = appointmentOutcomeFormFactory.build({ contactOutcome, deliusVersion: formAppointmentVersion })
      const key = { id: '1', type: 'type' }

      appointmentService.getAppointment.mockResolvedValue(appointment)
      appointmentFormService.getForm.mockResolvedValue(form)
      appointmentFormService.getFormKey.mockReturnValue(key)

      const requestHandler = confirmController.submit()
      await requestHandler(request, response, next)

      expect(appointmentService.saveAppointment).toHaveBeenCalledWith(
        appointment.projectCode,
        expect.objectContaining({ attendanceData: undefined }),
        'user-name',
      )
    })

    it('redirects to session page if appointment was updated elsewhere', async () => {
      formAppointmentVersion = '1'
      appointmentVersion = '2'

      const response = createMock<Response>({ locals: { user: { username: 'user-name' } } })

      const appointment = appointmentFactory.build({ version: appointmentVersion })
      const contactOutcome = contactOutcomeFactory.build({ attended: false })
      const form = appointmentOutcomeFormFactory.build({ contactOutcome, deliusVersion: formAppointmentVersion })
      const key = { id: '1', type: 'type' }

      appointmentService.getAppointment.mockResolvedValue(appointment)
      appointmentFormService.getForm.mockResolvedValue(form)
      appointmentFormService.getFormKey.mockReturnValue(key)

      const requestHandler = confirmController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(SessionUtils.getSessionPath(appointment))
      expect(request.flash).toHaveBeenCalledWith(
        'error',
        'The arrival time has already been updated in the database, try again.',
      )
    })
  })
})
