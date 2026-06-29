import RadioOrCheckboxGroupComponent from './radioOrCheckboxGroupComponent'

export default class NotesQuestionComponent {
  private readonly isSensitiveOptions = new RadioOrCheckboxGroupComponent('isSensitive')

  notesField = () => cy.get('#notes')

  completeForm(expectIsSensitiveQuestion = true) {
    this.notesField().type('Attendance notes')
    if (expectIsSensitiveQuestion) {
      this.checkIsSensitive()
    }
  }

  checkIsSensitive() {
    this.isSensitiveOptions.checkOptionWithValue('yes')
  }

  shouldShowNotes(text: string) {
    this.notesField().should('have.value', text)
  }

  shouldShowIsSensitiveValue() {
    this.isSensitiveOptions.shouldHaveSelectedValue('yes')
  }

  shouldShowUncheckedSensitiveQuestion() {
    this.isSensitiveOptions.getOptionWithValue('yes').should('not.be.checked')
  }

  shouldShowIsSensitiveQuestion() {
    this.isSensitiveOptions.shouldBeVisible()
  }

  shouldNotShowIsSensitiveQuestion() {
    this.isSensitiveOptions.shouldNotBeVisible()
  }
}
