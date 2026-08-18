import { createMock } from '@golevelup/ts-jest'
import type { Request, Response } from 'express'
import { path } from 'static-path'
import paths from '../paths'
import OffenderService from '../services/offenderService'
import caseDetailsSummaryFactory from '../testutils/factories/caseDetailsSummaryFactory'
import unpaidWorkDetailsFactory from '../testutils/factories/unpaidWorkDetailsFactory'
import requirementMiddleware from './requirementMiddleware'
import offenderLimitedFactory from '../testutils/factories/offenderLimitedFactory'

describe('requirementMiddleware', () => {
  const mockOffenderService = {
    getOffenderSummary: jest.fn(),
  } as unknown as jest.Mocked<OffenderService>

  const crn = 'X12345'
  const projectCode = 'N1111'
  const date = '2026-07-29'
  const username = 'username'

  const req = createMock<Request>({
    params: {
      crn,
      projectCode,
      date,
    },
    query: { prop: '12' },
  })

  const res = createMock<Response>({
    locals: {
      user: {
        username,
      },
    },
    redirect: jest.fn(),
  })

  const next = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to create appointment path with req params and query when there is exactly one requirement', async () => {
    const createAppointmentPath = paths.sessions.create.createAppointment
    const unpaidWorkDetails = unpaidWorkDetailsFactory.build({ eventNumber: 1 })
    const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails] })

    mockOffenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

    const middleware = requirementMiddleware(mockOffenderService, createAppointmentPath)

    await middleware(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(
      `${paths.sessions.create.createAppointment({
        deliusEventNumber: '1',
        crn,
        projectCode,
        date,
      })}?prop=12`,
    )
  })

  it('can handle a different path with different Params type', async () => {
    const createAppointmentPath = paths.projects.create.createAppointment
    const unpaidWorkDetails = unpaidWorkDetailsFactory.build({ eventNumber: 1 })
    const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails] })

    mockOffenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

    const projectRequest = createMock<Request>({
      params: {
        crn,
        projectCode,
      },
      query: {},
    })

    const middleware = requirementMiddleware(mockOffenderService, createAppointmentPath)

    await middleware(projectRequest, res, next)

    expect(res.redirect).toHaveBeenCalledWith(
      paths.projects.create.createAppointment({
        deliusEventNumber: '1',
        crn,
        projectCode,
      }),
    )
  })

  it('calls next when there are multiple requirements', async () => {
    const unpaidWorkDetailsOne = unpaidWorkDetailsFactory.build({ eventNumber: 1 })
    const unpaidWorkDetailsTwo = unpaidWorkDetailsFactory.build({ eventNumber: 2 })
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      unpaidWorkDetails: [unpaidWorkDetailsOne, unpaidWorkDetailsTwo],
    })

    mockOffenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

    const middleware = requirementMiddleware(mockOffenderService, path('/'))

    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('calls next when there are zero requirements', async () => {
    const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [] })

    mockOffenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

    const middleware = requirementMiddleware(mockOffenderService, path('/'))

    await middleware(req, res, next)

    expect(mockOffenderService.getOffenderSummary).toHaveBeenCalledWith({
      username,
      crn,
    })

    expect(next).toHaveBeenCalled()
  })

  it('calls next when the person is limited', async () => {
    const offender = offenderLimitedFactory.build()
    const unpaidWorkDetails = unpaidWorkDetailsFactory.build()
    const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails], offender })

    mockOffenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

    const middleware = requirementMiddleware(mockOffenderService, path('/'))

    await middleware(req, res, next)

    expect(mockOffenderService.getOffenderSummary).toHaveBeenCalledWith({
      username,
      crn,
    })

    expect(next).toHaveBeenCalled()
  })

  describe('when the middleware options is in view mode rather than create mode', () => {
    it('will call redirect with appropriate view params', async () => {
      const viewAppointmentPath = paths.people.appointments
      const unpaidWorkDetails = unpaidWorkDetailsFactory.build({ eventNumber: 1 })
      const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails] })

      mockOffenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

      const projectRequest = createMock<Request>({
        params: {
          crn,
          projectCode,
        },
        query: {},
      })

      const middleware = requirementMiddleware(mockOffenderService, viewAppointmentPath, { mode: 'view' })

      await middleware(projectRequest, res, next)

      expect(res.redirect).toHaveBeenCalledWith(
        paths.people.appointments({
          deliusEventNumber: '1',
          crn,
          appointmentSection: 'upcoming',
        }),
      )
    })
  })
})
