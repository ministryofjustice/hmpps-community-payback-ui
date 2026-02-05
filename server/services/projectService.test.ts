import ProjectClient from '../data/projectClient'
import ProjectService from './projectService'
import projectFactory from '../testutils/factories/projectFactory'

jest.mock('../data/projectClient')

describe('ProjectService', () => {
  const projectClient = new ProjectClient(null) as jest.Mocked<ProjectClient>
  let projectService: ProjectService

  beforeEach(() => {
    projectService = new ProjectService(projectClient)
  })

  it('should call find on the client and return its result', async () => {
    const project = projectFactory.build()

    projectClient.find.mockResolvedValue(project)
    const result = await projectService.getProject({
      username: 'some-username',
      projectCode: '1',
    })

    expect(projectClient.find).toHaveBeenCalledTimes(1)
    expect(result).toEqual(project)
  })
})
