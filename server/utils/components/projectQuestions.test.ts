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
})
