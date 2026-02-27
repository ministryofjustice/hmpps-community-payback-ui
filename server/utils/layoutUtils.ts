import { LinkItem } from '../@types/user-defined'

export const staticFooterLinks = [
  {
    href: '/cookies',
    text: 'Cookies policy',
  },
]

export default class LayoutUtils {
  static getFooterItems(footerLinks: LinkItem[] = []): LinkItem[] {
    return [...footerLinks, ...staticFooterLinks]
  }
}
