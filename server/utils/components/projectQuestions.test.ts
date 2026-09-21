import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import ProjectQuestions from './projectQuestions'

describe('projectQuestions', () => {
  describe('validationErrors', () => {
    it.each(['', undefined])('returns team error if no answers given', (value?: string) => {
      const query = { team: value, project: value }

      const result = ProjectQuestions.getValidationErrors(query)

      expect(result).toEqual({ team: { text: 'Choose a team' } })
    })

    it.each(['', undefined])('returns project error if no project given', (value?: string) => {
      const query = { team: '1', project: value }

      const result = ProjectQuestions.getValidationErrors(query)

      expect(result).toEqual({ project: { text: 'Choose a project' } })
    })

    it('returns no errors if team and project answer given', () => {
      const query = { team: '1', project: '2' }

      const result = ProjectQuestions.getValidationErrors(query)
      expect(result).toEqual({})
    })
  })

  describe('updateFormData', () => {
    it('sets team and project values', () => {
      const form = appointmentOutcomeFormFactory.build()
      const teams = [
        { value: 'TEAM-1', text: 'Team 1' },
        { value: 'TEAM-2', text: 'Team 2' },
      ]

      const projects = [
        { value: 'PROJECT-0', text: 'Project 0' },
        { value: 'PROJECT-1', text: 'Project 1' },
      ]

      const result = ProjectQuestions.updateFormData(
        form,
        { team: 'TEAM-1', project: 'PROJECT-1' },
        { teamItems: teams, projectItems: projects },
      )

      expect(result).toEqual({
        ...form,
        projectTeam: { code: 'TEAM-1', name: 'Team 1' },
        project: { code: 'PROJECT-1', name: 'Project 1' },
      })
    })

    it('throws when selected team does not exist in options', () => {
      const form = appointmentOutcomeFormFactory.build()
      const teams = [{ value: 'TEAM-2', text: 'Team 2' }]
      const projects = [{ value: 'PROJECT-1', text: 'Project 1' }]

      expect(() =>
        ProjectQuestions.updateFormData(
          form,
          { team: 'TEAM-1', project: 'PROJECT-1' },
          { teamItems: teams, projectItems: projects },
        ),
      ).toThrow('Selected team with code TEAM-1 was not found.')
    })

    it('throws when selected project does not exist in options', () => {
      const form = appointmentOutcomeFormFactory.build()
      const teams = [{ value: 'TEAM-1', text: 'Team 1' }]
      const projects = [{ value: 'PROJECT-2', text: 'Project 2' }]

      expect(() =>
        ProjectQuestions.updateFormData(
          form,
          { team: 'TEAM-1', project: 'PROJECT-1' },
          { teamItems: teams, projectItems: projects },
        ),
      ).toThrow('Selected project with code PROJECT-1 was not found.')
    })
  })
})
