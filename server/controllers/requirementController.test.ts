import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { Request, Response, NextFunction } from 'express'
import { path } from 'static-path'
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
  const updatePath = '/path'
  const backPath = '/back'

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
    },
    query: {},
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
    it('renders requirement page with offender name and given path with query', async () => {
      const unpaidWorkDetails = unpaidWorkDetailsFactory.build()
      const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails] })

      offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

      const unpaidWorkOptions = [
        { text: 'Option 1', value: 1, details: [{ key: { text: 'foo' }, value: { text: 'bar' } }], checked: false },
      ]
      jest.spyOn(UnpaidWorkUtils, 'getUnpaidWorkOptions').mockReturnValue(unpaidWorkOptions)

      const requestHandler = requirementController.show({ updatePath, backPath })
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('pages/requirement', {
        person,
        unpaidWorkOptions,
        updatePath,
        backLink: backPath,
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

      const unpaidWorkOptions = [
        { text: 'Option 1', value: 1, details: [{ key: { text: 'foo' }, value: { text: 'bar' } }], checked: false },
      ]
      jest.spyOn(UnpaidWorkUtils, 'getUnpaidWorkOptions').mockReturnValue(unpaidWorkOptions)

      const requestHandler = requirementController.show({ updatePath, backPath })
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('pages/requirement', {
        person: { ...person, isLimited: true },
        unpaidWorkOptions,
        updatePath,
        backLink: backPath,
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
          },
          query: { form: formId },
          body: {},
        })

        const unpaidWorkOptions = [
          { text: 'Option 1', value: 1, details: [{ key: { text: 'foo' }, value: { text: 'bar' } }], checked: false },
        ]
        jest.spyOn(UnpaidWorkUtils, 'getUnpaidWorkOptions').mockReturnValue(unpaidWorkOptions)

        const unpaidWorkDetails = unpaidWorkDetailsFactory.build()
        const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails] })
        offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

        const form = createAppointmentFormFactory.build({ deliusEventNumber: '1' })
        formService.getForm.mockResolvedValue(form)

        const requestHandler = requirementController.show({ updatePath, backPath })
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

      const unpaidWorkOptions = [
        { text: 'Option 1', value: 1, details: [{ key: { text: 'foo' }, value: { text: 'bar' } }], checked: false },
      ]
      jest.spyOn(UnpaidWorkUtils, 'getUnpaidWorkOptions').mockReturnValue(unpaidWorkOptions)

      const requestHandler = requirementController.submit({ updatePath, createAppointmentPath: path('/'), backPath })
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('pages/requirement', {
        person,
        unpaidWorkOptions,
        updatePath,
        errorSummary,
        errors,
        backLink: backPath,
      })
    })

    describe('when form exists', () => {
      it('saves form data and redirects to date page', async () => {
        request = createMock<Request>({
          params: {
            crn,
            projectCode,
            date,
          },
          query: { form: formId },
          body: { deliusEventNumber: '1' },
        })

        const unpaidWorkDetails = unpaidWorkDetailsFactory.build()
        const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails] })
        offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

        const form = createAppointmentFormFactory.build({ deliusEventNumber: undefined })
        formService.getForm.mockResolvedValue(form)

        const requestHandler = requirementController.submit({
          updatePath,
          createAppointmentPath: path('/'),
          backPath: '/',
        })
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
      it('redirects to provided create appointment path', async () => {
        const createAppointmentPath = paths.sessions.create.createAppointment
        request = createMock<Request>({
          params: {
            crn,
            projectCode,
            date,
            form: undefined,
          },
          query: {},
          body: { deliusEventNumber: '1' },
        })

        const unpaidWorkDetails = unpaidWorkDetailsFactory.build()
        const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails] })
        offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

        const requestHandler = requirementController.submit({ updatePath: '/', createAppointmentPath, backPath: '/' })
        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          paths.sessions.create.createAppointment({ projectCode, crn, date, deliusEventNumber: '1' }),
        )
      })
    })
  })
})
