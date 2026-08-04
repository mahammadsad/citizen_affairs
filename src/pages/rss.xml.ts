import { createLocalizedFeed } from '@lib/feed';

// createLocalizedFeed delegates to getLocalizedArticles, whose isPublicWorkflow
// gate excludes withdrawn and other non-public editorial records.
export async function GET() {
  return createLocalizedFeed('en');
}
