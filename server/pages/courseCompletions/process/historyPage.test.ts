import paths from '../../../paths'
import appointmentSummaryFactory from '../../../testutils/factories/appointmentSummaryFactory'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import AppointmentUtils from '../../../utils/appointmentUtils'
import { pathWithQuery } from '../../../utils/utils'
import HistoryPage from './historyPage'
import pathMap from './pathMap'

describe('HistoryPage', () => {
  const pageName = 'history'
  const nextPath = pathMap[pageName].next
  const backPath = pathMap[pageName].back
  let page: HistoryPage
  beforeEach(() => {
    jest.resetAllMocks()
    page = new HistoryPage()
  })

  describe('nextPath', () => {
    it('returns the next page path', () => {
      const id = '1'
      const result = page.nextPath(id, undefined)
      expect(result).toBe(paths.courseCompletions.process({ page: nextPath, id }))
    })

    it('includes form parameter if provided', () => {
      const id = '1'
      const form = '23'
      const result = page.nextPath(id, form)
      expect(result).toBe(pathWithQuery(paths.courseCompletions.process({ page: nextPath, id }), { form }))
    })
  })

  describe('viewData', () => {
    it('returns view data for appointments', () => {
      const courseCompletion = courseCompletionFactory.build({ firstName: 'Mary', lastName: 'Smith' })
      const expectedPerson = 'Mary Smith'

      const result = page.viewData(courseCompletion)

      expect(result).toEqual({
        communityCampusPerson: { name: expectedPerson },
        backLink: paths.courseCompletions.process({ page: backPath, id: courseCompletion.id }),
        updatePath: paths.courseCompletions.process({ page: pageName, id: courseCompletion.id }),
        courseName: courseCompletion.courseName,
        unableToCreditTimePath: pathWithQuery(paths.courseCompletions.unableToCreditTime({ id: courseCompletion.id }), {
          backPage: 'history',
        }),
      })
    })

    it('includes paths with form id if provided', () => {
      const courseCompletion = courseCompletionFactory.build({ firstName: 'Mary', lastName: 'Smith' })
      const form = '23'

      const result = page.viewData(courseCompletion, form)

      expect(result.backLink).toEqual(
        pathWithQuery(paths.courseCompletions.process({ page: backPath, id: courseCompletion.id }), { form }),
      )

      expect(result.updatePath).toEqual(
        pathWithQuery(paths.courseCompletions.process({ page: pageName, id: courseCompletion.id }), { form }),
      )
    })
  })

  describe('stepViewData', () => {
    it('returns formatted appointments', () => {
      const appointments = appointmentSummaryFactory.buildList(2)
      const appointmentCards = [
        {
          title: '12 January 2026',
          rows: [
            { key: { text: 'Time credited' }, value: { text: '1 hour 30 minutes' } },
            { key: { text: 'Outcome' }, value: { text: 'Attended - complied' } },
          ],
        },
        {
          title: '13 January 2026',
          rows: [
            { key: { text: 'Time credited' }, value: { text: '30 minutes' } },
            { key: { text: 'Outcome' }, value: { text: 'Attended - complied' } },
          ],
        },
      ]

      jest
        .spyOn(AppointmentUtils, 'appointmentCard')
        .mockReturnValueOnce(appointmentCards[0])
        .mockReturnValueOnce(appointmentCards[1])

      const result = page.stepViewData(appointments)

      expect(result).toEqual({ appointmentCards })
    })
  })
})
