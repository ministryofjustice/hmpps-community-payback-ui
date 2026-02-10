import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { ProjectTypeDto } from '../../@types/shared'

export default Factory.define<ProjectTypeDto>(() => ({
  group: 'GROUP',
  name: 'Group placement',
  id: faker.string.alpha(8),
  code: faker.string.alpha(8),
}))
