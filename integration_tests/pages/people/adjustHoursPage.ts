import { OffenderFullDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import HoursMinutesInputComponent from '../components/hoursMinutesInputComponent'
import RadioOrCheckboxGroupComponent from '../components/radioOrCheckboxGroupComponent'
import Page from '../page'

export default class AdjustHoursPage extends Page {
  readonly dateInput = () => this.getTextInputById('date')

  readonly reasonSelect = new RadioOrCheckboxGroupComponent('reasonCode')

  readonly hoursAndMinutesInput = new HoursMinutesInputComponent()

  constructor(offender: Offender) {
    super(offender.name)
  }

  static visit(_offender: OffenderFullDto, deliusEventNumber: string): AdjustHoursPage {
    const offender = new Offender(_offender)
    const path = paths.people.adjustHours.update({ crn: offender.crn, deliusEventNumber })
    return this.visitAndCheck(path, offender)
  }

  enterDate(date: string): void {
    this.dateInput().clear()
    this.dateInput().type(date)
  }

  completeForm(date: string, reasonCode: string, hours: string, minutes: string): void {
    this.enterDate(date)
    this.reasonSelect.checkOptionWithValue(reasonCode)
    this.hoursAndMinutesInput.enterTime(hours, minutes)
  }

  protected override customCheckOnPage(): void {
    cy.get('h2').first().should('contain.text', 'Adjust hours')
  }
}
