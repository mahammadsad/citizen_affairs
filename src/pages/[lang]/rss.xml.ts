import type { APIRoute } from 'astro';
import { createLocalizedFeed } from '@lib/feed';
import type { Locale } from '../../i18n';

export function getStaticPaths() {
  return ['bn', 'hi'].map((lang) => ({
    params: { lang },
    props: { locale: lang as Locale },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  return createLocalizedFeed(props.locale as Locale);
};
