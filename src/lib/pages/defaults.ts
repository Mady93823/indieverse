// The site's fixed set of pages. Each starts from a template the admin reviews and publishes.
// In titles and text, {site} becomes the site name, {email} the contact email and {url} the site address.

export const PAGE_SLUGS = ["about", "contact", "privacy", "terms", "copyright"] as const;

export type PageSlug = (typeof PAGE_SLUGS)[number];

export function isPageSlug(value: string): value is PageSlug {
  return (PAGE_SLUGS as readonly string[]).includes(value);
}

export const PAGE_TEMPLATES: Record<PageSlug, { title: string; purpose: string; body: string }> = {
  about: {
    title: "About {site}",
    purpose: "Who runs the site and why. Google and AdSense reviewers look for this.",
    body: `## What is {site}?
{site} is a home for the lyrics of Tamil independent and I-pop songs. Every song can be read in Tamil script (தமிழ்) and in English letters, so you can sing along whichever way you read.

## Why we started
Independent Tamil artists release wonderful music, but their lyrics are hard to find. We publish them carefully, credit every singer, composer and lyricist, and link to the artist's own channels so you can listen there.

## Get in touch
Are you an artist who'd like your lyrics here, or did you spot a mistake? Write to us at {email}.`,
  },
  contact: {
    title: "Contact",
    purpose: "How readers and artists reach you. Required before applying for AdSense.",
    body: `## Write to us
Email: {email}

We read every message and usually reply within a few days.

## Artists and labels
Want your song's lyrics on {site}, or need a correction or removal? Send us the song name and a link to it, and we'll take care of it.`,
  },
  privacy: {
    title: "Privacy policy",
    purpose: "Required by Google AdSense. The advertising section covers Google's required wording.",
    body: `## What we collect
{site} doesn't ask you to sign up, and we don't collect your name or email while you read lyrics.
- We count how many times each song page is read, to show popular songs. The count isn't linked to you.
- Your browser remembers your lyrics language and text size on your own device. This information never leaves your device.
- If you email us, we use your address only to reply.
- If you join our newsletter, we keep your email address only to send it. Ask us at {email} and we'll remove it.

## Advertising
We may show ads from Google AdSense to keep {site} free.
- Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites.
- Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.
- You can opt out of personalised advertising in Google's Ads Settings: https://www.google.com/settings/ads
- How Google uses information from sites that use its services: https://policies.google.com/technologies/partner-sites

Visitors in the European Economic Area, the UK and Switzerland are asked for consent before personalised ads are shown.

## Questions
Write to {email} with any question about this policy.`,
  },
  terms: {
    title: "Terms of use",
    purpose: "The basic rules for using the site.",
    body: `## Using {site}
You're welcome to read the lyrics on {site} and share links to them for personal, non-commercial use.

## Copyright
Lyrics belong to their writers, composers and publishers, and we credit them on every song page. Please don't copy lyrics from {site} to republish them elsewhere.

## Accuracy
We check lyrics carefully, but mistakes happen. If you find one, tell us at {email}.

## Other websites
Song pages link to YouTube, Spotify and artists' own pages. We aren't responsible for the content of those sites.

## Changes
We may update these terms from time to time. The latest version is always on this page.`,
  },
  copyright: {
    title: "Copyright & removal requests",
    purpose: "Tells rights holders how to ask for a correction or removal. Important for a lyrics site.",
    body: `## Lyrics on {site}
We publish lyrics with credit to their lyricists, composers and singers, and we work with independent artists to share their songs.

## Asking for a correction or removal
If you own the rights to a song on {site} and want its lyrics changed or removed, email {email} with:
- the link to the song page,
- your name and how you're connected to the song (lyricist, composer, label…),
- what you'd like us to do.

We act on valid requests as quickly as we can, usually within two working days.`,
  },
};

/** Replaces {site}, {email} and {url} with the current settings. */
export function fillTokens(text: string, values: { site: string; email: string; url: string }) {
  return text
    .replaceAll("{site}", values.site)
    .replaceAll("{email}", values.email || "the email address on our Contact page")
    .replaceAll("{url}", values.url);
}
