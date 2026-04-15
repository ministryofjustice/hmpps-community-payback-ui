/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Locator, Page } from '@playwright/test'
import BasePage from '../basePage'
import { CourseCompletionPage } from '../../../server/pages/courseCompletions/process/pathMap'
import HoursMinutesInputComponent from '../components/hoursMinutesInputComponent'
import DateInputComponent from '../components/dateInputComponent'
import { Team } from '../../fixtures/testOptions'

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

  constructor(page: Page) {
    super(page)
    this.expect = new CourseCompletionFormPageAssertions(this)
    this.hoursMinutesInput = new HoursMinutesInputComponent(page)
    this.dateInput = new DateInputComponent(page)
    this.continueButtonLocator = page.getByRole('button', { name: 'Continue' })
    this.crnFieldLocator = page.getByLabel('Add a crn')
    this.requirementRadioGroupLocator = page.getByRole('group', { name: 'Existing requirements' })
    this.teamFieldLocator = page.getByLabel('Project team')
    this.applyTeamButtonLocator = page.getByRole('button', { name: 'Select team' })
    this.projectFieldLocator = page.getByLabel('Choose project', { exact: true })
    this.submitButtonLocator = page.getByRole('button', { name: 'Submit' })
    this.createNewAppointmentButton = page.getByRole('button', { name: 'Connect an appointment' })
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

  async selectTeam(team: Team) {
    await this.teamFieldLocator.selectOption({ label: team.name })
    await this.applyTeamButtonLocator.click()
    await this.projectFieldLocator.selectOption({ index: 1 })
  }

  async completeOutcomeForm() {
    await this.hoursMinutesInput.enterHours('1', '10')
    await this.dateInput.enterDate(new Date())
  }

  async submit() {
    await this.submitButtonLocator.click()
  }
}

class CourseCompletionFormPageAssertions {
  constructor(private readonly page: CourseCompletionFormPage) {}

  async toBeOnThePage(formStep: CourseCompletionPage) {
    await expect(this.page.headingLocator).toContainText(this.expectedTitle[formStep])
  }

  private expectedTitle: Record<CourseCompletionPage, string> = {
    crn: 'Match with CRN',
    person: 'Confirm CRN match',
    requirement: 'Choose an unpaid work requirement',
    history: 'Check course history',
    project: 'Match with a project',
    appointments: 'Connect an appointment',
    outcome: 'Record an outcome',
    confirm: 'Confirm details',
  }
}
