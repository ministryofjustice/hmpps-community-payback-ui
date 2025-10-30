import { path } from 'static-path'

const adminUiPath = path('/admin')
const appointmentsPath = adminUiPath.path('/appointments')
const singleAppointmentPath = appointmentsPath.path(':appointmentId')
const formsPath = path('/common/forms')
const providersPath = adminUiPath.path('/providers')
const projectsPath = adminUiPath.path('/projects')
const referenceDataPath = path('/common/references')

const teamsPath = providersPath.path(':providerCode/teams')

export default {
  appointments: {
    singleAppointment: singleAppointmentPath,
    outcome: singleAppointmentPath.path('/outcome'),
  },
  forms: formsPath.path(':type/:id'),
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
    enforcementActions: referenceDataPath.path('enforcement-actions'),
    contactOutcomes: referenceDataPath.path('contact-outcomes'),
  },
}
