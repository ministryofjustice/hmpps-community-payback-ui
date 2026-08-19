import { createMock } from '@golevelup/ts-jest'
import { PagedModelSessionSummaryDto } from '../@types/shared'
import SessionClient from '../data/sessionClient'
import SessionService from './sessionService'
import sessionSummaryFactory from '../testutils/factories/sessionSummaryFactory'
import pagedMetadataFactory from '../testutils/factories/pagedMetadataFactory'
import projectFactory from '../testutils/factories/projectFactory'
import pagedModelAppointmentSummaryFactory from '../testutils/factories/pagedModelAppointmentSummaryFactory'
import ProjectService from './projectService'
import AppointmentService from './appointmentService'

jest.mock('../data/sessionClient')

describe('ProviderService', () => {
  const sessionClient = createMock<SessionClient>()
  const projectService = createMock<ProjectService>()
  const appointmentService = createMock<AppointmentService>()
  let sessionService: SessionService

  beforeEach(() => {
    jest.resetAllMocks()
    sessionService = new SessionService(sessionClient, projectService, appointmentService)
  })

  it('should call getSessions on the api client and return its result', async () => {
    const sessions: PagedModelSessionSummaryDto = {
      content: sessionSummaryFactory.buildList(1),
      page: pagedMetadataFactory.build(),
    }

    sessionClient.getSessions.mockResolvedValue(sessions)

    const result = await sessionService.getSessions({
      username: 'some-username',
      providerCode: 'A1234',
      teamCode: 'XRTC12',
      startDate: '2025-09-01',
      endDate: '2025-09-02',
      sort: ['projectName,asc'],
    })

    expect(sessionClient.getSessions).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      ...sessions,
      page: { ...sessions.page, number: sessions.page.number + 1 },
    })
  })

  it('should call project and appointment services and return merged session data', async () => {
    const project = projectFactory.build()
    const date = '2025-01-01'
    const appointments = pagedModelAppointmentSummaryFactory.build()

    projectService.getProject.mockResolvedValue(project)
    appointmentService.getAppointments.mockResolvedValue(appointments)
    const result = await sessionService.getSession({
      username: 'some-username',
      projectCode: project.projectCode,
      date,
    })

    expect(projectService.getProject).toHaveBeenCalledWith({
      username: 'some-username',
      projectCode: project.projectCode,
    })

    expect(appointmentService.getAppointments).toHaveBeenCalledWith('some-username', {
      projectCodes: [project.projectCode],
      fromDate: date,
      toDate: date,
    })

    expect(result).toEqual({
      ...project,
      date,
      appointmentSummaries: appointments.content,
    })
  })
})
