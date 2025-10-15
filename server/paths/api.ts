import { path } from 'static-path'

const appointmentsPath = path('/appointments')
const providersPath = path('/providers')
const projectsPath = path('/projects')
const referenceDataPath = path('/references')

const teamsPath = providersPath.path(':providerCode/teams')

export default {
  appointments: {
    singleAppointment: appointmentsPath.path(':appointmentId'),
  },
  providers: {
    teams: teamsPath,
    supervisors: teamsPath.path(':teamCode/supervisors'),
  },
  projects: {
    sessions: projectsPath.path('session-search'),
    sessionAppointments: projectsPath.path(':projectCode').path('sessions').path(':date'),
  },
  referenceData: {
    projectTypes: referenceDataPath.path('project-types'),
    enforcementActions: referenceDataPath.path('enforce-ment-actions'),
    contactOutcomes: referenceDataPath.path('contact-outcomes'),
  },
}
