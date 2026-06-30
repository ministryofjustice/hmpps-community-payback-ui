import { GovUkStatusTagColour } from '../@types/user-defined'
import HtmlUtils from './htmlUtils'

describe('HTMLUtils', () => {
  describe('getAnchor', () => {
    it('returns a link element with given text and href', () => {
      const result = HtmlUtils.getAnchor('link text', '/path')

      expect(result).toEqual('<a href="/path">link text</a>')
    })
  })

  describe('getElementWithContent', () => {
    it('returns a div element by default', () => {
      const result = HtmlUtils.getElementWithContent('Some content')
      expect(result).toEqual('<div>Some content</div>')
    })

    it('returns any given emmet wrapped element with content', () => {
      const result = HtmlUtils.getElementWithContent('Some content', 'button')
      expect(result).toEqual('<button>Some content</button>')
    })
  })

  describe('getElementsWithContent', () => {
    it('wraps all items in the specified element when element is p', () => {
      const result = HtmlUtils.getElementsWithContent(['First item', 'Second item'], 'p')

      expect(result).toEqual('<p>First item</p><p>Second item</p>')
    })

    it('wraps all items in div elements when no element parameter is provided', () => {
      const result = HtmlUtils.getElementsWithContent(['First item', 'Second item'])

      expect(result).toEqual('<div>First item</div><div>Second item</div>')
    })
  })

  describe('getHiddenText', () => {
    it('returns an element with the govuk hidden class containing given content', () => {
      const result = HtmlUtils.getHiddenText('Some content')

      expect(result).toEqual('<span class="govuk-visually-hidden">Some content</span>')
    })
  })

  describe('getStatusTag', () => {
    const colours = ['grey', 'red', 'yellow']
    it.each(colours)('returns a GOV.UK Frontend status tag component with the given colour and label', colour => {
      const result = HtmlUtils.getStatusTag('Label', colour as GovUkStatusTagColour)
      expect(result).toEqual(`<strong class="govuk-tag govuk-tag--${colour}">Label</strong>`)
    })

    it('includes cpb-unset-max-width class when unsetMaxWidth is true', () => {
      const result = HtmlUtils.getStatusTag('Label', 'grey', true)

      expect(result).toEqual('<strong class="govuk-tag govuk-tag--grey cpb-unset-max-width">Label</strong>')
    })

    it('does not include cpb-unset-max-width class when unsetMaxWidth is false', () => {
      const result = HtmlUtils.getStatusTag('Label', 'grey', false)

      expect(result).toEqual('<strong class="govuk-tag govuk-tag--grey">Label</strong>')
    })
  })

  describe('getStatusTagClass', () => {
    it.each(['grey', 'red', 'yellow', 'teal'])('returns the status tag class for %s colour', colour => {
      const result = HtmlUtils.getStatusTagClass(colour as GovUkStatusTagColour)
      expect(result).toEqual(`govuk-tag--${colour}`)
    })
  })
})
