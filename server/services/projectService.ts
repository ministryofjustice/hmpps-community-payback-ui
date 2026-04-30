import { PagedModelProjectOutcomeSummaryDto, ProjectDto } from '../@types/shared'
import { GetProjectRequest, GetProjectsParams, GetProjectsRequest } from '../@types/user-defined'
import ProjectClient from '../data/projectClient'
import config from '../config'
import { apiPageNumber, uiPageNumber } from '../utils/paginationUtils'

export default class ProjectService {
  constructor(private readonly projectClient: ProjectClient) {}

  async getProject(request: GetProjectRequest): Promise<ProjectDto> {
    return this.projectClient.find(request)
  }

  async getIndividualPlacementProjects(
    request: Omit<GetProjectsParams, 'projectTypeGroup' | 'overdueDays'>,
  ): Promise<PagedModelProjectOutcomeSummaryDto> {
    const { page, sortBy, sortDirection, size, ...params } = request
    const sort = [`${sortBy ?? 'name'},${sortDirection ?? 'asc'}`]

    const projects = await this.projectClient.getProjects({
      ...params,
      sort,
      page: apiPageNumber(page),
      size: size ?? 20,
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
