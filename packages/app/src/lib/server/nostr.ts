import type { NIP98Token } from "../../types";
import { generateRandomHex } from "./db/utils";
import { type NostrEvent } from "nostr-tools";



export function generateNIP98Token(nostrPubkey: NostrEvent["pubkey"]): NIP98Token {
	if (!nostrPubkey) throw new Error('generateNIP98Token arg0 missing.')
	const tokenValue = generateRandomHex(32);
	return {
		message: 'eeeeeeeeeeeeeeeee',
		tokenData: {
			tokenValue,
			nostrPubkey
		}
	}
}
