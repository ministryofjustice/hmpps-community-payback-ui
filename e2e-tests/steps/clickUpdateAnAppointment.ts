import { Page } from '@playwright/test'
import SessionPage from '../pages/sessionPage'
import CheckProjectDetailsPage from '../pages/appointments/checkProjectDetailsPage'

export default async (page: Page, sessionPage: SessionPage) => {
  const checkProjectDetailsPage = new CheckProjectDetailsPage(page)
  await sessionPage.clickUpdateAnAppointment()
  await checkProjectDetailsPage.expect.toBeOnThePage()

  return checkProjectDetailsPage
}
