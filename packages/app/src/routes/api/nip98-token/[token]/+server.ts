import { getTokenByTokenValue } from '$lib/server/db/nip98Tokens';

import type { NIP98ValidationResult } from '../../../../types.ts';
import type { RequestHandler } from './$types.d.ts';




/**
 * 
 * This endpoint is called by the nakama gameserver when users log in using custom auth.
 * Here we the nip-98 token that the backend sends us (which the client sent to the backend during POST `/api/nip98-token`)
 * We query the db and see if the token has a related npub.
 * If there is a related npub, the auth request is considered valid.
 * If valid, we return true and the backend completes the auth request.
 * 
 * @see https://heroiclabs.com/docs/nakama/concepts/authentication/#custom
 */
export const GET: RequestHandler = async ({ request, params }) => {
    // 0. Reject requests that don't contain IPC_SECRET auth header
    const auth = request.headers.get('Authorization');
    if (!auth) {
        return new Response('Authorization header is missing.');
    }
    const authToken = auth?.split(' ').at(1);
    console.log(`auth:${auth} authToken=${authToken}`);
    if (!authToken) {
        return new Response('Authorization token is missing. (Expecting IPC_SECRET)', { status: 403 });
    } else if (authToken !== process.env.IPC_SECRET) {
        return new Response('Unauthorized authentication token', { status: 403 });
    }
    
    // 0.5. Get NIP98 token from request
    const nip98TokenValue = params.token;
    if (!nip98TokenValue) {
        return new Response('Token querystring was missing', { status: 401 });
    }

    // 1. Lookup the token to find the related npub
    const nip98Tokens = await getTokenByTokenValue(nip98TokenValue);

    // 2. If there is no related npub, return an error response
    if (!nip98Tokens || nip98Tokens.length === 0) {
        return new Response('A matching NIP98 token was not found in the database.', { status: 404 });
    }

    // Get the most recent valid matching NIP98 token
    const mostRecentMatchingNip98Token = nip98Tokens[nip98Tokens.length - 1]; // Assuming tokens are sorted by `createdAt`

    console.log('mostRecentMatchingNip98Token', mostRecentMatchingNip98Token);

    const payload: NIP98ValidationResult = {
        message: "This NIP-98 token is valid.",
        nostrPubkey: mostRecentMatchingNip98Token.nostrPubkey,
        valid: true
    };

    return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } });
};