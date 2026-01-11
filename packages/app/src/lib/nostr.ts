
// We import `window.nostr.js` in App.svelte. Order is important

import { finalizeEvent, generateSecretKey, getPublicKey, verifyEvent,  } from 'nostr-tools/pure'
import { type NIP98Token } from '../types';


/**
 * @see https://github.com/nostr-protocol/nips/blob/master/98.md
 */
export async function createNip98Token() {

    console.log('Creating NIP98 token.');

    // const sk = generateSecretKey();


    let eventTemplate = {
        kind: 27235,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ['u', `${window.location.origin}/api/nip98-token`],
            ['method', 'POST']
        ],
        content: 'Nostr identity authentication.',
    };

    let event = await window.nostr.signEvent(eventTemplate);

    let isGood = verifyEvent(event);
    console.log(`event isGood:${isGood}`);

    const res = await fetch('/api/nip98-token', {
        method: 'POST',
        headers: {
            'Authorization': `Nostr ${btoa(JSON.stringify(event))}`
        },
        body: JSON.stringify(event) // this is redundant. unecessary. @todo
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(body);
    } 

    const json = await res.json() as NIP98Token;
    // console.log(json);

    return json
}
