import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import GovUkCheckboxes from '../../forms/GovUkCheckboxes'
import * as Utils from '../../utils/utils'
import Offender from '../../models/offender'
import paths from '../../paths'
import caseDetailsSummaryFactory from '../../testutils/factories/caseDetailsSummaryFactory'
import OffenderService from '../../services/offenderService'
import ChooseAppointmentTypeController from './chooseAppointmentTypeController'
import AppointmentTypePage from '../../pages/appointments/appointmentTypePage'

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
  const appointmentTypePage = createMock<AppointmentTypePage>()

  let controller: ChooseAppointmentTypeController

  beforeEach(() => {
    jest.resetAllMocks()

    controller = new ChooseAppointmentTypeController(offenderService, appointmentTypePage)
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
        [undefined],
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

    it('marks the checkbox item matching the appointment type from the request body as checked', async () => {
      const caseDetailsSummary = caseDetailsSummaryFactory.build()

      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

      const req = createMock<Request>({
        params: { crn, deliusEventNumber },
        query: {},
        body: { appointmentType: 'GROUP' },
      })

      jest.spyOn(GovUkCheckboxes, 'getOptions')

      const requestHandler = controller.show()
      await requestHandler(req, response, next)

      expect(GovUkCheckboxes.getOptions).toHaveBeenCalledWith(
        [
          { label: 'Induction', value: 'INDUCTION' },
          { label: 'Group session', value: 'GROUP' },
          { label: 'Individual placement', value: 'INDIVIDUAL' },
        ],
        'label',
        'value',
        ['GROUP'],
      )
    })

    it('renders the errors and error summary when validation results are passed', async () => {
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

      const errors = { appointmentType: { text: 'Select an appointment type' } }
      const errorSummary = [{ text: 'Select an appointment type', href: '#appointmentType', attributes: {} }]
      const validationResults = { hasErrors: true, errors, errorSummary }

      const req = createMock<Request>({
        params: { crn, deliusEventNumber },
        query: {},
        body: {},
      })

      const requestHandler = controller.show(validationResults)
      await requestHandler(req, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/chooseAppointmentType', {
        heading,
        items,
        backLink,
        updatePath,
        errors,
        errorSummary,
      })
    })
  })

  describe('submitCreateForPerson', () => {
    it('renders the errors and error summary when the appointment type page returns validation errors', async () => {
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

      const errors = { appointmentType: { text: 'Select an appointment type' } }
      const errorSummary = [{ text: 'Select an appointment type', href: '#appointmentType', attributes: {} }]
      appointmentTypePage.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      const req = createMock<Request>({
        params: { crn, deliusEventNumber },
        query: {},
        body: { someKey: 'someValue' },
      })

      const requestHandler = controller.submit()
      await requestHandler(req, response, next)

      expect(appointmentTypePage.validationErrors).toHaveBeenCalledWith(req.body)
      expect(response.render).toHaveBeenCalledWith('appointments/chooseAppointmentType', {
        heading,
        items,
        backLink,
        updatePath,
        errors,
        errorSummary,
      })
    })

    it('redirects to the create appointment page for the project type when there are no validation errors', async () => {
      appointmentTypePage.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

      const redirectPath = '/some-redirect-path'
      jest.spyOn(Utils, 'pathWithOriginalPath').mockReturnValue(redirectPath)

      const req = createMock<Request>({
        params: { crn, deliusEventNumber },
        query: {},
        originalUrl,
        body: { appointmentType: 'GROUP' },
      })

      const requestHandler = controller.submit()
      await requestHandler(req, response, next)

      expect(Utils.pathWithOriginalPath).toHaveBeenCalledWith(
        paths.people.createAppointmentForProjectType({
          crn,
          deliusEventNumber,
          projectTypeGroup: 'GROUP',
        }),
        originalUrl,
      )
      expect(response.redirect).toHaveBeenCalledWith(redirectPath)
    })
  })
})
