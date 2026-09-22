import paths from '../../../paths'
import { buildOtherEtePath } from './pathMap'

describe('buildOtherEtePath', () => {
  it('builds a path for the given page without a form id', () => {
    const result = buildOtherEtePath('region')

    expect(result).toEqual(paths.appointments.otherEte({ page: 'region' }))
  })

  it('builds a path for the given page with a form id as a query param', () => {
    const result = buildOtherEtePath('project', 'form-1')

    expect(result).toEqual(`${paths.appointments.otherEte({ page: 'project' })}?form=form-1`)
  })
})
