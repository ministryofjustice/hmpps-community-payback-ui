import { path } from 'static-path'

const projectsPath = path('/projects')
const sessionsPath = path('/sessions')
const appointmentsPath = path('/appointments')
const appointmentPath = appointmentsPath.path(':projectCode').path(':appointmentId')

const paths = {
  projects: {
    show: projectsPath.path(':projectCode'),
  },
  sessions: {
    index: sessionsPath,
    search: sessionsPath.path('search'),
    show: sessionsPath.path(':projectCode').path(':date'),
  },
  appointments: {
    update: appointmentPath.path('update'),
    projectDetails: appointmentPath.path('project-details'),
    attendanceOutcome: appointmentPath.path('attendance-outcome'),
    logHours: appointmentPath.path('log-hours'),
    logCompliance: appointmentPath.path('log-compliance'),
    confirm: appointmentPath.path('confirm-details'),
  },
}

export default paths
