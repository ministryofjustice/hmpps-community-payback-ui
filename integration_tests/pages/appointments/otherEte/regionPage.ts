import SelectInput from '../../components/selectComponent'
import BaseOtherEteFormPage from './baseOtherEteFormPage'
import { OtherEteFormPage } from '../../../../server/pages/appointments/otherEte/pathMap'
import { OffenderDto } from '../../../../server/@types/shared'

export default class RegionPage extends BaseOtherEteFormPage {
  protected page: OtherEteFormPage = 'region'

  readonly regionInput: SelectInput

  constructor(offender: OffenderDto) {
    super(offender)
    this.regionInput = new SelectInput('provider')
  }

  protected override customCheckOnPage(): void {
    cy.get('label').should('contain.text', 'Choose region')
  }
}
