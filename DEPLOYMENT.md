# Final deployment — moamenhamdanportfolio

## Verified in this review

- Automated component and utility tests, ESLint, and a production Vite build.
- Production-preview browser checks against existing public Firestore data: initial loading screen, homepage content, mobile navigation at 390 × 844, and a direct project route.
- Firebase deployment dry run: Firestore rules compile successfully; Firestore and Hosting validation completes.
- Pull request: https://github.com/MoamenHamdan/Portofolio/pull/3

This is not a claim that every possible device or failure mode has been tested. Admin login/save and new comment/contact writes still need an authenticated or post-deployment smoke test. No production records were created during verification. Security rules were compiled, but not tested in an emulator (Java is not installed locally).

## Publish the reviewed version

1. Open PR #3, review it, and merge it into `main`. Do not use the older `codex/content-loading-mobile-fixes` branch; it contains a different historical version.
2. In a terminal, run:

```sh
cd /home/moamen-hamdan/Documents/ChatGPT/coding/Portofolio
git switch main
git pull --ff-only origin main
npm ci
npm test
npm run lint
npm run build
firebase login
firebase deploy --project moamenhamdanportfolio --only firestore,hosting
```

Stop if any command fails. If Firebase already has a valid login, `firebase login` will report it. Use `firebase login --reauth` only if authentication has expired. The explicit project flag avoids deploying to the wrong Firebase project.

The existing `.env.local` must remain available when building. It is intentionally not committed. A fresh checkout needs the Firebase web-app values listed in README.md. Do not run `firebase init`; the repository already contains the required configuration.

Deploy **both** Firestore and Hosting. Hosting alone leaves the old rules, which can reject the new embedded comment avatars. The command deploys rules and index configuration; it does not replace your existing portfolio documents. It does not provision Cloud Storage or deploy Cloud Functions. GitHub merging by itself is not verified as an automatic deployment mechanism for this repository.

Firebase CLI reference: https://firebase.google.com/docs/cli

## Confirm the live result

Open https://moamenhamdanportfolio.web.app in a private/incognito window:

- The loading screen appears and then the current profile is shown.
- At mobile width, open the menu and select Portfolio; the menu closes and scrolling works.
- Open a project, then reload that project URL directly.
- Verify certificates, skills, blog posts, testimonials, and existing comments.
- Sign in at `/admin`, edit one small field, save it, and confirm the public page shows the change. Restore the field if it was only a test.
- Post a clearly identified test comment with a small JPEG/PNG/WebP photo, and confirm it renders. Check contact-form delivery in the admin inbox if you use that form.

For failures, check the browser console and Firebase deployment output. If avatar writes are denied, confirm the new Firestore rules were deployed. If content quota is exhausted, wait for the quota reset or reduce usage; do not enable billing just to finish the deployment.

## Keep it on the free plan

Confirm **Spark** in Firebase Console → Usage and billing. The app does not require Blaze, but code cannot change or guarantee your billing-plan settings. Firestore and Hosting have free quotas. Existing URLs pointing to old Storage buckets still rely on those buckets: re-upload those images through the new admin controls if needed. Do not delete any old bucket until its images are no longer referenced.

## Recovery

Firebase Hosting can roll back to a prior release from its release history. Hosting rollback does not roll back Firestore rules or indexes. If needed, redeploy rules/index configuration from the corresponding known-good Git commit. Keep the prior Git commits and `.env.local` available.

Known non-blocking build notices: the main JavaScript chunk exceeds Vite's 500 kB warning threshold, and the Browserslist data is old. The build passes; the loading screen covers startup, but it does not eliminate download time.
