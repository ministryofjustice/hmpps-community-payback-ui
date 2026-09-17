import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import ActivityController from './activityController'
import RecordActivityFormService from '../../../services/forms/recordActivityFormService'
import OffenderService from '../../../services/offenderService'
import ReferenceDataService from '../../../services/referenceDataService'
import RecordActivityPage from '../../../pages/appointments/otherEte/recordActivityPage'
import recordActivityFormFactory from '../../../testutils/factories/recordActivityFormFactory'
import caseDetailsSummaryFactory from '../../../testutils/factories/caseDetailsSummaryFactory'
import unpaidWorkDetailsFactory from '../../../testutils/factories/unpaidWorkDetailsFactory'
import { contactOutcomeFactory, contactOutcomesFactory } from '../../../testutils/factories/contactOutcomeFactory'
import { buildOtherEtePath } from '../../../pages/appointments/otherEte/pathMap'

describe('ActivityController', () => {
  const crn = 'X123456'
  const deliusEventNumber = '2'
  const formId = 'form-1'
  const username = 'user'

  const formService = createMock<RecordActivityFormService>()
  const offenderService = createMock<OffenderService>()
  const referenceDataService = createMock<ReferenceDataService>()

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const attendedOutcome = contactOutcomeFactory.build({ code: 'ATTENDED', attended: true })
  const nonAttendedOutcome = contactOutcomeFactory.build({ code: 'NOT-ATTENDED', attended: false })
  const requirement = unpaidWorkDetailsFactory.build({ eventNumber: Number(deliusEventNumber) })
  const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [requirement] })

  const stepViewData = { stepKey: 'step value' }

  let controller: ActivityController

  beforeEach(() => {
    jest.resetAllMocks()

    controller = new ActivityController(formService, offenderService, referenceDataService)

    referenceDataService.getAvailableContactOutcomes.mockResolvedValue(
      contactOutcomesFactory.build({ contactOutcomes: [attendedOutcome, nonAttendedOutcome] }),
    )
    offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
    jest.spyOn(RecordActivityPage, 'viewData').mockReturnValue(stepViewData)
  })

  describe('show', () => {
    it('fetches attended-only outcomes and the unpaid work details, and renders the record activity template', async () => {
      const form = recordActivityFormFactory.build({ crn, deliusEventNumber })
      formService.getForm.mockResolvedValue(form)

      const request = createMock<Request>({ params: { crn, deliusEventNumber }, query: { form: formId }, body: {} })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(referenceDataService.getAvailableContactOutcomes).toHaveBeenCalledWith(username)
      expect(offenderService.getOffenderSummary).toHaveBeenCalledWith({ username, crn })
      expect(RecordActivityPage.viewData).toHaveBeenCalledWith(
        form,
        { contactOutcomes: [attendedOutcome], unpaidWorkDetails: [requirement] },
        {},
      )

      expect(response.render).toHaveBeenCalledWith(
        'appointments/recordActivity',
        expect.objectContaining({ ...stepViewData, errors: {} }),
      )
    })
  })

  describe('submitUpdate', () => {
    it('saves the updated form and redirects to the compliance page when validation succeeds', async () => {
      const form = recordActivityFormFactory.build({ crn, deliusEventNumber })
      const updatedForm = recordActivityFormFactory.build()
      formService.getForm.mockResolvedValue(form)
      jest.spyOn(RecordActivityPage, 'validate').mockReturnValue({})
      jest.spyOn(RecordActivityPage, 'updateFormData').mockReturnValue(updatedForm)

      const body = { date: '15/1/2026', startTime: '09:00', endTime: '17:00', attendanceOutcome: attendedOutcome.code }
      const request = createMock<Request>({ params: { crn, deliusEventNumber }, query: { form: formId }, body })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(RecordActivityPage.validate).toHaveBeenCalledWith(body)
      expect(RecordActivityPage.updateFormData).toHaveBeenCalledWith(form, body, {
        contactOutcomes: [attendedOutcome],
        unpaidWorkDetails: [requirement],
      })
      expect(formService.saveForm).toHaveBeenCalledWith(formId, username, updatedForm)
      expect(response.redirect).toHaveBeenCalledWith(buildOtherEtePath('compliance', formId))
    })

    it('re-renders the template with errors when validation fails', async () => {
      const form = recordActivityFormFactory.build({ crn, deliusEventNumber })
      const errors = { date: { text: 'Enter or select a date' } }
      formService.getForm.mockResolvedValue(form)
      jest.spyOn(RecordActivityPage, 'validate').mockReturnValue(errors)

      const request = createMock<Request>({
        params: { crn, deliusEventNumber },
        query: { form: formId },
        body: { startTime: '09:00', endTime: '17:00', attendanceOutcome: attendedOutcome.code },
      })
      const response = createMock<Response>({ locals: { user: { username } } })

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(formService.saveForm).not.toHaveBeenCalled()
      expect(response.render).toHaveBeenCalledWith('appointments/recordActivity', expect.objectContaining({ errors }))
    })
  })
})
