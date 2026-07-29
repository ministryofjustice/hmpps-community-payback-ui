import { createMock } from '@golevelup/ts-jest'
import type { Request, Response } from 'express'
import paths from '../paths'
import OffenderService from '../services/offenderService'
import caseDetailsSummaryFactory from '../testutils/factories/caseDetailsSummaryFactory'
import unpaidWorkDetailsFactory from '../testutils/factories/unpaidWorkDetailsFactory'
import requirementMiddleware from './requirementMiddleware'

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

  it('redirects to the dashboard when there are no unpaid work requirements', async () => {
    const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [] })

    mockOffenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

    const middleware = requirementMiddleware(mockOffenderService)

    await middleware(req, res, next)

    expect(mockOffenderService.getOffenderSummary).toHaveBeenCalledWith({
      username,
      crn,
    })

    expect(res.redirect).toHaveBeenCalledWith('/')
  })

  it('redirects to create appointment when there is exactly one requirement', async () => {
    const unpaidWorkDetails = unpaidWorkDetailsFactory.build({ eventNumber: 1 })
    const caseDetailsSummary = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [unpaidWorkDetails] })

    mockOffenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

    const middleware = requirementMiddleware(mockOffenderService)

    await middleware(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(
      paths.sessions.createAppointment({
        deliusEventNumber: '1',
        crn,
        projectCode,
        date,
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

    const middleware = requirementMiddleware(mockOffenderService)

    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})
