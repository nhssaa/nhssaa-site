# nhssaa-site

Static copy of nhssaa.org, deployed to Vercel (project `nhssaa-wix-copy`, scope `nhssaa`). Becomes the live site when DNS switches from Wix (needs Ash's explicit go).

## Deploy
1. Install Vercel CLI, log in as the NHSSAA admin account.
2. From this folder: `vercel deploy --prod --scope nhssaa`

## Mailing list
Desktop + mobile signup forms post to Google Form "NHSSAA Mailing List Signup" (entries: first 175024750, last 688089351, email 1034816932, message 2081737754). Responses land in the admin@ Google Sheet. No subscriber data in this repo.

## Photos
Local copies in `assets/media/` (original Wix filenames). To swap or add a photo: drop the file there and update the page's <img> src. Grid tiles intentionally match Wix cropping; hero + mobile gallery use object-fit:contain on a dark stage.

## Rules
- No student personal data (names beyond published chapter name+school, emails, phones).
- New pages ship unlisted + noindex until Ash approves the copy.
- Never change DNS or touch the live Wix site from this repo.
