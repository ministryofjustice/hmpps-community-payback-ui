import { Page } from '@playwright/test'
import CheckAppointmentDetailsPage from '../pages/appointments/checkAppointmentDetailsPage'
import ChooseSupervisorPage from '../pages/appointments/chooseSupervisorPage'

export default async (page: Page, checkAppointmentDetailsPage: CheckAppointmentDetailsPage) => {
  const chooseSupervisorPage = new ChooseSupervisorPage(page)
  await checkAppointmentDetailsPage.continue()
  await chooseSupervisorPage.expect.toBeOnThePage()

  return chooseSupervisorPage
}
