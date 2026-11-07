/** Public pages the app links to. The pages live in public_docs/ and are published to GitHub Pages with scripts/publish-docs.sh. */
export const PRIVACY_URL = 'https://emirhan-coban.github.io/atls/';

/** The app's App Store page, added to shared text so a result can lead someone to the app. */
export const APP_STORE_URL = 'https://apps.apple.com/app/id6819009608';

/**
 * Invite page for "Passport clash". With the app installed iOS opens the app straight from this https link
 * (universal link, see app.json associatedDomains and src/app/+native-intent.tsx); otherwise the page offers the App Store.
 */
export const INVITE_URL = 'https://emirhan-coban.github.io/atls/c/';
