import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { CourseCompletionRecommendationDto } from '../../@types/shared'

export default Factory.define<CourseCompletionRecommendationDto>(() => ({
  crn: faker.string.alphanumeric(8),
}))
