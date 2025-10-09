import test from '../test'
import signIn from '../steps/signIn'
import searchForASession from '../steps/searchForASession'
import selectASession from '../steps/selectASession'

test('Search for a project session', async ({ page, deliusUser }) => {
  const homePage = await signIn(page, deliusUser)
  const trackProgressPage = await searchForASession(page, homePage)

  await trackProgressPage.expect.toSeeResults()

  const sessionPage = await selectASession(page, trackProgressPage)

  await sessionPage.expect.toSeeAppointments()
})
