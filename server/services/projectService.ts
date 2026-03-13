import { PagedModelProjectOutcomeSummaryDto, ProjectDto } from '../@types/shared'
import { GetProjectRequest, GetProjectsRequest } from '../@types/user-defined'
import ProjectClient from '../data/projectClient'
import config from '../config'

export default class ProjectService {
  constructor(private readonly projectClient: ProjectClient) {}

  async getProject(request: GetProjectRequest): Promise<ProjectDto> {
    return this.projectClient.find(request)
  }

  async getIndividualPlacementProjects(
    request: Omit<GetProjectsRequest, 'projectTypeGroup' | 'overdueDays'>,
  ): Promise<PagedModelProjectOutcomeSummaryDto> {
    return this.projectClient.getProjects({
      ...request,
      projectTypeGroup: 'INDIVIDUAL',
      overdueDays: config.individualPlacementsOverdueDays,
    })
  }
}
