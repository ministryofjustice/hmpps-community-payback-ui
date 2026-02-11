import ProjectClient from '../data/projectClient'
import ProjectService from './projectService'
import projectFactory from '../testutils/factories/projectFactory'
import pagedModelProjectOutcomeSummaryFactory from '../testutils/factories/pagedModelProjectOutcomeSummaryFactory'

jest.mock('../data/projectClient')

describe('ProjectService', () => {
  const projectClient = new ProjectClient(null) as jest.Mocked<ProjectClient>
  let projectService: ProjectService

  beforeEach(() => {
    projectService = new ProjectService(projectClient)
  })

  describe('getProject', () => {
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

  describe('getIndividualPlacementProjects', () => {
    it('should call `getProjects` on the client with "INDIVIDUAL" project type group and return its result', async () => {
      const projects = pagedModelProjectOutcomeSummaryFactory.build()

      projectClient.getProjects.mockResolvedValue(projects)

      const result = await projectService.getIndividualPlacementProjects({
        username: 'some-username',
        providerCode: '1',
        teamCode: '123',
      })

      expect(projectClient.getProjects).toHaveBeenCalledTimes(1)
      expect(projectClient.getProjects).toHaveBeenCalledWith({
        username: 'some-username',
        providerCode: '1',
        teamCode: '123',
        projectTypeGroup: 'INDIVIDUAL',
      })
      expect(result).toEqual(projects)
    })
  })
})
