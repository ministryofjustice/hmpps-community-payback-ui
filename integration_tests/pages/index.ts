import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  readonly expect: IndexPageAssertions
  constructor() {
    super('Community Payback')
    this.expect = new IndexPageAssertions(this)
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerPhaseBanner = (): PageElement => cy.get('[data-qa=header-phase-banner]')
}

class IndexPageAssertions {
  constructor(private readonly indexPage: IndexPage) {}

  toShowUserNameInHeader(name: string): void {
    this.indexPage.headerUserName().should('contain.text', name)
  }

  toShowPhaseInHeader(phase: string): void {
    this.indexPage.headerPhaseBanner().should('contain.text', phase)
  }
}