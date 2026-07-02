import type { Response } from 'express'
import { GovUkSelectOption } from '../../@types/user-defined'
import ProviderService from '../../services/providerService'
import getTeams from './getTeams'
import ProjectService from '../../services/projectService'
import { ProjectTypeDto } from '../../@types/shared'
import GovUkSelectInput from '../../forms/GovUkSelectInput'

interface ViewData {
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
  response,
}: {
  projectService: ProjectService
  providerService: ProviderService
  projectTypeGroup: ProjectTypeDto['group']
  providerCode?: string
  teamCode?: string
  projectCode?: string
  response: Response
}): Promise<ViewData> => {
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
  })

  const projectItems = GovUkSelectInput.getOptions(
    projects.content ?? [],
    'projectName',
    'projectCode',
    'Choose project',
    projectCode,
  )
  return { teamItems, projectItems, teamCode }
}
