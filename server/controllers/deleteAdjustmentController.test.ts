import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import DeleteAdjustmentController from './deleteAdjustmentController'
import OffenderService from '../services/offenderService'
import AdjustmentService from '../services/adjustmentService'
import caseDetailsSummaryFactory from '../testutils/factories/caseDetailsSummaryFactory'
import offenderFullFactory from '../testutils/factories/offenderFullFactory'
import adjustmentFactory from '../testutils/factories/adjustmentFactory'
import Offender from '../models/offender'
import paths from '../paths'
import * as ErrorUtils from '../utils/errorUtils'
import { pathWithOriginalPath } from '../utils/utils'

describe('DeleteAdjustmentController', () => {
  const username = 'user'
  const crn = 'crn123'
  const deliusEventNumber = '1'
  const adjustmentId = 'abcd-efgh'
  const params = { crn, deliusEventNumber, adjustmentId }

  const offenderService = createMock<OffenderService>()
  const adjustmentService = createMock<AdjustmentService>()

  const caseDetailsSummary = caseDetailsSummaryFactory.build({ offender: offenderFullFactory.build({ crn }) })
  const adjustment = adjustmentFactory.build({
    id: adjustmentId,
    date: '2026-03-24',
    amount: 'PT-1H-30M',
    reason: 'Miscellaneous correction',
  })

  const response = createMock<Response>({ locals: { user: { username } } })
  const next = createMock<NextFunction>({})

  const adjustmentsPath = paths.people.appointments({ crn, deliusEventNumber, appointmentSection: 'adjustments' })
  const deletePath = paths.people.adjustments.delete({ crn, deliusEventNumber, adjustmentId })

  let controller: DeleteAdjustmentController

  beforeEach(() => {
    jest.resetAllMocks()
    offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)
    adjustmentService.getAdjustment.mockResolvedValue(adjustment)

    controller = new DeleteAdjustmentController(offenderService, adjustmentService)
  })

  describe('show', () => {
    it('renders the delete adjustment page with the adjustment details', async () => {
      const request = createMock<Request>({ params, query: {} })

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      const offender = new Offender(caseDetailsSummary.offender)

      expect(offenderService.getOffenderSummary).toHaveBeenCalledWith({ username, crn })
      expect(adjustmentService.getAdjustment).toHaveBeenCalledWith(adjustmentId, username)
      expect(response.render).toHaveBeenCalledWith('people/adjustments/delete', {
        heading: { title: offender.name, caption: offender.crn },
        formattedDate: '24 March 2026',
        reason: 'Miscellaneous correction',
        adjustmentTime: '1 hour 30 minutes',
        backLink: adjustmentsPath,
        cancelLink: adjustmentsPath,
        updatePath: deletePath,
        preventDoubleClick: true,
      })
      expect(response.locals.audit).toEqual({ subjectType: 'CRN', subjectId: crn })
    })

    it('links back to the original path when one is provided', async () => {
      const originalPath = `${adjustmentsPath}?sortBy=reason&page=2`
      const request = createMock<Request>({ params, query: { originalPath } })

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'people/adjustments/delete',
        expect.objectContaining({
          backLink: originalPath,
          cancelLink: originalPath,
          updatePath: pathWithOriginalPath(deletePath, originalPath),
        }),
      )
    })
  })

  describe('submit', () => {
    it('deletes the adjustment and redirects to the adjustments tab with a success message', async () => {
      const request = createMock<Request>({ params, query: {}, flash: jest.fn() })

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(adjustmentService.deleteAdjustment).toHaveBeenCalledWith(adjustmentId, username)
      expect(request.flash).toHaveBeenCalledWith('success', 'Adjustment has been deleted')
      expect(response.redirect).toHaveBeenCalledWith(adjustmentsPath)
    })

    it('redirects to the original path when one is provided', async () => {
      const originalPath = `${adjustmentsPath}?sortBy=reason&page=2`
      const request = createMock<Request>({ params, query: { originalPath }, flash: jest.fn() })

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(originalPath)
    })

    it('calls catchApiValidationErrorOrPropagate when the deletion fails', async () => {
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
      adjustmentService.deleteAdjustment.mockRejectedValue(error)

      const request = createMock<Request>({ params, query: {}, flash: jest.fn() })

      const requestHandler = controller.submit()
      await requestHandler(request, response, next)

      expect(ErrorUtils.catchApiValidationErrorOrPropagate).toHaveBeenCalledWith(request, response, error, deletePath)
      expect(request.flash).toHaveBeenCalledWith('error', 'An error occurred')
      expect(response.redirect).toHaveBeenCalledWith(deletePath)
    })
  })
})
