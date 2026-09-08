import { AppointmentDto, PersonalCircumstancesDetailsDto, ProjectDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import { pathWithQuery } from '../../../server/utils/utils'
import RadioOrCheckboxGroupComponent from '../components/radioOrCheckboxGroupComponent'
import SummaryListComponent from '../components/summaryListComponent'
import Page from '../page'

export default class UpdateTravelTimePage extends Page {
  readonly timeInput = new RadioOrCheckboxGroupComponent('time')

  readonly appointmentDetails = new SummaryListComponent('Appointment details')

  readonly personalCircumstanceDetails = new SummaryListComponent('Personal circumstance details')

  constructor(private readonly appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    super(offender.name)
  }

  static visit(
    appointment: AppointmentDto,
    taskId: string = '1',
    originalSearch?: { provider: string },
  ): UpdateTravelTimePage {
    const basePath = paths.appointments.travelTime.update({
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
      taskId,
    })
    const path = originalSearch ? pathWithQuery(basePath, originalSearch) : basePath
    return this.visitAndCheck(path, appointment)
  }

  clickNotEligible() {
    cy.get('button').contains('Not eligible').click()
  }

  completeForm() {
    this.timeInput.checkOptionWithValue('60')
  }

  override clickSubmit() {
    cy.get('button').contains('Credit travel time').click()
  }

  override shouldShowErrorSummary(message: string) {
    cy.get('[data-testid="error-summary"]').within(() => {
      cy.get('li').contains(message)
    })
  }

  shouldShowTimeErrorSummary() {
    cy.get(`[data-cy-error-time]`).should('contain', 'Select an amount of travel time')
  }

  shouldShowAppointmentDetails(contactOutcome: string, project: ProjectDto) {
    this.appointmentDetails
      .getValueWithLabel('Date')
      .should('contain.text', DateTimeFormats.isoDateToUIDate(this.appointment.date))

    this.appointmentDetails.getValueWithLabel('Contact outcome').should('contain.text', contactOutcome)

    this.appointmentDetails
      .getValueWithLabel('Actual start time')
      .should('contain.text', DateTimeFormats.stripTime(this.appointment.startTime))

    this.appointmentDetails
      .getValueWithLabel('Actual end time')
      .should('contain.text', DateTimeFormats.stripTime(this.appointment.endTime))

    this.appointmentDetails.getValueWithLabel('Project').should('contain.text', project.projectName)
    this.appointmentDetails.getValueWithLabel('Project type').should('contain.text', project.projectType.name)
  }

  shouldShowNoPersonalCircumstancesMessage() {
    cy.get('.moj-alert__content').should('contain.text', 'No details exist in travel time personal circumstances.')
  }

  shouldNotShowNoPersonalCircumstancesMessage() {
    cy.get('.moj-alert__content').should('not.exist')
  }

  shouldShowPersonalCircumstanceDetails(personalCircumstanceDetails: PersonalCircumstancesDetailsDto) {
    this.personalCircumstanceDetails
      .getValueWithLabel('Circumstance type')
      .should('contain.text', 'CP/UPW Offender Project Information')
    this.personalCircumstanceDetails
      .getValueWithLabel('Circumstance subtype')
      .should('contain.text', 'Allowed travel time')
    this.personalCircumstanceDetails
      .getValueWithLabel('Start date')
      .should('contain.text', DateTimeFormats.isoDateToUIDate(personalCircumstanceDetails.startDate))
    if (personalCircumstanceDetails.endDate) {
      this.personalCircumstanceDetails
        .getValueWithLabel('End date')
        .should('contain.text', DateTimeFormats.isoDateToUIDate(personalCircumstanceDetails.endDate))
    }
    this.personalCircumstanceDetails
      .getValueWithLabel('Status verified')
      .should('contain.text', personalCircumstanceDetails.verified ? 'Yes' : 'No')

    cy.get('.govuk-details__text').should('contain.text', personalCircumstanceDetails.notes)
  }
}
