/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Locator, Page } from '@playwright/test'
import BasePage from '../basePage'
import { CourseCompletionPage } from '../../../server/pages/courseCompletions/process/pathMap'
import HoursMinutesInputComponent from '../components/hoursMinutesInputComponent'
import DateInputComponent from '../components/dateInputComponent'
import { Team } from '../../fixtures/testOptions'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import PersonOnProbation from '../../delius/personOnProbation'

export default class CourseCompletionFormPage extends BasePage {
  readonly expect: CourseCompletionFormPageAssertions

  private readonly crnFieldLocator: Locator

  private readonly requirementRadioGroupLocator: Locator

  private readonly teamFieldLocator: Locator

  private readonly applyTeamButtonLocator: Locator

  private readonly projectFieldLocator: Locator

  private readonly hoursMinutesInput: HoursMinutesInputComponent

  private readonly dateInput: DateInputComponent

  private readonly continueButtonLocator: Locator

  private readonly submitButtonLocator: Locator

  readonly createNewAppointmentButton: Locator

  private readonly existingAppointmentsRadioGroupLocator: Locator

  private readonly unableToCreditTimeNotes: Locator

  private readonly unableToCreditTimeLink: Locator

  constructor(
    page: Page,
    readonly personOnProbation: PersonOnProbation,
    readonly hasExistingAppointments: boolean = false,
  ) {
    super(page)
    this.expect = new CourseCompletionFormPageAssertions(this, personOnProbation)
    this.hoursMinutesInput = new HoursMinutesInputComponent(page)
    this.dateInput = new DateInputComponent(page)
    this.continueButtonLocator = page.getByRole('button', { name: 'Continue' })
    this.crnFieldLocator = page.getByLabel('Add a CRN')
    this.requirementRadioGroupLocator = page.getByRole('group', { name: 'Choose an unpaid work requirement' })
    this.teamFieldLocator = page.getByLabel('Project team')
    this.applyTeamButtonLocator = page.getByRole('button', { name: 'Select team' })
    this.projectFieldLocator = page.getByLabel('Choose project', { exact: true })
    this.existingAppointmentsRadioGroupLocator = page.getByRole('group', { name: 'Choose an appointment' })
    this.submitButtonLocator = page.getByRole('button', { name: 'Submit' })
    this.createNewAppointmentButton = page.getByRole('button', { name: 'Create an appointment' })
    this.unableToCreditTimeNotes = page.getByLabel('Add a reason')
    this.unableToCreditTimeLink = page.getByRole('link', { name: 'Unable to credit hours' })
  }

  async continue() {
    await this.continueButtonLocator.click()
  }

  async fillCrn(crn: string) {
    await this.crnFieldLocator.fill(crn)
  }

  async selectRequirement() {
    await this.requirementRadioGroupLocator.getByRole('radio').nth(0).check()
  }

  async selectAppointment(appointment: { date: Date }) {
    await this.existingAppointmentsRadioGroupLocator
      .getByRole('radio', {
        name: DateTimeFormats.dateObjtoUIDate(appointment.date),
      })
      .check()
  }

  async selectProject(team: Team, projectName: string) {
    await this.teamFieldLocator.selectOption({ label: team.name })
    await this.applyTeamButtonLocator.click()
    await this.projectFieldLocator.selectOption({ label: projectName })
  }

  async completeOutcomeForm(
    timeCredited: { hours: string; minutes: string } = { hours: '1', minutes: '10' },
    date: Date = new Date(),
  ) {
    await this.hoursMinutesInput.enterHours(timeCredited.hours, timeCredited.minutes)
    await this.dateInput.enterDate(date)
  }

  async completeUnableToCreditTimeForm() {
    await this.unableToCreditTimeNotes.fill('Why time cannot be credited.')
  }

  async submit() {
    await this.submitButtonLocator.click()
  }

  async clickUnableToCreditTimeLink() {
    await this.unableToCreditTimeLink.click()
  }
}

class CourseCompletionFormPageAssertions {
  private readonly expectedTitle: Record<CourseCompletionPage, string>

  constructor(
    private readonly page: CourseCompletionFormPage,
    private readonly personOnProbation: PersonOnProbation,
  ) {
    this.expectedTitle = this.buildExpectedTitles()
  }

  async toBeOnThePage(formStep: CourseCompletionPage) {
    await expect(this.page.headingLocator).toContainText(this.expectedTitle[formStep])
  }

  private buildExpectedTitles = (): Record<CourseCompletionPage, string> => {
    const personName = `${this.personOnProbation.firstName} ${this.personOnProbation.lastName}`
    return {
      crn: 'Match with CRN',
      person: 'Confirm CRN match',
      requirement: personName,
      history: personName,
      project: personName,
      appointments: personName,
      outcome: personName,
      confirm: personName,
      unableToCreditTime: personName,
    }
  }
}
