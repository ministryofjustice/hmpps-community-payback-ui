import { Page } from '@playwright/test'
import SessionPage from '../pages/sessionPage'
import CheckAppointmentDetailsPage from '../pages/appointments/checkAppointmentDetailsPage'
import ProjectPage from '../pages/projects/projectPage'

export default async (page: Page, sessionOrProjectPage: SessionPage | ProjectPage, crn: string) => {
  const checkAppointmentDetailsPage = new CheckAppointmentDetailsPage(page)
  await sessionOrProjectPage.clickUpdateAnAppointment(crn)
  await checkAppointmentDetailsPage.expect.toBeOnThePage()

  return checkAppointmentDetailsPage
}
