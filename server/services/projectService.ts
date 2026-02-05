import { ProjectDto } from '../@types/shared'
import { GetProjectRequest } from '../@types/user-defined'
import ProjectClient from '../data/projectClient'

export default class ProjectService {
  constructor(private readonly projectClient: ProjectClient) {}

  async getProject(request: GetProjectRequest): Promise<ProjectDto> {
    return this.projectClient.find(request)
  }
}
