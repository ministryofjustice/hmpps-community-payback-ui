import RequirementPage from './requirementPage'

describe('requirementPage', () => {
  describe('validationErrors', () => {
    it('returns an error if no delius event number is provided', () => {
      const page = new RequirementPage()

      expect(page.getValidationErrors({})).toEqual({
        deliusEventNumber: {
          text: 'Select a requirement',
        },
      })
    })

    it('does not return an error if delius event number is provided', () => {
      const page = new RequirementPage()

      expect(page.getValidationErrors({ deliusEventNumber: '1' })).toEqual({})
    })
  })
})
