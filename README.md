# Ada's Road

A step-by-step guide to becoming a TK/kindergarten teacher in California,
built for one person. Ottis, her dog, keeps her company.

## How to change it

- **The steps** live in `docs/js/data.js`. Progress is stored against each
  step's `id`, never its wording — so titles, detail, order and the steps
  themselves can all be rewritten without anyone losing a tick.
- **What Ottis says** is the `SAYS` block in the same file. Nicaraguan
  Spanish, voseo. He is only ever reassuring; he never nags and never
  mentions the time of day.
- **Push to `main`** and both phones show an update banner within moments.
  The version number is worked out by the deploy workflow — never edit a
  version by hand.

Bump `VERSION` (e.g. `1.0` to `1.1`) only for a change worth announcing.
The build number after it increments on every deploy automatically.

## Local preview

    python -m http.server 8749 --directory docs

The service worker is deliberately off on localhost, or it serves you
yesterday's code. Add `?sw=1` to test it.

## Sharing between phones

`docs/js/config.js` holds the Firebase settings. Until it's filled in the
app works perfectly on a single phone; it just doesn't share. Those values
are meant to be public — the protection is in the Firestore rules.
