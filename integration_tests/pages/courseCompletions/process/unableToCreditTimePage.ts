import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class UnableToCreditTimePage extends BaseCourseCompletionsPage {
  private readonly notesField = this.getTextInputById('unableToCreditTimeNotes')

  constructor(title: string) {
    super(title)
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = pathWithQuery(paths.courseCompletions.unableToCreditTime({ id: courseCompletion.id }), {
      form: '12',
    })
    return this.visitAndCheck(path, UnableToCreditTimePage.getName(courseCompletion))
  }

  enterNotes() {
    this.notesField.type('Unable to credit time to person')
  }

  enterNotesWithCharacterLength(characterLength: number): void {
    const userInput = 'x'.repeat(characterLength)

    // Use 'invoke' instead of 'type' for performance reasons
    this.notesField.invoke('val', userInput)
  }

  shouldShowError() {
    this.shouldShowErrorSummary('unableToCreditTimeNotes', 'Notes must be 250 characters or less')
  }
}
