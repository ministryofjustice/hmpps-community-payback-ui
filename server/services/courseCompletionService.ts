import {
  CourseCompletionResolutionDto,
  EteCourseCompletionEventDto,
  PagedModelEteCourseCompletionEventDto,
} from '../@types/shared'
import { GetCourseCompletionRequest, GetCourseCompletionsParams } from '../@types/user-defined'
import CourseCompletionClient from '../data/courseCompletionClient'

export default class CourseCompletionService {
  constructor(private readonly courseCourseCompletionClient: CourseCompletionClient) {}

  async getCourseCompletion(request: GetCourseCompletionRequest): Promise<EteCourseCompletionEventDto> {
    return this.courseCourseCompletionClient.find(request)
  }

  async searchCourseCompletions({
    username,
    providerCode,
    dateFrom,
    dateTo,
    pduId,
    sortBy,
    sortDirection,
    page,
    size,
    resolutionStatus,
  }: GetCourseCompletionsParams): Promise<PagedModelEteCourseCompletionEventDto> {
    const apiPageNumber = page > 0 ? page - 1 : 0
    const sort = [`${sortBy ?? 'completionDateTime'},${sortDirection ?? 'asc'}`]
    const courseCompletions = await this.courseCourseCompletionClient.getCourseCompletions({
      username,
      providerCode,
      pduId,
      dateFrom,
      dateTo,
      resolutionStatus,
      sort,
      page: apiPageNumber,
      size: size ?? 10,
    })
    const uiPageNumber = courseCompletions.page.number + 1
    return {
      ...courseCompletions,
      page: { ...courseCompletions.page, number: uiPageNumber },
    } as PagedModelEteCourseCompletionEventDto
  }

  async saveResolution(details: GetCourseCompletionRequest, data: CourseCompletionResolutionDto): Promise<void> {
    return this.courseCourseCompletionClient.save(details, data)
  }
}
