import { Page } from '@playwright/test'
import PersonOnProbation from '../delius/personOnProbation'
import HomePage from '../pages/homePage'
import FindAPersonPage from '../pages/findAPersonPage'
import CheckAppointmentDetailsPage from '../pages/appointments/checkAppointmentDetailsPage'
import PersonAppointmentsPage from '../pages/people.ts/personAppointmentsPage'

export default async (
  page: Page,
  date: Date,
  personOnProbation: PersonOnProbation,
): Promise<CheckAppointmentDetailsPage> => {
  const homePage = new HomePage(page)
  await homePage.visit()

  await homePage.findAPersonLinkLocator.click()

  const findAPersonPage = new FindAPersonPage(page)
  await findAPersonPage.expect.toBeOnThePage()
  await findAPersonPage.search.enterSearchTerm(personOnProbation.crn)
  await findAPersonPage.search.submitForm()
  await findAPersonPage.people.clickPersonLink(personOnProbation.crn)

  const personAppointmentsPage = new PersonAppointmentsPage(page, personOnProbation.getFullName())
  await personAppointmentsPage.expect.toBeOnThePage()
  await personAppointmentsPage.appointments.expect.toHaveItems()
  await personAppointmentsPage.appointments.clickAppointmentLinkWithDate(date)

  const appointmentDetailsPage = new CheckAppointmentDetailsPage(page)
  await appointmentDetailsPage.expect.toBeOnThePage()
  return appointmentDetailsPage
}
