import type { Request, RequestHandler, Response } from 'express'
import CourseCompletionService from '../../services/courseCompletionService'
import CourseCompletionIndexPage, { CourseCompletionPageInput } from '../../pages/courseCompletionIndexPage'
import { getPaginationRequestParams } from '../../utils/paginationUtils'
import paths from '../../paths'
import { CourseCompletionSortField } from '../../@types/user-defined'
import ReferenceDataService from '../../services/referenceDataService'
import getProvidersAndPdus from '../shared/getProvidersAndPdus'
import ProviderService from '../../services/providerService'

export default class CourseCompletionsController {
  private readonly providerCode = 'N56'

  constructor(
    private readonly courseCompletionService: CourseCompletionService,
    private readonly providerService: ProviderService,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const providerCode = req.query.provider?.toString() || undefined

      const providersAndPdus = await getProvidersAndPdus({
        providerService: this.providerService,
        referenceDataService: this.referenceDataService,
        providerCode,
        response: res,
      })

      res.render('courseCompletions/index', {
        searchForm: providersAndPdus,
      })
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
    return async (req: Request, res: Response) => {
      const page = new CourseCompletionIndexPage(req.query as CourseCompletionPageInput)

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

      const paginationParams = page.dateFields()

      const { pageNumber, hrefPrefix, sortBy, sortDirection } = getPaginationRequestParams<CourseCompletionSortField>(
        req,
        paths.courseCompletions.search({}),
        paginationParams,
      )

      const courseCompletions = await this.courseCompletionService.searchCourseCompletions({
        ...page.searchValues(),
        username: res.locals.user.username,
        providerCode: this.providerCode,
        page: pageNumber,
        sortBy,
        sortDirection,
      })

      const courseCompletionTableHeaders = page.courseCompletionTableHeaders(sortBy, sortDirection ?? 'asc', hrefPrefix)
      const courseCompletionRows = page.courseCompletionTableRows(courseCompletions.content)

      return res.render('courseCompletions/index', {
        ...pageSearchValues,
        pageNumber: courseCompletions.page.number,
        totalPages: courseCompletions.page.totalPages,
        totalElements: courseCompletions.page.totalElements,
        pageSize: courseCompletions.page.size,
        hrefPrefix,
        courseCompletionRows,
        showNoResultsMessage: courseCompletionRows.length === 0,
        courseCompletionTableHeaders,
      })
    }
  }
}
