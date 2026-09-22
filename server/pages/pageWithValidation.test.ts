import PageWithValidation from './pageWithValidation'

describe('PageWithValidation', () => {
  describe('validate', () => {
    it('returns no errors and an empty summary when the validate function returns no errors', () => {
      const getValidationErrors = jest.fn().mockReturnValue({})

      const result = PageWithValidation.validate({ foo: 'bar' }, getValidationErrors, { context: 'value' })

      expect(getValidationErrors).toHaveBeenCalledWith({ foo: 'bar' }, { context: 'value' })
      expect(result).toEqual({ errors: {}, hasErrors: false, errorSummary: [] })
    })

    it('returns errors, hasErrors and a computed summary when the validate function returns errors', () => {
      const getValidationErrors = jest.fn().mockReturnValue({ foo: { text: 'Enter foo' } })

      const result = PageWithValidation.validate({ foo: '' }, getValidationErrors)

      expect(result).toEqual({
        errors: { foo: { text: 'Enter foo' } },
        hasErrors: true,
        errorSummary: [{ text: 'Enter foo', href: '#foo', attributes: { 'data-cy-error-foo': 'Enter foo' } }],
      })
    })
  })

  describe('validationErrors (instance)', () => {
    class TestPage extends PageWithValidation<{ foo: string }> {
      protected getValidationErrors(query: { foo: string }) {
        return query.foo ? {} : { foo: { text: 'Enter foo' } }
      }
    }

    it('delegates to the same logic as the static method', () => {
      const page = new TestPage()

      expect(page.validationErrors({ foo: '' })).toEqual({
        errors: { foo: { text: 'Enter foo' } },
        hasErrors: true,
        errorSummary: [{ text: 'Enter foo', href: '#foo', attributes: { 'data-cy-error-foo': 'Enter foo' } }],
      })
      expect(page.validationErrors({ foo: 'bar' })).toEqual({ errors: {}, hasErrors: false, errorSummary: [] })
    })
  })
})
