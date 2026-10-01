import Offender from '../../../../server/models/offender'
import Page from '../../page'
import { buildOtherEtePath, OtherEteFormPage } from '../../../../server/pages/appointments/otherEte/pathMap'
import { OffenderDto } from '../../../../server/@types/shared'

export default abstract class BaseOtherEteFormPage extends Page {
  protected abstract page: OtherEteFormPage

  constructor(offender: OffenderDto) {
    super(new Offender(offender).name)
  }

  static visit<T extends BaseOtherEteFormPage, A extends unknown[]>(
    this: new (offender: OffenderDto, ...args: A) => T,
    offender: OffenderDto,
    ...args: A
  ): T {
    const page = new this(offender, ...args)
    cy.visit(page.otherEtePath())
    page.checkOnPage()
    return page
  }

  private otherEtePath = () => buildOtherEtePath(this.page, '123')
}
