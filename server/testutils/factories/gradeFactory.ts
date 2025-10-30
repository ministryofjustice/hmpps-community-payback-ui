import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { GradeDto } from '../../@types/shared'

export default Factory.define<GradeDto>(() => ({
  code: faker.string.sample(10),
  description: faker.word.adverb(),
}))
