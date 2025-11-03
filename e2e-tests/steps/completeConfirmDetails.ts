import { Page } from '@playwright/test'
import ConfirmPage from '../pages/appointments/confirmPage'
import SessionPage from '../pages/sessionPage'

export default async (page: Page, confirmPage: ConfirmPage) => {
  await confirmPage.expect.toShowCompletedAnswers()
  await confirmPage.confirmButtonLocator.click()

  const sessionPage = new SessionPage(page, 'Cleaning Streets')
  await sessionPage.expect.toBeOnThePage()
}
