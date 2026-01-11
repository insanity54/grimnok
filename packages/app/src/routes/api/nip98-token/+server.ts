import type { RequestHandler } from './$types';
import { validateEvent, type NostrEvent } from 'nostr-tools';
import { createNewToken } from '$lib/server/db/nip98Tokens';
import { generateRandomHex } from '$lib/server/db/utils';

function getEventFromEventHex(hex: string): NostrEvent {
	if (!hex) throw new Error('hex string arg0 was missing.');
	if (hex === '') throw new Error('hex string was empty.');
    try {
        // Decode the hex string to a Base64 string
        const jsonString = Buffer.from(hex, 'base64').toString();

		// console.log('jsonString:', jsonString, 'hex:', hex);

        // Parse the JSON string
        const json = JSON.parse(jsonString);

        return json;
    } catch (error) {
        console.error('Error processing input:', error);
        throw new Error('Invalid input');
    }
}


function validateTags(obj: NostrEvent): boolean {
  const urlToMatch = `${process.env.ORIGIN}/api/nip98-token`;
  let urlTagValid = false;
  let methodTagValid = false;

  // Loop through the tags to find the required values
  for (const [key, value] of obj.tags) {
    if (key === 'u' && value === urlToMatch) {
      urlTagValid = true;
    }
    if (key === 'method' && value === 'POST') {
      methodTagValid = true;
    }
  }

  // Return true only if both conditions are met
  return urlTagValid && methodTagValid;
}


/**
 * The user's app calls this endpoint to get an auth token, a requirement for logging into Nakama.
 * 
 * Here the user proves that they control the nsec belonging to the npub they specify.
 * 
 * We use NIP-98
 * @see https://github.com/nostr-protocol/nips/blob/master/98.md
 * 
 * First, the user creates an event of kind 27235. 
 * The client side window.nostr.signEvent() bakes in the message signed with the nsec so authentication is automatically handled here.
 * 
 * ### Example
 *
 *     nak event --kind 27235 --tag u="https://example.com/api/nip98" --tag method="POST"
 * 
 * Next, the server verifies the nostr event.
 * If we have a valid nostr event, the user is who they say they are. We issue them a token.
 * 
 * The user's app will later send the JWT to Nakama
 * 
 * When the user requests it, we generate a NIP-42 event on the server side. The event contains a JWT that we have signed using our secret.
 * The user's app takes the NIP-42 event and signs it using window.nostr.signEvent
 * The user's app uses their nakama client to call client.authenticateCustom(...) with the signed 
 * 
 */
export const POST: RequestHandler = ({ request }) => {

	// get the nostr event from the request

	const auth = request.headers.get('Authorization');
	if (!auth) {
		return new Response('Authorization header was missing. We expected a NIP-98 base64 encoded Nostr event there.', { status: 401 });
	}



	const authParts = auth?.split(' ');
	// console.log('authParts', authParts)

	if (authParts.at(0) !== 'Nostr') {
		return new Response(`Authorization header was missing 'Nostr' from it's value.`, { status: 401 });
	}

	const eventHex = ''+authParts.at(1)
	if (!/(?:[A-Z0-9a-z+/]{4})*/.test(eventHex)) {
		return new Response(`Authorization header was missing a base64 encoded value.`, { status: 401 });
	}


	const event = getEventFromEventHex(eventHex);
	const valid = validateEvent(event);
	
	// console.log('eventHex', eventHex, 'event', event, 'valid?', valid);



	if (!eventHex) {
		return new Response('Nostr event was missing from the Authorization header.', { status: 401 });
	} else if (!valid) {
		return new Response('The Nostr event passed in the Authorization header was invalid.', { status: 403 });
	} else if (!validateTags(event)) {
		return new Response('The Nostr event contained invalid tags');
	} else {
		const event = getEventFromEventHex(eventHex);
		const tokenValue = generateRandomHex(32);
		const pubkey = event.pubkey
		const tokenData = { tokenValue, nostrPubkey: pubkey };
		createNewToken(tokenData);
		const data = {
			message: "Hark, noble sir or gracious madam! Thou art truly deserving of praise. Henceforth, receive ye this NIP-XCVIII token as a token of goodwill!",
			tokenData
		}
		return new Response(JSON.stringify(data));
	}

}
