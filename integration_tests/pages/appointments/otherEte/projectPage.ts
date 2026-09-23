import BaseOtherEteFormPage from './baseOtherEteFormPage'
import { OtherEteFormPage } from '../../../../server/pages/appointments/otherEte/pathMap'
import ProjectQuestionsComponent from '../../components/projectQuestionsComponent'
import { OffenderDto } from '../../../../server/@types/shared'

export default class ProjectPage extends BaseOtherEteFormPage {
  protected page: OtherEteFormPage = 'project'

  readonly form: ProjectQuestionsComponent

  constructor(offender: OffenderDto) {
    super(offender)
    this.form = new ProjectQuestionsComponent()
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').should('contain.text', 'Add project details')
  }
}
