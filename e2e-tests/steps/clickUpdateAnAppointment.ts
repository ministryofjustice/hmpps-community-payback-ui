import { Page } from '@playwright/test'
import SessionPage from '../pages/sessionPage'
import CheckProjectDetailsPage from '../pages/appointments/checkProjectDetailsPage'

export default async (page: Page, sessionPage: SessionPage, crn: string) => {
  const checkProjectDetailsPage = new CheckProjectDetailsPage(page)
  await sessionPage.clickUpdateAnAppointment(crn)
  await checkProjectDetailsPage.expect.toBeOnThePage()

  return checkProjectDetailsPage
}
