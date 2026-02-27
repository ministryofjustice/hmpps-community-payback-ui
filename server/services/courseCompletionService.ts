import { EteCourseCompletionEventDto, PagedModelEteCourseCompletionEventDto } from '../@types/shared'
import { GetCourseCompletionRequest, GetCourseCompletionsRequest } from '../@types/user-defined'
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
    sort,
    page,
    size,
  }: GetCourseCompletionsRequest): Promise<PagedModelEteCourseCompletionEventDto> {
    const apiPageNumber = page > 0 ? page - 1 : 0
    const courseCompletions = await this.courseCourseCompletionClient.getCourseCompletions({
      username,
      providerCode,
      dateFrom,
      dateTo,
      sort: sort ?? ['completionDate'],
      page: apiPageNumber,
      size: size ?? 10,
    })
    const uiPageNumber = courseCompletions.page.number + 1
    return {
      ...courseCompletions,
      page: { ...courseCompletions.page, number: uiPageNumber },
    } as PagedModelEteCourseCompletionEventDto
  }
}
