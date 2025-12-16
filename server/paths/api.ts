import { path } from 'static-path'

const adminUiPath = path('/admin')
const formsPath = path('/common/forms')
const providersPath = adminUiPath.path('/providers')
const projectsPath = adminUiPath.path('/projects')
const appointmentsPath = projectsPath.path(':projectCode/appointments')
const referenceDataPath = path('/common/references')

const teamsPath = providersPath.path(':providerCode/teams')

export default {
  appointments: {
    singleAppointment: appointmentsPath.path(':appointmentId'),
    outcome: appointmentsPath.path(':appointmentId/outcome'),
  },
  forms: formsPath.path(':type/:id'),
  providers: {
    teams: teamsPath,
    supervisors: teamsPath.path(':teamCode/supervisors'),
  },
  projects: {
    sessions: teamsPath.path(':teamCode/sessions'),
    sessionAppointments: projectsPath.path(':projectCode').path('sessions').path(':date'),
  },
  referenceData: {
    projectTypes: referenceDataPath.path('project-types'),
    contactOutcomes: referenceDataPath.path('contact-outcomes'),
  },
}
