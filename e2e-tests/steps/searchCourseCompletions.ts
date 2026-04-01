import { Page } from '@playwright/test'
import HomePage from '../pages/homePage'
import SearchCourseCompletionsPage from '../pages/courseCompletions/searchCourseCompletionsPage'

export default async (page: Page, homePage: HomePage) => {
  const searchCourseCompletionsPage = new SearchCourseCompletionsPage(
    page,
    'Process Community Campus course completions',
  )

  await homePage.courseCompletionsLink.click()
  await searchCourseCompletionsPage.expect.toBeOnThePage()

  await searchCourseCompletionsPage.completeSearchForm()
  await searchCourseCompletionsPage.submitForm()
  return searchCourseCompletionsPage
}
