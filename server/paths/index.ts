import { path } from 'static-path'

const projectsPath = path('/projects')
const sessionsPath = path('/sessions')
const courseCompletionsPath = path('/course-completions')
const courseCompletionsShowPath = courseCompletionsPath.path(':id')
const appointmentsPath = path('/appointments')
const projectAppointmentsPath = appointmentsPath.path(':projectCode')
const appointmentPath = projectAppointmentsPath.path(':appointmentId')
const projectsIndividualPlacementsPath = projectsPath.path('individual-placements')

const travelTimeTaskPath = appointmentPath.path('travel-time/:taskId')
const singleSessionPath = sessionsPath.path(':projectCode').path(':date')

const paths = {
  error: path('/error'),
  data: {
    teams: path('/data/regions/:provider/teams'),
  },
  projects: {
    index: projectsIndividualPlacementsPath,
    filter: projectsIndividualPlacementsPath.path('filter'),
    show: projectsPath.path(':projectCode'),
  },
  sessions: {
    index: sessionsPath,
    search: sessionsPath.path('search'),
    show: singleSessionPath,
    update: singleSessionPath.path('update/:page'),
  },
  courseCompletions: {
    index: courseCompletionsPath,
    show: courseCompletionsShowPath,
    search: courseCompletionsPath.path('search'),
    process: courseCompletionsShowPath.path(':page'),
    createAppointment: courseCompletionsShowPath.path('create-new-appointment'),
    unableToCreditTime: courseCompletionsShowPath.path('unable-to-credit-time'),
  },
  appointments: {
    create: projectAppointmentsPath.path('create/:page'),
    update: appointmentPath.path(':page'),
    travelTime: {
      index: appointmentsPath.path('attended'),
      filter: appointmentsPath.path('attended').path('filter'),
      update: travelTimeTaskPath,
      complete: travelTimeTaskPath.path('complete'),
    },
  },
  people: {
    session: {
      find: singleSessionPath.path('/find-a-person'),
    },
  },
}

export default paths
