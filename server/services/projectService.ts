import { PagedModelProjectOutcomeSummaryDto, ProjectDto } from '../@types/shared'
import { GetProjectRequest, GetProjectsRequest } from '../@types/user-defined'
import ProjectClient from '../data/projectClient'

export default class ProjectService {
  constructor(private readonly projectClient: ProjectClient) {}

  async getProject(request: GetProjectRequest): Promise<ProjectDto> {
    return this.projectClient.find(request)
  }

  async getIndividualPlacementProjects(
    request: Omit<GetProjectsRequest, 'projectTypeGroup'>,
  ): Promise<PagedModelProjectOutcomeSummaryDto> {
    return this.projectClient.getProjects({ ...request, projectTypeGroup: 'INDIVIDUAL' })
  }
}
