import { Page } from '@playwright/test'
import SearchCourseCompletionsPage from '../pages/courseCompletions/searchCourseCompletionsPage'
import { Team } from '../fixtures/testOptions'

export default async (page: Page, team: Team) => {
  const searchCourseCompletionsPage = new SearchCourseCompletionsPage(
    page,
    'Process Community Campus course completions',
  )

  await searchCourseCompletionsPage.expect.toBeOnThePage()

  await searchCourseCompletionsPage.completeSearchForm(team)
  await searchCourseCompletionsPage.submitForm()
  return searchCourseCompletionsPage
}
