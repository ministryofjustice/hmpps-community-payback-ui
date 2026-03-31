import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Record attendance on community payback')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerEnvironmentBanner = (): PageElement => cy.get('[data-qa=header-environment-banner]')

  headerPhaseBanner = (): PageElement => cy.get('.govuk-phase-banner')
}
