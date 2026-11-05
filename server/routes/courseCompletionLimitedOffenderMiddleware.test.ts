import { createMock } from '@golevelup/ts-jest'
import type { Request, Response } from 'express'
import courseCompletionLimitedOffenderMiddleware from './courseCompletionLimitedOffenderMiddleware'
import CourseCompletionService from '../services/courseCompletionService'
import CourseCompletionFormService from '../services/forms/courseCompletionFormService'
import OffenderService from '../services/offenderService'
import { OffenderDto } from '../@types/shared'
import caseDetailsSummaryFactory from '../testutils/factories/caseDetailsSummaryFactory'
import courseCompletionRecommendationFactory from '../testutils/factories/courseCompletionRecommendationFactory'
import courseCompletionFormFactory from '../testutils/factories/courseCompletionFormFactory'
import offenderFullFactory from '../testutils/factories/offenderFullFactory'
import offenderLimitedFactory from '../testutils/factories/offenderLimitedFactory'
import Offender from '../models/offender'
import paths from '../paths'
import { pathWithQuery } from '../utils/utils'

describe('courseCompletionLimitedOffenderMiddleware', () => {
  const courseCompletionService = createMock<CourseCompletionService>()
  const courseCompletionFormService = createMock<CourseCompletionFormService>()
  const offenderService = createMock<OffenderService>()

  const id = 'some-id'
  const crn = 'X12345'
  const username = 'some-user'
  const query = { provider: 'N56', pdu: '123' }

  const req = createMock<Request>({ params: { id }, query })
  const next = jest.fn()
  let res: Response

  const middleware = courseCompletionLimitedOffenderMiddleware({
    courseCompletionService,
    courseCompletionFormService,
    offenderService,
  })

  const givenRecommendedOffender = (offender: OffenderDto) => {
    courseCompletionService.getRecommendedSelection.mockResolvedValue(
      courseCompletionRecommendationFactory.build({ crn: offender.crn }),
    )
    offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummaryFactory.build({ offender }))
  }

  beforeEach(() => {
    jest.resetAllMocks()
    res = createMock<Response>({ locals: { user: { username } } })
    courseCompletionFormService.createForm.mockResolvedValue({
      formId: 'form-id',
      formData: courseCompletionFormFactory.build(),
    })
  })

  it('calls next without checking access when there is no recommended CRN', async () => {
    courseCompletionService.getRecommendedSelection.mockResolvedValue(
      courseCompletionRecommendationFactory.build({ crn: null }),
    )

    await middleware(req, res, next)

    expect(courseCompletionService.getRecommendedSelection).toHaveBeenCalledWith({ id, username })
    expect(offenderService.getOffenderSummary).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('calls next when the recommended person is not restricted', async () => {
    givenRecommendedOffender(offenderFullFactory.build({ crn }))

    await middleware(req, res, next)

    expect(offenderService.getOffenderSummary).toHaveBeenCalledWith({ username, crn })
    expect(courseCompletionFormService.createForm).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('renders the restricted person page when the recommended person is restricted', async () => {
    const offender = offenderLimitedFactory.build({ crn })
    givenRecommendedOffender(offender)

    await middleware(req, res, next)

    expect(courseCompletionFormService.createForm).toHaveBeenCalledWith(username, { originalSearch: query })
    expect(res.render).toHaveBeenCalledWith('pages/restrictedPerson', {
      person: new Offender(offender),
      backLink: pathWithQuery(paths.courseCompletions.search({}), query),
      anotherPersonLink: pathWithQuery(paths.courseCompletions.process({ id, page: 'crn' }), {
        ...query,
        form: 'form-id',
      }),
    })
    expect(next).not.toHaveBeenCalled()
  })
})
