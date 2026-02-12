import { Page } from '@playwright/test'
import SessionPage from '../pages/sessionPage'
import CheckProjectDetailsPage from '../pages/appointments/checkProjectDetailsPage'
import ProjectPage from '../pages/projects/projectPage'

export default async (page: Page, sessionOrProjectPage: SessionPage | ProjectPage, crn: string) => {
  const checkProjectDetailsPage = new CheckProjectDetailsPage(page)
  await sessionOrProjectPage.clickUpdateAnAppointment(crn)
  await checkProjectDetailsPage.expect.toBeOnThePage()

  return checkProjectDetailsPage
}
