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
  }: GetCourseCompletionsRequest): Promise<PagedModelEteCourseCompletionEventDto> {
    return this.courseCourseCompletionClient.getCourseCompletions({
      username,
      providerCode,
      dateFrom,
      dateTo,
    })
  }
}
