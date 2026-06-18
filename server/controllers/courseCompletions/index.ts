import type { Request, RequestHandler, Response } from 'express'
import { CourseCompletionSortField } from '../../@types/user-defined'
import CourseCompletionService from '../../services/courseCompletionService'
import CourseCompletionIndexPage, { CourseCompletionPageInput } from '../../pages/courseCompletionIndexPage'
import { getPaginationRequestParams } from '../../utils/paginationUtils'
import paths from '../../paths'
import ReferenceDataService from '../../services/referenceDataService'
import getProvidersAndPdus from '../shared/getProvidersAndPdus'
import ProviderService from '../../services/providerService'
import { pathWithQuery } from '../../utils/utils'
import CourseCompletionFormService from '../../services/forms/courseCompletionFormService'
import AuditService, { Page } from '../../services/auditService'
import DateTimeFormats from '../../utils/dateTimeUtils'
import CourseCompletionUtils from '../../utils/courseCompletionUtils'

const courseCompletionSortFields = ['firstName', 'lastName', 'courseName', 'completionDateTime', 'status'] as const

export default class CourseCompletionsController {
  constructor(
    private readonly auditService: AuditService,
    private readonly courseCompletionService: CourseCompletionService,
    private readonly providerService: ProviderService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly formService: CourseCompletionFormService,
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
    return async (req: Request, res: Response) => {
      const courseCompletion = await this.courseCompletionService.getCourseCompletion({
        username: res.locals.user.username,
        id: req.params.id,
      })

      const { crn } = await this.courseCompletionService.getRecommendedSelection({
        id: courseCompletion.id,
        username: res.locals.user.username,
      })

      const { formId } = await this.formService.createForm(res.locals.user.username, {
        crn,
        originalSearch: req.query as CourseCompletionPageInput,
      })

      const firstProcessPage = crn ? 'person' : 'crn'

      res.locals.audit = {
        subjectType: 'SEARCH_TERM',
        subjectId: `${courseCompletion.firstName} ${courseCompletion.lastName}`,
      }

      const expected = DateTimeFormats.totalMinutesToHoursAndMinutesParts(courseCompletion.expectedTimeMinutes)
      const expectedPlus20 = DateTimeFormats.totalMinutesToHoursAndMinutesParts(
        courseCompletion.expectedTimeMinutes * 1.2,
      )
      const total = DateTimeFormats.totalMinutesToHoursAndMinutesParts(courseCompletion.totalTimeMinutes)

      const courseCompletions = await this.courseCompletionService.getHistory({
        username: res.locals.user.username,
        id: courseCompletion.id,
      })

      res.render('courseCompletions/show', {
        courseCompletion: {
          ...courseCompletion,
          expectedTimeSpent: DateTimeFormats.hoursAndMinutesToHumanReadable(+expected.hours, +expected.minutes),
          expectedPlus20: DateTimeFormats.hoursAndMinutesToHumanReadable(
            +expectedPlus20.hours,
            Math.round(+expectedPlus20.minutes),
          ),
          totalTimeSpent: DateTimeFormats.hoursAndMinutesToHumanReadable(+total.hours, +total.minutes),
        },
        completionDetailsRows: CourseCompletionUtils.completionDetailsRows({
          courseCompletion,
          allCourseCompletions: courseCompletions,
        }),
        backLink: this.indexLink(req.query as CourseCompletionPageInput),
        processLink: pathWithQuery(
          paths.courseCompletions.process({ id: courseCompletion.id, page: firstProcessPage }),
          {
            ...(req.query as CourseCompletionPageInput),
            form: formId,
          },
        ),
      })
    }
  }

  search(): RequestHandler {
    return async (req: Request, res: Response) => {
      const page = new CourseCompletionIndexPage(req.query as CourseCompletionPageInput)

      const providerCode = req.query.provider?.toString() || undefined
      const pduId = req.query.pdu?.toString() || undefined

      const providersAndPdus = await getProvidersAndPdus({
        providerService: this.providerService,
        referenceDataService: this.referenceDataService,
        providerCode,
        pduId,
        response: res,
      })

      const validationErrors = page.validationErrors()

      if (Object.keys(validationErrors).length !== 0) {
        const errorSummary = Object.keys(validationErrors).map(k => ({
          text: validationErrors[k as keyof CourseCompletionPageInput].text,
          href: `#${k}`,
        }))

        return res.render('courseCompletions/index', {
          errorSummary,
          errors: validationErrors,
          courseCompletionRows: [],
          searchForm: providersAndPdus,
        })
      }

      const { pageNumber, hrefPrefix, sortBy, sortDirection } = getPaginationRequestParams<CourseCompletionSortField>(
        req,
        paths.courseCompletions.search({}),
        {
          provider: providerCode,
          pdu: pduId,
        },
        courseCompletionSortFields,
      )

      const courseCompletions = await this.courseCompletionService.searchCourseCompletions({
        username: res.locals.user.username,
        providerCode,
        pduId,
        page: pageNumber,
        sortBy,
        sortDirection,
        resolutionStatus: 'Unresolved',
        showCourseFailures: 'OnlyWhenMaxAttemptsReached',
      })

      courseCompletions.content.forEach(courseCompletion => {
        this.auditService.sendAuditMessage({
          action: Page.VIEW_COURSE_COMPLETIONS,
          username: res.locals.user.username,
          details: req.params,
          correlationId: req.id,
          subjectType: 'SEARCH_TERM',
          subjectId: `${courseCompletion.firstName} ${courseCompletion.lastName}`,
        })
      })

      const courseCompletionTableHeaders = page.courseCompletionTableHeaders(sortBy, sortDirection ?? 'asc', hrefPrefix)
      const courseCompletionRows = page.courseCompletionTableRows(courseCompletions.content)

      return res.render('courseCompletions/index', {
        pageNumber: courseCompletions.page.number,
        totalPages: courseCompletions.page.totalPages,
        totalElements: courseCompletions.page.totalElements,
        pageSize: courseCompletions.page.size,
        hrefPrefix,
        courseCompletionRows,
        showNoResultsMessage: courseCompletionRows.length === 0,
        courseCompletionTableHeaders,
        searchForm: providersAndPdus,
      })
    }
  }

  private indexLink(query: CourseCompletionPageInput) {
    if (Object.keys(query).length === 0) {
      return paths.courseCompletions.index({})
    }

    return pathWithQuery(paths.courseCompletions.search({}), query)
  }
}
