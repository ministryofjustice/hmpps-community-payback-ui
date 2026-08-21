import { PagedModelProjectOutcomeSummaryDto, ProjectDto } from '../@types/shared'
import { GetProjectRequest, GetProjectsRequest } from '../@types/user-defined'
import ProjectClient from '../data/projectClient'
import config from '../config'
import { uiPageNumber } from '../utils/paginationUtils'

export default class ProjectService {
  constructor(private readonly projectClient: ProjectClient) {}

  /**
   * If you are using this method to fetch session details
   * consider using {@link SessionService.getSession} instead
   * as this also calls this method under the hood.
   */
  async getProject(request: GetProjectRequest): Promise<ProjectDto> {
    return this.projectClient.find(request)
  }

  async getIndividualPlacementProjects(
    request: Omit<GetProjectsRequest, 'projectTypeGroup' | 'overdueDays'>,
  ): Promise<PagedModelProjectOutcomeSummaryDto> {
    const projects = await this.projectClient.getProjects({
      ...request,
      projectTypeGroup: 'INDIVIDUAL',
      overdueDays: config.individualPlacementsOverdueDays,
    })

    return {
      ...projects,
      page: { ...projects.page, number: uiPageNumber(projects.page) },
    } as PagedModelProjectOutcomeSummaryDto
  }

  async getProjects(request: GetProjectsRequest): Promise<PagedModelProjectOutcomeSummaryDto> {
    return this.projectClient.getProjects(request)
  }
}
