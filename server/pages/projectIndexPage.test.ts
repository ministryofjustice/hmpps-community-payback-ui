import pagedModelProjectOutcomeSummaryFactory from '../testutils/factories/pagedModelProjectOutcomeSummaryFactory'
import projectOutcomeSummaryFactory from '../testutils/factories/projectOutcomeSummaryFactory'
import ProjectIndexPage from './projectIndexPage'
import * as ErrorUtils from '../utils/errorUtils'
import HtmlUtils from '../utils/htmlUtils'

jest.mock('../models/offender')

describe('ProjectIndexPage', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  describe('projectSummaryList', () => {
    it('returns project summaries formatted into table rows', () => {
      const htmlAnchorSpy = jest.spyOn(HtmlUtils, 'getAnchor')
      const linkHtml = '<a>link</a>'
      htmlAnchorSpy.mockReturnValue(linkHtml)

      const firstProjectSummary = projectOutcomeSummaryFactory.build({
        location: {
          buildingNumber: '3',
          buildingName: 'Big House',
          streetName: 'Main Road',
          townCity: 'Darlington',
          county: 'Durham',
          postCode: 'DL93 1EK',
        },
      })

      const secondProjectSummary = projectOutcomeSummaryFactory.build({
        location: {
          buildingNumber: '5',
          buildingName: 'Small Home',
          streetName: 'Side Road',
          townCity: 'Bath',
          county: 'Somerset',
          postCode: 'BA81 1GL',
        },
      })

      const pagedResponse = pagedModelProjectOutcomeSummaryFactory.build({
        content: [firstProjectSummary, secondProjectSummary],
      })

      const result = ProjectIndexPage.projectSummaryList(pagedResponse, {})

      expect(result).toEqual([
        [
          { html: linkHtml },
          { text: 'Big House, 3 Main Road, Darlington, Durham, DL93 1EK' },
          { text: firstProjectSummary.numberOfAppointmentsOverdue },
          { text: firstProjectSummary.oldestOverdueAppointmentInDays },
        ],
        [
          { html: linkHtml },
          { text: 'Small Home, 5 Side Road, Bath, Somerset, BA81 1GL' },
          { text: secondProjectSummary.numberOfAppointmentsOverdue },
          { text: secondProjectSummary.oldestOverdueAppointmentInDays },
        ],
      ])
    })

    it('returns an empty list if no project summaries exist', () => {
      const pagedResponse = pagedModelProjectOutcomeSummaryFactory.build({
        content: [],
      })

      const result = ProjectIndexPage.projectSummaryList(pagedResponse, {})

      expect(result).toEqual([])
    })
  })

  describe('validationErrors', () => {
    const errorSummary = [
      { text: 'Error 1', href: '#1', attributes: {} },
      { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
    ]

    it('has errors if no region and team', () => {
      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue(errorSummary)
      const expectedErrors = {
        provider: { text: 'Choose a region' },
        team: { text: 'Choose a team' },
      }
      const result = ProjectIndexPage.validationErrors({})

      expect(result.hasErrors).toBe(true)
      expect(result.errors).toEqual(expectedErrors)

      expect(result.errorSummary).toEqual(errorSummary)
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith(expectedErrors)
    })

    it('has no errors if region and team are provided', () => {
      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue([])
      const result = ProjectIndexPage.validationErrors({ team: '1', provider: '2' })

      expect(result.hasErrors).toBe(false)
      expect(result.errors).toEqual({})
      expect(result.errorSummary).toEqual([])
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith({})
    })
  })
})
