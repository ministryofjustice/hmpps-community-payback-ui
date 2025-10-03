import TrackProgressPage from './trackProgressPage'

describe('TrackProgressPage', () => {
  it('returns validation errors', () => {
    const page = new TrackProgressPage({})

    expect(page.validationErrors()).toEqual({
      team: { text: 'Choose a team' },
      'startDate-day': { text: 'Include the start date' },
      'endDate-day': { text: 'Include the end date' },
    })
  })
})
