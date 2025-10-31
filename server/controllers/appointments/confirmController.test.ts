import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import ConfirmPage from '../../pages/appointments/confirmPage'
import ConfirmController from './confirmController'
import AppointmentService from '../../services/appointmentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import AppointmentFormService, { Form } from '../../services/appointmentFormService'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import SessionUtils from '../../utils/sessionUtils'

jest.mock('../../pages/appointments/confirmPage')

describe('ConfirmController', () => {
  const appointmentId = '1'
  const formId = '123'
  const request: DeepMocked<Request> = createMock<Request>({ params: { appointmentId, form: formId } })
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
      const form = { startTime: '09:00', contactOutcomeId: '1' }

      confirmPageMock.mockImplementationOnce(() => {
        return {
          viewData: () => pageViewData,
        }
      })
      const appointment = appointmentFactory.build()

      const response = createMock<Response>()
      appointmentService.getAppointment.mockResolvedValue(appointment)
      appointmentFormService.getForm.mockResolvedValue({ key: { id: formId, type: 'some-key' }, data: form })

      const requestHandler = confirmController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/update/confirm', pageViewData)
    })
  })

  describe('submit', () => {
    it('should send appointment data and redirect to checkProjectDetails page', async () => {
      const response = createMock<Response>({ locals: { user: { name: 'user-name' } } })

      const appointment = appointmentFactory.build()
      const form: Form = {
        key: { id: 'form-key', type: 'form-type' },
        data: appointmentOutcomeFormFactory.build(),
      }

      appointmentService.getAppointment.mockResolvedValue(appointment)
      appointmentFormService.getForm.mockResolvedValue(form)

      const requestHandler = confirmController.submit()
      await requestHandler(request, response, next)

      expect(appointmentService.saveAppointment).toHaveBeenCalledWith(
        {
          deliusId: appointment.id,
          deliusVersionToUpdate: appointment.version,
          alertActive: appointment.alertActive,
          sensitive: appointment.sensitive,
          startTime: form.data.startTime,
          endTime: form.data.endTime,
          contactOutcomeId: form.data.contactOutcome.id,
          attendanceData: form.data.attendanceData,
          supervisorOfficerCode: form.data.supervisorOfficerCode,
          notes: form.data.notes,
          formKeyToDelete: form.key,
        },
        'user-name',
      )
      expect(response.redirect).toHaveBeenCalledWith(SessionUtils.getSessionPath(appointment))
    })
  })
})
