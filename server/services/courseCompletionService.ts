import {
  CourseCompletionResolutionDto,
  EteCourseCompletionEventDto,
  PagedModelEteCourseCompletionEventDto,
} from '../@types/shared'
import { GetCourseCompletionRequest, GetCourseCompletionsParams } from '../@types/user-defined'
import CourseCompletionClient from '../data/courseCompletionClient'
import { PAGE_SIZE, apiPageNumber, uiPageNumber } from '../utils/paginationUtils'

export default class CourseCompletionService {
  constructor(private readonly courseCourseCompletionClient: CourseCompletionClient) {}

  async getCourseCompletion(request: GetCourseCompletionRequest): Promise<EteCourseCompletionEventDto> {
    return this.courseCourseCompletionClient.find(request)
  }

  async searchCourseCompletions(request: GetCourseCompletionsParams): Promise<PagedModelEteCourseCompletionEventDto> {
    const { page, sortBy, sortDirection, size, ...params } = request

    let sort: string[]
    if (Array.isArray(sortBy) && sortBy.length > 0) {
      sort = sortBy.map(s => `${s ?? 'completionDateTime'},${sortDirection ?? 'asc'}`)
    } else {
      sort = [`${sortBy ?? 'completionDateTime'},${sortDirection ?? 'asc'}`]
    }

    const courseCompletions = await this.courseCourseCompletionClient.getCourseCompletions({
      ...params,
      sort,
      page: apiPageNumber(page),
      size: size ?? PAGE_SIZE,
    })
    return {
      ...courseCompletions,
      page: { ...courseCompletions.page, number: uiPageNumber(courseCompletions.page) },
    } as PagedModelEteCourseCompletionEventDto
  }

  async saveResolution(details: GetCourseCompletionRequest, data: CourseCompletionResolutionDto): Promise<void> {
    return this.courseCourseCompletionClient.save(details, data)
  }
}
