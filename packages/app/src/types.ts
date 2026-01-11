export interface NIP98Token {
	message: string,
    tokenData: {
        tokenValue: string,
        nostrPubkey: string,
    }
}


export interface NIP98ValidationResult {
    message: string,
    valid: boolean,
    nostrPubkey: string,
}