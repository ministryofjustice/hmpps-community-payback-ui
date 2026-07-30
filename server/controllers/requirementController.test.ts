import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { Request, Response, NextFunction } from 'express'
import RequirementController from './requirementController'
import AppointmentFormService from '../services/forms/appointmentFormService'
import OffenderService from '../services/offenderService'
import RequirementPage from '../pages/appointments/requirementPage'
import UnpaidWorkUtils from '../utils/unpaidWorkUtils'
import Offender from '../models/offender'
import caseDetailsSummaryFactory from '../testutils/factories/caseDetailsSummaryFactory'
import unpaidWorkDetailsFactory from '../testutils/factories/unpaidWorkDetailsFactory'
import paths from '../paths'
import { pathWithQuery } from '../utils/utils'
import createAppointmentFormFactory from '../testutils/factories/createAppointmentFormFactory'

jest.mock('../models/offender')

describe('RequirementController', () => {
  const username = 'username'
  const crn = 'X123456'
  const projectCode = 'PROJECT'
  const date = '2025-01-01'
  const formId = '1'

  let requirementController: RequirementController

  const page = createMock<RequirementPage>()

  const formService = createMock<AppointmentFormService>()
  const offenderService = createMock<OffenderService>()

  const person = {
    isLimited: false,
    name: 'John Smith',
    crn,
  }

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  let request: DeepMocked<Request> = createMock<Request>({
    params: {
      crn: 'X123456',
      projectCode,
      date,
      form: undefined,
    },
    body: {},
  })

  const response: DeepMocked<Response> = createMock<Response>({
    locals: {
      user: {
        username,
      },
    },
    render: jest.fn(),
  })

  beforeEach(() => {
    jest.clearAllMocks()
    requirementController = new RequirementController(formService, offenderService)

    ;(Offender as jest.Mock).mockImplementation(() => person)
  })

  describe('show', () => {
    it('renders requirement page with offender name', async () => {
      const unpaidWorkDetails = unpaidWorkDetailsFactory.build()
      const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails] })

      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

      const unpaidWorkOptions = [{ text: 'Option 1', value: 1, hint: { html: 'Hint HTML' }, checked: false }]
      jest.spyOn(UnpaidWorkUtils, 'getUnpaidWorkOptions').mockReturnValue(unpaidWorkOptions)

      const requestHandler = requirementController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('pages/requirement', {
        person,
        unpaidWorkOptions,
        updatePath: paths.sessions.requirement({ crn, projectCode, date }),
      })
    })

    it('renders requirement page with CRN when offender is limited', async () => {
      const unpaidWorkDetails = unpaidWorkDetailsFactory.build()
      const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails] })

      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

      ;(Offender as jest.Mock).mockImplementation(() => ({
        ...person,
        isLimited: true,
      }))

      const unpaidWorkOptions = [{ text: 'Option 1', value: 1, hint: { html: 'Hint HTML' }, checked: false }]
      jest.spyOn(UnpaidWorkUtils, 'getUnpaidWorkOptions').mockReturnValue(unpaidWorkOptions)

      const requestHandler = requirementController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('pages/requirement', {
        person: { ...person, isLimited: true },
        unpaidWorkOptions,
        updatePath: paths.sessions.requirement({ crn, projectCode, date }),
      })

      expect(UnpaidWorkUtils.getUnpaidWorkOptions).toHaveBeenCalledWith(caseDetailsSummary.unpaidWorkDetails, null)
    })

    describe('when form exists', () => {
      it('builds unpaid work options with selected value from form', async () => {
        request = createMock<Request>({
          params: {
            crn: 'X123456',
            projectCode,
            date,
            form: formId,
          },
          body: {},
        })

        const unpaidWorkOptions = [{ text: 'Option 1', value: 1, hint: { html: 'Hint HTML' }, checked: false }]
        jest.spyOn(UnpaidWorkUtils, 'getUnpaidWorkOptions').mockReturnValue(unpaidWorkOptions)

        const unpaidWorkDetails = unpaidWorkDetailsFactory.build()
        const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails] })
        offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

        const form = createAppointmentFormFactory.build({ deliusEventNumber: '1' })
        formService.getForm.mockResolvedValue(form)

        const requestHandler = requirementController.show()
        await requestHandler(request, response, next)

        expect(formService.getForm).toHaveBeenCalledWith(formId, username)

        expect(UnpaidWorkUtils.getUnpaidWorkOptions).toHaveBeenCalledWith(caseDetailsSummary.unpaidWorkDetails, 1)
      })
    })
  })

  describe('submit', () => {
    it('renders page with validation errors', async () => {
      request = createMock<Request>({
        params: {
          crn: 'X123456',
          projectCode,
          date,
          form: undefined,
        },
        body: {},
      })

      const errorSummary = [
        {
          attributes: {
            'data-cy-error-deliusEventNumber': 'Select a requirement',
          },
          href: '#deliusEventNumber',
          text: 'Select a requirement',
        },
      ]
      const errors = { deliusEventNumber: { text: 'Select a requirement' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      const unpaidWorkDetails = unpaidWorkDetailsFactory.build()
      const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails] })
      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

      const unpaidWorkOptions = [{ text: 'Option 1', value: 1, hint: { html: 'Hint HTML' }, checked: false }]
      jest.spyOn(UnpaidWorkUtils, 'getUnpaidWorkOptions').mockReturnValue(unpaidWorkOptions)

      const requestHandler = requirementController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('pages/requirement', {
        person,
        unpaidWorkOptions,
        updatePath: paths.sessions.requirement({ crn, projectCode, date }),
        errorSummary,
        errors,
      })
    })

    describe('when form exists', () => {
      it('saves form data and redirects to date page', async () => {
        request = createMock<Request>({
          params: {
            crn,
            projectCode,
            date,
            form: formId,
          },
          body: { deliusEventNumber: '1' },
        })

        const unpaidWorkDetails = unpaidWorkDetailsFactory.build()
        const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails] })
        offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

        const form = createAppointmentFormFactory.build({ deliusEventNumber: undefined })
        formService.getForm.mockResolvedValue(form)

        const requestHandler = requirementController.submit()
        await requestHandler(request, response, next)

        expect(formService.saveForm).toHaveBeenCalledWith(formId, username, { ...form, deliusEventNumber: '1' })
        expect(response.redirect).toHaveBeenCalledWith(
          pathWithQuery(paths.appointments.create({ projectCode, page: 'date' }), {
            form: formId,
          }),
        )
      })
    })

    describe('when form does not exist', () => {
      it('redirects to create appointment', async () => {
        request = createMock<Request>({
          params: {
            crn,
            projectCode,
            date,
            form: undefined,
          },
          body: { deliusEventNumber: '1' },
        })

        const unpaidWorkDetails = unpaidWorkDetailsFactory.build()
        const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails] })
        offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

        const requestHandler = requirementController.submit()
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          paths.sessions.createAppointment({ projectCode, crn, date, deliusEventNumber: '1' }),
        )
      })
    })
  })
})
