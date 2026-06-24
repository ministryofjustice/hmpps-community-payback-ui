import { GovUkStatusTagColour } from '../@types/user-defined'

export default class HtmlUtils {
  static getAnchor(text: string, href: string): string {
    return `<a href="${href}">${text}</a>`
  }

  static getElementWithContent(text: string, element: string = 'div'): string {
    return `<${element}>${text}</${element}>`
  }

  static getHiddenText = (text: string): string => {
    return `<span class="govuk-visually-hidden">${text}</span>`
  }

  static getStatusTag = (statusLabel: string, colour: GovUkStatusTagColour, unsetMaxWidth: boolean = false): string => {
    let classes = `govuk-tag ${this.getStatusTagClass(colour)}`

    if (unsetMaxWidth) {
      classes += ' cpb-unset-max-width'
    }
    return `<strong class="${classes}">${statusLabel}</strong>`
  }

  static getStatusTagClass(colour: GovUkStatusTagColour): string {
    return `govuk-tag--${colour}`
  }
}
