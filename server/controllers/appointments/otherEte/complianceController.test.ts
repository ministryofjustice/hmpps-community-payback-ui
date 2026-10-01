import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import ComplianceController from './complianceController'
import AppointmentFormService from '../../../services/forms/appointmentFormService'
import OffenderService from '../../../services/offenderService'
import createAppointmentFormFactory from '../../../testutils/factories/createAppointmentFormFactory'
import caseDetailsSummaryFactory from '../../../testutils/factories/caseDetailsSummaryFactory'
import ComplianceQuestions, { ComplianceQuestionsViewData } from '../../../utils/components/complianceQuestions'
import AppointmentUtils from '../../../utils/appointmentUtils'
import { buildOtherEtePath } from '../../../pages/appointments/otherEte/pathMap'

describe('ComplianceController', () => {
  const crn = 'X123456'
  const deliusEventNumber = '2'
  const formId = 'form-1'
  const username = 'user'

  const formService = createMock<AppointmentFormService>()
  const offenderService = createMock<OffenderService>()

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const stepViewData: ComplianceQuestionsViewData = { workQualityItems: [], behaviourItems: [] }
  const caseDetailsSummary = caseDetailsSummaryFactory.build()
  const heading = { title: 'title', caption: 'caption' }

  let controller: ComplianceController

  beforeEach(() => {
    jest.resetAllMocks()

    controller = new ComplianceController(formService, offenderService)

    offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
    jest.spyOn(ComplianceQuestions, 'viewData').mockReturnValue(stepViewData)
    jest.spyOn(AppointmentUtils, 'appointmentHeading').mockReturnValue(heading)
  })

  describe('show', () => {
    it('renders the log compliance template', async () => {
      const form = createAppointmentFormFactory.build({ crn, deliusEventNumber })
      formService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({ params: { crn, deliusEventNumber }, query: { form: formId }, body: {} })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(ComplianceQuestions.viewData).toHaveBeenCalledWith(form, {})

      expect(response.render).toHaveBeenCalledWith('appointments/update/logCompliance', {
        heading,
        backLink: buildOtherEtePath('outcome', formId),
        updatePath: buildOtherEtePath('compliance', formId),
        form: formId,
        ...stepViewData,
        errors: {},
      })
    })
  })

  describe('submitUpdate', () => {
    it('saves the selected compliance answers and redirects to the confirm page', async () => {
      const form = createAppointmentFormFactory.build({ crn, deliusEventNumber })
      formService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({
        params: { crn, deliusEventNumber },
        query: { form: formId },
        body: { workQuality: 'GOOD', behaviour: 'EXCELLENT' },
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(formService.saveForm).toHaveBeenCalledWith(
        formId,
        username,
        expect.objectContaining({
          attendanceData: expect.objectContaining({ workQuality: 'GOOD', behaviour: 'EXCELLENT' }),
        }),
      )
      expect(response.redirect).toHaveBeenCalledWith(buildOtherEtePath('confirm', formId))
    })

    it('re-renders the template with errors when no work quality is selected', async () => {
      const form = createAppointmentFormFactory.build({ crn, deliusEventNumber })
      formService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({
        params: { crn, deliusEventNumber },
        query: { form: formId },
        body: { behaviour: 'EXCELLENT' },
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(formService.saveForm).not.toHaveBeenCalled()
      expect(response.render).toHaveBeenCalledWith(
        'appointments/update/logCompliance',
        expect.objectContaining({
          errors: { workQuality: { text: 'Select their work quality' } },
        }),
      )
    })
  })
})
