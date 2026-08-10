import paths from '.'
import buildRequirementPagePaths from './requirementPagePaths'

describe('buildRequirementPaths', () => {
  it('builds session requirement paths from the create namespace', () => {
    const result = buildRequirementPagePaths(paths.sessions.create, {
      crn: 'X123456',
      projectCode: 'PROJECT',
      date: '2025-01-01',
    })

    expect(result.backPath).toBe('/sessions/PROJECT/2025-01-01/create/find-a-person')
    expect(result.updatePath).toBe('/sessions/PROJECT/2025-01-01/create/X123456/requirement')
    expect(result.nextPath).toBe(paths.sessions.create.createAppointment)
  })

  it('builds project requirement paths from the create namespace', () => {
    const result = buildRequirementPagePaths(paths.projects.create, {
      crn: 'X123456',
      projectCode: 'PROJECT',
    })

    expect(result.backPath).toBe('/projects/PROJECT/create/find-a-person')
    expect(result.updatePath).toBe('/projects/PROJECT/create/X123456/requirement')
    expect(result.nextPath).toBe(paths.projects.create.createAppointment)
  })
})
