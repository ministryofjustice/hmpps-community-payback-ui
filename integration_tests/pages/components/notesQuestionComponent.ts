import { YesOrNo } from '../../../server/@types/user-defined'
import RadioGroupComponent from './radioGroupComponent'

export default class NotesQuestionComponent {
  private readonly isSensitiveOptions = new RadioGroupComponent('isSensitive')

  notesField = () => cy.get('#notes')

  completeForm(expectIsSensitiveQuestion = true) {
    this.notesField().type('Attendance notes')
    if (expectIsSensitiveQuestion) {
      this.selectIsSensitive('no')
    }
  }

  selectIsSensitive(value: YesOrNo = 'yes') {
    this.isSensitiveOptions.checkOptionWithValue(value)
  }

  shouldShowNotes(text: string) {
    this.notesField().should('have.value', text)
  }

  shouldShowIsSensitiveValue(value: YesOrNo = 'yes') {
    this.isSensitiveOptions.shouldHaveSelectedValue(value)
  }

  shouldShowUncheckedSensitiveQuestion() {
    this.isSensitiveOptions.getOptionWithValue('yes').should('not.be.checked')
    this.isSensitiveOptions.getOptionWithValue('no').should('not.be.checked')
  }

  shouldNotShowIsSensitiveQuestion() {
    this.isSensitiveOptions.shouldNotBeVisible()
  }
}
