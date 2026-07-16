import { Request, Response, NextFunction } from 'express'
import config from '../config'

type FeatureFlagConfigParams = keyof typeof config.featureFlags

export default function featureFlagMiddleware(featureFlag: FeatureFlagConfigParams) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!config.featureFlags[featureFlag]) {
      return res.redirect('/')
    }

    return next()
  }
}
