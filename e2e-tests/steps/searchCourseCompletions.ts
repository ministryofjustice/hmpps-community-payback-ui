import { Page } from '@playwright/test'
import HomePage from '../pages/homePage'
import SearchCourseCompletionsPage from '../pages/courseCompletions/searchCourseCompletionsPage'

export default async (page: Page, homePage: HomePage, startDate: Date = new Date(), endDate: Date = new Date()) => {
  const searchCourseCompletionsPage = new SearchCourseCompletionsPage(
    page,
    'Process employment, training and education completions',
  )

  await homePage.courseCompletionsLink.click()
  await searchCourseCompletionsPage.expect.toBeOnThePage()

  await searchCourseCompletionsPage.completeSearchForm(startDate, endDate)
  await searchCourseCompletionsPage.submitForm()
  return searchCourseCompletionsPage
}
