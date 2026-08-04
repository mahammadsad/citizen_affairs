import { createLocalizedFeed } from '@lib/feed';

export async function GET() {
  return createLocalizedFeed('en');
}
