import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import ConfirmController from './confirmController'
import ConfirmPage from '../../../pages/appointments/otherEte/confirmPage'
import AppointmentFormService from '../../../services/forms/appointmentFormService'
import OffenderService from '../../../services/offenderService'
import AppointmentService from '../../../services/appointmentService'
import createAppointmentFormFactory from '../../../testutils/factories/createAppointmentFormFactory'
import caseDetailsSummaryFactory from '../../../testutils/factories/caseDetailsSummaryFactory'
import { contactOutcomeFactory } from '../../../testutils/factories/contactOutcomeFactory'
import AppointmentUtils from '../../../utils/appointmentUtils'
import paths from '../../../paths'
import { buildOtherEtePath } from '../../../pages/appointments/otherEte/pathMap'
import createdAppointmentFactory from '../../../testutils/factories/createdAppointmentFactory'
import * as Utils from '../../../utils/utils'

describe('ConfirmController', () => {
  const crn = 'X123456'
  const deliusEventNumber = '2'
  const formId = 'form-1'
  const username = 'user'

  const formService = createMock<AppointmentFormService>()
  const offenderService = createMock<OffenderService>()
  const appointmentService = createMock<AppointmentService>()

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const submittedItems = [{ key: { text: 'Region' }, value: { text: 'Region name' } }]
  const alertQuestionDetails = {
    alertPractitionerItems: [{ text: 'Yes', value: 'yes', checked: false }],
    showWillAlertPractitionerMessage: false,
    alertDiaryText: 'Would you like this to be sent to the alert diary?',
  }
  const caseDetailsSummary = caseDetailsSummaryFactory.build()
  const heading = { title: 'title', caption: 'caption' }

  let controller: ConfirmController

  beforeEach(() => {
    jest.resetAllMocks()

    controller = new ConfirmController(formService, offenderService, appointmentService)

    offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
    jest.spyOn(ConfirmPage, 'formItems').mockReturnValue(submittedItems)
    jest.spyOn(ConfirmPage, 'alertQuestionDetails').mockReturnValue(alertQuestionDetails)
    jest.spyOn(AppointmentUtils, 'appointmentHeading').mockReturnValue(heading)
  })

  describe('show', () => {
    it('renders the confirm template with the summary items and alert question', async () => {
      const form = createAppointmentFormFactory.build({ crn, deliusEventNumber })
      formService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({ params: { crn, deliusEventNumber }, query: { form: formId } })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(ConfirmPage.formItems).toHaveBeenCalledWith(form, formId)
      expect(ConfirmPage.alertQuestionDetails).toHaveBeenCalledWith(form)
      expect(response.locals.audit).toEqual({ subjectType: 'CRN', subjectId: crn })

      expect(response.render).toHaveBeenCalledWith('appointments/update/confirm', {
        heading,
        backLink: buildOtherEtePath('compliance', formId),
        updatePath: buildOtherEtePath('confirm', formId),
        form: formId,
        submittedItems,
        ...alertQuestionDetails,
        errors: {},
      })
    })
  })

  describe('submitUpdate', () => {
    it('re-renders the template with errors when no alert selection is made', async () => {
      const form = createAppointmentFormFactory.build({ crn, deliusEventNumber })
      formService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({
        params: { crn, deliusEventNumber },
        query: { form: formId },
        body: {},
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(appointmentService.createAppointment).not.toHaveBeenCalled()
      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/confirm',
        expect.objectContaining({
          errors: { alertPractitioner: { text: 'Choose whether you want to send an alert' } },
        }),
      )
    })

    it('creates the appointment and redirects to the created appointment details page', async () => {
      const contactOutcome = contactOutcomeFactory.build({ code: 'ATTENDED' })
      const form = createAppointmentFormFactory.build({
        crn,
        deliusEventNumber,
        project: { code: 'PROJECT-1', name: 'Project name' },
        contactOutcome,
        originalPath: undefined,
      })
      formService.getForm.mockResolvedValue(form)

      const createdAppointment = createdAppointmentFactory.build()
      appointmentService.createAppointment.mockResolvedValue(createdAppointment)

      const createdAppointmentPath = '/appointment'
      jest.spyOn(Utils, 'pathWithOriginalPath').mockReturnValue(createdAppointmentPath)

      const request = createMock<Request>({
        params: { crn, deliusEventNumber },
        query: { form: formId },
        body: { alertPractitioner: 'yes' },
        flash: jest.fn(),
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(appointmentService.createAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          crn,
          deliusEventNumber: Number(deliusEventNumber),
          projectCode: 'PROJECT-1',
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          contactOutcomeCode: contactOutcome.code,
          attendanceData: form.attendanceData,
          alertActive: true,
          notes: form.notes,
        }),
        username,
      )
      expect(response.locals.audit).toEqual({ subjectType: 'CRN', subjectId: crn })
      expect(request.flash).toHaveBeenCalledWith('success', 'Attendance recorded')
      expect(response.redirect).toHaveBeenCalledWith(createdAppointmentPath)
      expect(Utils.pathWithOriginalPath).toHaveBeenCalledWith(
        paths.appointments.details({
          projectCode: 'PROJECT-1',
          appointmentId: createdAppointment.deliusId.toString(),
        }),
        form.originalPath,
      )
    })

    it('redirects back to the confirm page with a flash error when the API returns a validation error', async () => {
      const form = createAppointmentFormFactory.build({
        crn,
        deliusEventNumber,
        contactOutcome: contactOutcomeFactory.build(),
      })
      formService.getForm.mockResolvedValue(form)

      const apiError = { responseStatus: 400, data: { userMessage: 'Some validation error' } }
      appointmentService.createAppointment.mockRejectedValue(apiError)

      const request = createMock<Request>({
        params: { crn, deliusEventNumber },
        query: { form: formId },
        body: { alertPractitioner: 'yes' },
        flash: jest.fn(),
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(request.flash).toHaveBeenCalledWith('error', 'Some validation error')
      expect(response.redirect).toHaveBeenCalledWith(buildOtherEtePath('confirm', formId))
    })
  })
})
