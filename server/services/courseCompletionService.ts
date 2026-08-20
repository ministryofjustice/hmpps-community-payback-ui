import {
  CourseCompletionRecommendationDto,
  CourseCompletionResolutionDto,
  EteCourseCompletionEventDto,
  PagedModelEteCourseCompletionEventDto,
} from '../@types/shared'
import {
  GetCourseCompletionHistoryParams,
  GetCourseCompletionRequest,
  GetCourseCompletionsRequest,
} from '../@types/user-defined'
import CourseCompletionClient from '../data/courseCompletionClient'
import { uiPageNumber } from '../utils/paginationUtils'

export default class CourseCompletionService {
  constructor(private readonly courseCourseCompletionClient: CourseCompletionClient) {}

  async getCourseCompletion(request: GetCourseCompletionRequest): Promise<EteCourseCompletionEventDto> {
    return this.courseCourseCompletionClient.find(request)
  }

  async searchCourseCompletions(request: GetCourseCompletionsRequest): Promise<PagedModelEteCourseCompletionEventDto> {
    const courseCompletions = await this.courseCourseCompletionClient.getCourseCompletions(request)
    return {
      ...courseCompletions,
      page: { ...courseCompletions.page, number: uiPageNumber(courseCompletions.page) },
    } as PagedModelEteCourseCompletionEventDto
  }

  async saveResolution(details: GetCourseCompletionRequest, data: CourseCompletionResolutionDto): Promise<void> {
    return this.courseCourseCompletionClient.save(details, data)
  }

  async getRecommendedSelection(details: GetCourseCompletionRequest): Promise<CourseCompletionRecommendationDto> {
    return this.courseCourseCompletionClient.getRecommendedSelection(details)
  }

  async getHistory(request: GetCourseCompletionHistoryParams): Promise<EteCourseCompletionEventDto[]> {
    return this.courseCourseCompletionClient.getHistory(request)
  }
}
