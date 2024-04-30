import { expect, test } from '@playwright/test';
// we can't create tests asynchronously, thus using the sync-fetch lib
import fetch from 'sync-fetch';

// URL where Ladle is served
const url = 'http://localhost:61000';

test.describe.configure({ mode: 'parallel', retries: 2, timeout: 30000 });

// fetch Ladle's meta file
// https://ladle.dev/docs/meta
const stories = fetch(`${url}/meta.json`).json().stories;

// iterate through stories
// biome-ignore lint/complexity/noForEach: <explanation>
Object.keys(stories).forEach((storyKey) => {
  // create a test for each story
  test(`${storyKey} - compare snapshots`, async ({ page }, testInfo) => {
    // Remove the platform suffix from the snapshot name
    testInfo.snapshotSuffix = ''; // by default is `process.platform`

    // navigate to the story
    await page.goto(`${url}/?story=${storyKey}&mode=preview`);

    // stories are code-splitted, wait for them to be loaded
    await page.waitForSelector('[data-storyloaded]');

    // Wait for the fonts & external assets to be loaded
    await page.waitForLoadState('networkidle');

    // take a screenshot and compare it with the baseline
    await expect(page).toHaveScreenshot(`${storyKey}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });
});
