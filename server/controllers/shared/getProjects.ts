import GovUkSelectInput from '../../forms/GovUkSelectInput'
import { GetProjectsParams, GovUkSelectOption } from '../../@types/user-defined'

export default async ({
  projectTypeGroup,
  projectService,
  projectCode,
  providerCode,
  teamCode,
  response,
}: GetProjectsParams): Promise<Array<GovUkSelectOption>> => {
  if (!teamCode) {
    return [{ value: '', text: 'Choose a team' }]
  }

  const projects = await projectService.getProjects({
    projectTypeGroup,
    username: response.locals.user.username,
    providerCode,
    teamCode,
    size: 500,
  })

  return GovUkSelectInput.getOptions(projects.content, 'projectName', 'projectCode', 'Choose project', projectCode)
}
