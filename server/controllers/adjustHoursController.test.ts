import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import AdjustHoursController from './adjustHoursController'
import OffenderService from '../services/offenderService'
import ReferenceDataService from '../services/referenceDataService'
import AdjustmentFormService from '../services/forms/adjustmentFormService'
import caseDetailsSummaryFactory from '../testutils/factories/caseDetailsSummaryFactory'
import Offender from '../models/offender'
import adjustmentReasonFactory from '../testutils/factories/adjustmentReasonFactory'
import paths from '../paths'
import offenderFullFactory from '../testutils/factories/offenderFullFactory'
import unpaidWorkDetailsFactory from '../testutils/factories/unpaidWorkDetailsFactory'
import DateTimeFormats from '../utils/dateTimeUtils'
import AdjustHoursConfirmPage from '../pages/adjustHoursConfirmPage'
import * as ErrorUtils from '../utils/errorUtils'

describe('AdjustHoursController', () => {
  const username = 'user'
  const crn = 'crn123'
  const deliusEventNumber = '1'

  const offenderService = createMock<OffenderService>()
  const referenceDataService = createMock<ReferenceDataService>()
  const adjustmentFormService = createMock<AdjustmentFormService>()

  const caseDetailsSummary = caseDetailsSummaryFactory.build({
    offender: offenderFullFactory.build({ crn }),
    unpaidWorkDetails: [unpaidWorkDetailsFactory.build({ eventNumber: 1 })],
  })
  const adjustmentReason = adjustmentReasonFactory.build({
    deliusCode: 'H',
    id: 'H',
  })
  const adjustmentReasons = [adjustmentReason]

  const response = createMock<Response>({ locals: { user: { username } } })
  const next = createMock<NextFunction>({})

  let controller: AdjustHoursController

  beforeEach(() => {
    jest.resetAllMocks()
    offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
    referenceDataService.getAdjustmentReasons.mockResolvedValue(adjustmentReasons)
    adjustmentFormService.getForm.mockResolvedValue({
      originalPath: 'back',
      type: 'Negative',
      minutes: 30,
      adjustmentDate: '2026-01-01',
      adjustmentReasonId: 'H',
    })

    controller = new AdjustHoursController(offenderService, referenceDataService, adjustmentFormService)
  })

  describe('update', () => {
    it('renders the page with the existing adjustment form', async () => {
      const request = createMock<Request>()
      request.params = {
        crn,
        deliusEventNumber,
      }
      request.body = {}
      request.query.form = 'abcd'

      const requestHandler = controller.update()
      await requestHandler(request, response, next)

      expect(adjustmentFormService.getForm).toHaveBeenCalled()

      expect(response.render).toHaveBeenCalledWith('people/adjustHours/update', {
        date: '01/01/2026',
        timeToCredit: {
          hours: '0',
          minutes: '30',
        },
        form: 'abcd',
        backLink: paths.people.appointments({ crn, deliusEventNumber, appointmentSection: 'upcoming' }),
        updatePath: paths.people.adjustHours.update({ crn, deliusEventNumber }),
        heading: {
          title: new Offender(caseDetailsSummary.offender).name,
          caption: caseDetailsSummary.offender.crn,
        },
        preventDoubleClick: true,
        adjustmentOptions: expect.arrayContaining([
          expect.objectContaining({
            text: adjustmentReason.name,
            value: adjustmentReason.id,
            checked: true,
            hint: { html: 'When the person on probation has less than an hour left' },
          }),
        ]),
      })
    })

    it('creates a new adjustment form if one is not provided and renders the page', async () => {
      const request = createMock<Request>()
      request.params = {
        crn,
        deliusEventNumber,
      }
      request.body = {
        date: '2026-01-01',
        hours: '1',
        minutes: '60',
      }
      request.query.form = null

      adjustmentFormService.createAdjustmentForm.mockResolvedValue({
        key: { type: 'ADJUSTMENT_UPDATE_FORM_TYPE', id: 'generated-form-id' },
        data: { type: 'Negative' },
      })

      const requestHandler = controller.update()
      await requestHandler(request, response, next)

      expect(adjustmentFormService.createAdjustmentForm).toHaveBeenCalled()

      expect(response.render).toHaveBeenCalledWith('people/adjustHours/update', {
        date: '2026-01-01',
        timeToCredit: {
          hours: '1',
          minutes: '60',
        },
        form: 'generated-form-id',
        backLink: paths.people.appointments({ crn, deliusEventNumber, appointmentSection: 'upcoming' }),
        updatePath: paths.people.adjustHours.update({ crn, deliusEventNumber }),
        heading: {
          title: new Offender(caseDetailsSummary.offender).name,
          caption: caseDetailsSummary.offender.crn,
        },
        preventDoubleClick: true,
        adjustmentOptions: expect.arrayContaining([
          expect.objectContaining({
            text: adjustmentReason.name,
            value: adjustmentReason.id,
            checked: false,
            hint: { html: 'When the person on probation has less than an hour left' },
          }),
        ]),
      })
    })
  })

  describe('submitUpdate', () => {
    it('re-renders the page if there is an error', async () => {
      const request = createMock<Request>()
      request.params = {
        crn,
        deliusEventNumber,
      }
      request.body = {
        form: 'abc123',
      }

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(adjustmentFormService.saveForm).not.toHaveBeenCalled()

      expect(response.render).toHaveBeenCalledWith(
        'people/adjustHours/update',
        expect.objectContaining({
          errors: expect.objectContaining({
            reasonCode: expect.anything(),
            date: expect.anything(),
            hours: expect.anything(),
          }),
          form: 'abc123',
        }),
      )
    })

    it('updates the adjustment form and redirects to the confirmation page', async () => {
      const request = createMock<Request>()
      request.params = {
        crn,
        deliusEventNumber,
      }
      request.body = {
        date: '01/01/2026',
        hours: '1',
        minutes: '30',
        reasonCode: 'H',
        form: 'form123',
      }

      const requestHandler = controller.submitUpdate()
      await requestHandler(request, response, next)

      expect(adjustmentFormService.saveForm).toHaveBeenCalledWith('form123', username, {
        adjustmentDate: '2026-01-01',
        adjustmentReasonId: 'H',
        minutes: 90,
        originalPath: 'back',
        type: 'Negative',
      })

      expect(response.redirect).toHaveBeenCalledWith(
        `${paths.people.adjustHours.confirm({ crn, deliusEventNumber })}?form=form123&originalPath=back`,
      )
    })
  })

  describe('confirm', () => {
    it('renders the confirmation page with the appropriate form data', async () => {
      const request = createMock<Request>()
      request.params = {
        crn,
        deliusEventNumber,
      }
      request.query.form = 'abcd'

      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue('01/01/2026')
      jest.spyOn(AdjustHoursConfirmPage.prototype, 'calculateRemainingHoursText').mockReturnValue('30 minutes')

      const backLink = `${paths.people.adjustHours.update({ crn, deliusEventNumber })}?form=abcd&originalPath=back`

      const requestHandler = controller.confirm()
      await requestHandler(request, response, next)

      expect(adjustmentFormService.getForm).toHaveBeenCalled()

      expect(response.render).toHaveBeenCalledWith('people/adjustHours/confirm', {
        heading: {
          title: new Offender(caseDetailsSummary.offender).name,
          caption: caseDetailsSummary.offender.crn,
        },
        backLink,
        updatePath: `${paths.people.adjustHours.confirm({ crn, deliusEventNumber })}?form=abcd`,
        items: expect.arrayContaining([
          expect.objectContaining({
            key: { text: 'Date' },
            value: { text: '01/01/2026' },
            actions: {
              items: [
                {
                  href: backLink,
                  text: 'Change',
                  visuallyHiddenText: 'date',
                },
              ],
            },
          }),
        ]),
        preventDoubleClick: true,
        calculatedRemainingHoursText: '30 minutes',
      })
    })
  })

  describe('submitConfirm', () => {
    it('creates the adjustment and redirects to the appropriate path when the form is valid', async () => {
      const request = createMock<Request>()
      request.params = {
        crn,
        deliusEventNumber,
      }
      request.query.form = 'abcd'

      const requestHandler = controller.submitConfirm()
      await requestHandler(request, response, next)

      expect(adjustmentFormService.getForm).toHaveBeenCalled()

      expect(offenderService.createAdjustment).toHaveBeenCalledWith(
        expect.objectContaining({
          username,
          crn,
          deliusEventNumber: parseInt(deliusEventNumber, 10),
        }),
        expect.objectContaining({
          adjustmentDate: '2026-01-01',
          adjustmentReasonId: 'H',
          minutes: 30,
          type: 'Negative',
        }),
      )

      expect(response.redirect).toHaveBeenCalledWith(
        paths.people.appointments({ crn, deliusEventNumber, appointmentSection: 'upcoming' }),
      )
    })

    it('renders the confirmation page with errors when the form is invalid', async () => {
      const request = createMock<Request>()
      request.params = {
        crn,
        deliusEventNumber,
      }
      request.query.form = 'abcd'

      jest.spyOn(ErrorUtils, 'catchApiValidationErrorOrPropagate')

      offenderService.createAdjustment.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            validationErrors: {
              adjustmentDate: 'Invalid date',
            },
          },
        },
      })

      jest.spyOn(ErrorUtils, 'catchApiValidationErrorOrPropagate').mockImplementation(error => {
        return error
      })

      jest.spyOn(AdjustHoursConfirmPage.prototype, 'updatePath').mockReturnValue('/update')

      const requestHandler = controller.submitConfirm()
      await requestHandler(request, response, next)

      expect(adjustmentFormService.getForm).toHaveBeenCalled()

      expect(ErrorUtils.catchApiValidationErrorOrPropagate).toHaveBeenCalledWith(
        request,
        response,
        expect.objectContaining({
          response: {
            status: 400,
            data: {
              validationErrors: {
                adjustmentDate: 'Invalid date',
              },
            },
          },
        }),
        '/update',
      )
    })
  })
})
