import { NextFunction, Request, Response } from 'express'
import CourseCompletionService from '../services/courseCompletionService'
import CourseCompletionFormService from '../services/forms/courseCompletionFormService'
import OffenderService from '../services/offenderService'
import { CourseCompletionPageInput } from '../pages/courseCompletionIndexPage'
import CourseCompletionUtils from '../utils/courseCompletionUtils'
import limitedOffenderMiddleware from './limitedOffenderMiddleware'
import paths from '../paths'
import { pathWithQuery } from '../utils/utils'

export default function courseCompletionLimitedOffenderMiddleware({
  courseCompletionService,
  courseCompletionFormService,
  offenderService,
}: {
  courseCompletionService: CourseCompletionService
  courseCompletionFormService: CourseCompletionFormService
  offenderService: OffenderService
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { username } = res.locals.user
    const { id } = req.params
    const query = req.query as CourseCompletionPageInput

    const { crn } = await courseCompletionService.getRecommendedSelection({ id, username })

    if (!crn) {
      return next()
    }

    return limitedOffenderMiddleware({
      offenderService,
      crn,
      backPath: CourseCompletionUtils.searchResultsLink(query),
      anotherPersonLink: async () => {
        const { formId } = await courseCompletionFormService.createForm(username, { originalSearch: query })

        return pathWithQuery(paths.courseCompletions.process({ id, page: 'crn' }), { ...query, form: formId })
      },
    })(req, res, next)
  }
}
