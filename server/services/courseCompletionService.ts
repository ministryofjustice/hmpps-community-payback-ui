import { EteCourseCompletionEventDto } from '../@types/shared'
import { GetCourseCompletionRequest } from '../@types/user-defined'
import CourseCompletionClient from '../data/courseCompletionClient'

export default class CourseCompletionService {
  constructor(private readonly courseCourseCompletionClient: CourseCompletionClient) {}

  async getCourseCompletion(request: GetCourseCompletionRequest): Promise<EteCourseCompletionEventDto> {
    return this.courseCourseCompletionClient.find(request)
  }
}
