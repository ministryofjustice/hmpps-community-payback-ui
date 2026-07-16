import type { Response } from 'express'
import { GovUkSelectOption } from '../../@types/user-defined'
import ProviderService from '../../services/providerService'
import getTeams from './getTeams'
import ProjectService from '../../services/projectService'
import { ProjectDto, ProjectTypeDto } from '../../@types/shared'
import GovUkSelectInput from '../../forms/GovUkSelectInput'

export interface ProjectsAndTeamsViewData {
  projectItems?: Array<GovUkSelectOption>
  teamItems: Array<GovUkSelectOption>
  teamCode?: string
}
export default async ({
  projectService,
  providerService,
  projectTypeGroup,
  providerCode,
  teamCode,
  projectCode,
  project,
  response,
}: {
  projectService: ProjectService
  providerService: ProviderService
  projectTypeGroup: ProjectTypeDto['group']
  providerCode?: string
  teamCode?: string
  projectCode?: string
  project?: ProjectDto
  response: Response
}): Promise<ProjectsAndTeamsViewData> => {
  const teamItems = await getTeams({
    providerService,
    providerCode,
    response,
    teamCode,
  })

  if (!teamCode) {
    return {
      teamItems,
    }
  }
  const projects = await projectService.getProjects({
    projectTypeGroup,
    username: response.locals.user.username,
    providerCode,
    teamCode,
    size: 500,
  })

  const projectItems = GovUkSelectInput.getOptions(
    projects.content ?? [],
    'projectName',
    'projectCode',
    'Choose project',
    projectCode,
  )

  if (!projectItems.find(item => item.value === projectCode) && project) {
    projectItems.push({
      text: project.projectName,
      value: project.projectCode,
      selected: project.projectCode === projectCode,
    })
  }
  return { teamItems, projectItems, teamCode }
}
