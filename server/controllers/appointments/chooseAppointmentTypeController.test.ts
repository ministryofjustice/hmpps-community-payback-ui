import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import GovUkCheckboxes from '../../forms/GovUkCheckboxes'
import * as Utils from '../../utils/utils'
import Offender from '../../models/offender'
import paths from '../../paths'
import caseDetailsSummaryFactory from '../../testutils/factories/caseDetailsSummaryFactory'
import OffenderService from '../../services/offenderService'
import ChooseAppointmentTypeController from './chooseAppointmentTypeController'

describe('chooseAppointmentTypeController', () => {
  const crn = 'X123456'
  const deliusEventNumber = '1'
  const username = 'some-username'

  const originalUrl = '/appointments/create-for-person'
  const request = createMock<Request>({
    params: { crn, deliusEventNumber },
    query: {},
    originalUrl,
    body: {},
  })
  const response = createMock<Response>({ locals: { user: { username } } })
  const next = createMock<NextFunction>({})

  const offenderService = createMock<OffenderService>()

  let controller: ChooseAppointmentTypeController

  beforeEach(() => {
    jest.resetAllMocks()

    controller = new ChooseAppointmentTypeController(offenderService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('show', () => {
    it('renders the appointment type page with the heading, items, back link and update path', async () => {
      const caseDetailsSummary = caseDetailsSummaryFactory.build()

      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

      const heading = { title: 'Some Name', caption: crn }
      const items = [{ text: 'Induction', value: 'INDUCTION', checked: false }]
      const backLink = '/some-back-link'
      const updatePath = '/some-update-path'

      jest.spyOn(Offender, 'buildHeading').mockReturnValue(heading)
      jest.spyOn(GovUkCheckboxes, 'getOptions').mockReturnValue(items)
      jest.spyOn(Utils, 'originalPathOr').mockReturnValue(backLink)
      jest.spyOn(Utils, 'pathWithOriginalPath').mockReturnValue(updatePath)

      const requestHandler = controller.show()
      await requestHandler(request, response, next)

      expect(offenderService.getOffenderSummary).toHaveBeenCalledWith({ crn, username })
      expect(Offender.buildHeading).toHaveBeenCalledWith(caseDetailsSummary.offender)
      expect(GovUkCheckboxes.getOptions).toHaveBeenCalledWith(
        [
          { label: 'Induction', value: 'INDUCTION' },
          { label: 'Group session', value: 'GROUP' },
          { label: 'Individual placement', value: 'INDIVIDUAL' },
        ],
        'label',
        'value',
      )
      expect(Utils.originalPathOr).toHaveBeenCalledWith(
        request.query,
        paths.people.appointments({ crn, deliusEventNumber, appointmentSection: 'upcoming' }),
      )
      expect(Utils.pathWithOriginalPath).toHaveBeenCalledWith(
        paths.people.createAppointment({ crn, deliusEventNumber }),
        originalUrl,
      )
      expect(response.render).toHaveBeenCalledWith('appointments/chooseAppointmentType', {
        heading,
        items,
        backLink,
        updatePath,
      })
    })
  })
})
