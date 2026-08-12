import { Path } from 'static-path'

export default function createAppointmentPaths<Pattern extends `/${string}`>(basePath: Path<Pattern>) {
  const createPath = basePath.path('create')
  return {
    createAppointment: createPath.path(':crn/:deliusEventNumber'),
    findAPerson: createPath.path('/find-a-person'),
    requirement: createPath.path('/:crn/requirement'),
    formSteps: createPath.path(':page'),
  }
}
