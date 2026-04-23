/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Locator, Page } from '@playwright/test'
import BasePage from '../basePage'
import { CourseCompletionPage } from '../../../server/pages/courseCompletions/process/pathMap'
import HoursMinutesInputComponent from '../components/hoursMinutesInputComponent'
import DateInputComponent from '../components/dateInputComponent'
import { Team } from '../../fixtures/testOptions'
import Project from '../../delius/project'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'

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

  constructor(
    page: Page,
    readonly hasExistingAppointments: boolean = false,
  ) {
    super(page)
    this.expect = new CourseCompletionFormPageAssertions(this)
    this.hoursMinutesInput = new HoursMinutesInputComponent(page)
    this.dateInput = new DateInputComponent(page)
    this.continueButtonLocator = page.getByRole('button', { name: 'Continue' })
    this.crnFieldLocator = page.getByLabel('Add a CRN')
    this.requirementRadioGroupLocator = page.getByRole('group', { name: 'Existing requirements' })
    this.teamFieldLocator = page.getByLabel('Project team')
    this.applyTeamButtonLocator = page.getByRole('button', { name: 'Select team' })
    this.projectFieldLocator = page.getByLabel('Choose project', { exact: true })
    this.existingAppointmentsRadioGroupLocator = page.getByRole('group', { name: 'Existing appointments' })
    this.submitButtonLocator = page.getByRole('button', { name: 'Submit' })
    this.createNewAppointmentButton = page.getByRole('button', { name: 'Create an appointment' })
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

  async selectProject(team: Team, project: Project) {
    await this.teamFieldLocator.selectOption({ label: team.name })
    await this.applyTeamButtonLocator.click()
    await this.projectFieldLocator.selectOption({ label: project.name })
  }

  async completeOutcomeForm(
    timeCredited: { hours: string; minutes: string } = { hours: '1', minutes: '10' },
    date: Date = new Date(),
  ) {
    await this.hoursMinutesInput.enterHours(timeCredited.hours, timeCredited.minutes)
    await this.dateInput.enterDate(date)
  }

  async submit() {
    await this.submitButtonLocator.click()
  }
}

class CourseCompletionFormPageAssertions {
  private readonly expectedTitle: Record<CourseCompletionPage, string>

  constructor(private readonly page: CourseCompletionFormPage) {
    this.expectedTitle = this.buildExpectedTitles()
  }

  async toBeOnThePage(formStep: CourseCompletionPage) {
    await expect(this.page.headingLocator).toContainText(this.expectedTitle[formStep])
  }

  private buildExpectedTitles = (): Record<CourseCompletionPage, string> => {
    return {
      crn: 'Match with CRN',
      person: 'Confirm CRN match',
      requirement: 'Choose an unpaid work requirement',
      history: 'Check course history',
      project: 'Match with a project',
      appointments: this.page.hasExistingAppointments ? 'Choose an appointment' : 'Create an appointment',
      outcome: 'Record an outcome',
      confirm: 'Confirm details',
    }
  }
}
