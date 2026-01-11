const guardFunction: (ctx: nkruntime.Context) => void = function (ctx: nkruntime.Context): null {
    return null;
};
// (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, data: nkruntime.AddFriendsRequest)


let authCustomHandler: (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    data: nkruntime.AuthenticateCustomRequest,
    
) => void = function (
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    data: nkruntime.AuthenticateCustomRequest
): nkruntime.AuthenticateCustomRequest | void {


        const token = data.account?.id; // The client is expected to send the nip98 token as the customId
        logger.info(`>> Handling custom auth for account.id=${token} (that's actually a nip98 token)`);
      

        
        const ORIGIN = ctx.env["ORIGIN"];
        if (!ORIGIN) throw new Error('ORIGIN env var was falsy');

        const IPC_SECRET = ctx.env['IPC_SECRET'];
        if (!IPC_SECRET) throw new Error('IPC_SECRET env var was falsy');


        const url = `${ORIGIN}/api/nip98-token/${token}`;
        const headers = {
            'Authorization': `Bearer ${IPC_SECRET}`,
            'Accept': 'application/json'
        }

        logger.info('Time to lookup the nostr pubkey using the nip98 token');
       	let response = nk.httpRequest(url, 'get', headers);
        if (response.code !== 200) {
            logger.error('failed the HTTP request to get the nip98 token');
        }

        const nip98TokenData = JSON.parse(response.body) as {
            message: string,
            nostrPubkey: string,
            valid: boolean
        };
        logger.info(`nip98TokenData ${JSON.stringify(nip98TokenData)}`);
        
        const userId = nip98TokenData.nostrPubkey;
        logger.info(`userId=${userId}`);
        
        const account = {
            id: userId,
            vars: {}
        }

        let result = {
            account,
            username: '@todo_fuck',
        } as nkruntime.AuthenticateCustomRequest;

        return result;


    }

let InitModule: nkruntime.InitModule =
    function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
        initializer.registerBeforeAuthenticateApple(guardFunction);
        initializer.registerBeforeAuthenticateCustom(authCustomHandler);
        initializer.registerBeforeAuthenticateDevice(guardFunction);
        initializer.registerBeforeAuthenticateEmail(guardFunction);
        initializer.registerBeforeAuthenticateFacebook(guardFunction);
        initializer.registerBeforeAuthenticateFacebookInstantGame(guardFunction);
        initializer.registerBeforeAuthenticateGameCenter(guardFunction);
        initializer.registerBeforeAuthenticateGoogle(guardFunction);
        initializer.registerBeforeAuthenticateSteam(guardFunction);
    }




/**
let rtBeforeChannelMessageSend: nkruntime.RtBeforeHookFunction<nkruntime.Envelope> = function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, envelope: nkruntime.Envelope): nkruntime.Envelope {
    let e = envelope as nkruntime.EnvelopeChannelMessageSend;
    if (e == null) {
        return e;
    }

    if (e.channelMessageSend.content.indexOf('Bad Word') !== -1) {
        // Alternatively, to sanitize instead of reject:
        //e.channelMessageSend.content = e.channelMessageSend.content.replace('Bad Word', '****');

        // Reject the message send.
        throw new Error("Profanity detected");
    }

    return e;
}

initializer.registerRtBefore("ChannelMessageSend", rtBeforeChannelMessageSend);
 */