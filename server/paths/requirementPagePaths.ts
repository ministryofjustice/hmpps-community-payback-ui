import { Path } from 'static-path'

type CreateAppointmentPaths<
  FindParams extends Record<string, string>,
  RequirementParams extends FindParams,
  CreatePattern extends `/${string}`,
> = {
  findAPerson: (params: FindParams) => string
  requirement: (params: RequirementParams) => string
  createAppointment: Path<CreatePattern>
}

export default function buildRequirementPagePaths<
  FindParams extends Record<string, string>,
  RequirementParams extends FindParams,
  CreatePattern extends `/${string}`,
>(paths: CreateAppointmentPaths<FindParams, RequirementParams, CreatePattern>, params: RequirementParams) {
  return {
    backPath: paths.findAPerson(params),
    updatePath: paths.requirement(params),
    createAppointmentPath: paths.createAppointment,
  }
}
