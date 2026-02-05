import projectSummaryFactory from '../testutils/factories/projectSummaryFactory'
import ProjectIndexPage from './projectIndexPage'

jest.mock('../models/offender')

describe('ProjectIndexPage', () => {
  describe('projectSummaryList', () => {
    it('returns project summaries formatted into table rows', () => {
      const firstProjectSummary = projectSummaryFactory.build({
        location: {
          buildingNumber: '3',
          buildingName: 'Big House',
          streetName: 'Main Road',
          townCity: 'Darlington',
          county: 'Durham',
          postCode: 'DL93 1EK',
        },
      })

      const secondProjectSummary = projectSummaryFactory.build({
        location: {
          buildingNumber: '5',
          buildingName: 'Small Home',
          streetName: 'Side Road',
          townCity: 'Bath',
          county: 'Somerset',
          postCode: 'BA81 1GL',
        },
      })

      const result = ProjectIndexPage.projectSummaryList([firstProjectSummary, secondProjectSummary])

      expect(result).toEqual([
        [
          { text: firstProjectSummary.projectName },
          { text: 'Big House, 3 Main Road, Darlington, Durham, DL93 1EK' },
          { text: firstProjectSummary.numberOfAppointmentsOverdue },
          { text: firstProjectSummary.oldestOverdueAppointmentInDays },
        ],
        [
          { text: secondProjectSummary.projectName },
          { text: 'Small Home, 5 Side Road, Bath, Somerset, BA81 1GL' },
          { text: secondProjectSummary.numberOfAppointmentsOverdue },
          { text: secondProjectSummary.oldestOverdueAppointmentInDays },
        ],
      ])
    })
  })
})
