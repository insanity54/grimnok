# db

We use this database for PRE-LOGIN account stuff. Basically just Nostr challenge/response handling that requires short-lived state.
Since Nakama uses goja and (probably?) can't import nostr-tools for nostr NIP-98 signature verification, we do that on the svelte side and cache auth tokens.
Our Nakama auth module `packages/server/src/auth.ts` then can do an API request to verify the signature.

Anything related to user accounts should go in a Nakama collection. 

@see https://fullstacksveltekit.com/blog/sveltekit-sqlite-drizzle
@see https://heroiclabs.com/docs/nakama/concepts/storage/collections/#collections 
@see https://github.com/nostr-protocol/nips/blob/master/98.md