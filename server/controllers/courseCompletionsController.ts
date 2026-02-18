import type { Request, RequestHandler, Response } from 'express'
import CourseCompletionService from '../services/courseCompletionService'
import CourseCompletionIndexPage, { CourseCompletionPageInput } from '../pages/courseCompletionIndexPage'
import CourseCompletionUtils from '../utils/courseCompletionUtils'

export default class CourseCompletionsController {
  private readonly providerCode = 'N56'

  constructor(private readonly courseCompletionService: CourseCompletionService) {}

  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      res.render('courseCompletions/index')
    }
  }

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const courseCompletion = await this.courseCompletionService.getCourseCompletion({
        username: res.locals.user.username,
        id: _req.params.id,
      })

      res.render('courseCompletions/show', {
        courseCompletion,
      })
    }
  }

  search(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const page = new CourseCompletionIndexPage(_req.query as CourseCompletionPageInput)

      const validationErrors = page.validationErrors()
      const pageSearchValues = page.items()

      if (Object.keys(validationErrors).length !== 0) {
        const errorSummary = Object.keys(validationErrors).map(k => ({
          text: validationErrors[k as keyof CourseCompletionPageInput].text,
          href: `#${k}`,
        }))

        return res.render('courseCompletions/index', {
          errorSummary,
          errors: validationErrors,
          courseCompletionRows: [],
          ...pageSearchValues,
        })
      }

      const courseCompletions = await this.courseCompletionService.searchCourseCompletions({
        ...page.searchValues(),
        username: res.locals.user.username,
        providerCode: this.providerCode,
      })

      const courseCompletionRows = CourseCompletionUtils.courseCompletionTableRows(courseCompletions.content)

      return res.render('courseCompletions/index', {
        ...pageSearchValues,
        courseCompletionRows,
        showNoResultsMessage: courseCompletionRows.length === 0,
      })
    }
  }
}
