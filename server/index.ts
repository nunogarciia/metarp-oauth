import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';

const Rebar = useRebar();

import { AuthEvents } from '../shared/authEvents.js';
import { Account } from '@Shared/types/account.js';
import { useTranslate } from '@Shared/translate.js';
import '../translate/index.js';
const { t } = useTranslate('en');

const loginCallbacks: Array<(player: alt.Player) => void> = [];
const loggedInPlayers: Map<number, string> = new Map<number, string>();
const sessionKey = 'can-authenticate';
const db = Rebar.database.useDatabase();
const botApi = await Rebar.useApi().getAsync('discord-bot');

function setAccount(player: alt.Player, account: Account) {
    Rebar.document.account.useAccountBinder(player).bind(account);
    Rebar.player.useWebview(player).hide('Auth');
    Rebar.player.useNative(player).invoke('triggerScreenblurFadeOut', 1000);
    player.deleteMeta(sessionKey);
    player.dimension = 0;
    player.emit(AuthEvents.toClient.cameraDestroy);
    loggedInPlayers[player.id] = account._id;
    for (let cb of loginCallbacks) {
        cb(player);
    }
}

async function handleRegister(player: alt.Player, discord: string) {
    if (!player.getMeta(sessionKey)) {
        player.kick(t('auth.kick.sessionKey'));
        return;
    }

    let account = await db.get<Account>({ discord }, Rebar.database.CollectionNames.Accounts);
    const webview = Rebar.player.useWebview(player);
    if (account) {
        webview.emit(AuthEvents.fromServer.invalidRegister);
        return;
    }

    const _id = await db.create<Partial<Account>>({ discord }, Rebar.database.CollectionNames.Accounts);
    if (!_id) {
        webview.emit(AuthEvents.fromServer.invalidRegister);
        return;
    }

    account = await db.get<Account>({ _id }, Rebar.database.CollectionNames.Accounts);
    if (!account) {
        webview.emit(AuthEvents.fromServer.invalidRegister);
        return;
    }

    setAccount(player, account);
}

async function handleLogin(player: alt.Player, token: string) {
    if (!player.getMeta(sessionKey)) {
        player.kick(t('auth.kick.sessionKey'));
        return;
    }

    let tempData: {
        id: string,
        username: string,
        avatar: string,
        discriminator: string,
        public_flags: number,
        flags: number,
        banner: null,
        accent_color: number,
        global_name: string,
        avatar_decoration_data: {
          asset: string,
          sku_id: string
        },
        banner_color: string,
        clan: null,
        mfa_enabled: boolean,
        locale: string,
        premium_type: number
    } = null;
    
    const webview = Rebar.player.useWebview(player);

    try {
        // Validate the token with a GET request to the Discord api
        const request = await fetch('https://discordapp.com/api/users/@me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${token}`
                }
            });

        // Check if the request was successful and if the neccessary properties are included
        if (!request.ok) {
            webview.emit(AuthEvents.fromServer.invalidLogin);
        }

        tempData = await request.json();
        if (!tempData.id || !tempData.username) {
            player.kick('Authorization failed');
            return;
        }

        if (alt.getServerConfig().debug) {
            alt.log(`Id: ${tempData.id}`);
            alt.log(`Name: ${tempData.username}#${tempData.discriminator}`);
        }
    } catch (err) {
        player.kick('Authorization failed');
    }

    const account = await db.get<Account>({ discord: tempData.id }, Rebar.database.CollectionNames.Accounts);
    if (!account) {
        handleRegister(player, tempData.id)
        return;
    }

    if (Object.values(loggedInPlayers).includes(account._id)){
        player.kick(t('auth.kick.alreadyLoggedIn'));
        return;
    }

    setAccount(player, account);
}

async function handleConnect(player: alt.Player) {
    player.emit(AuthEvents.toClient.getOAuthToken, Rebar.useConfig().get().discord_clientID);
    player.dimension = player.id + 1;
    player.setMeta(sessionKey, true);
    player.emit(AuthEvents.toClient.cameraCreate);
    Rebar.player.useNative(player).invoke('triggerScreenblurFadeIn', 1000);
}

async function handleDisconnect(player: alt.Player) {
    delete loggedInPlayers[player.id];
}

alt.onClient(AuthEvents.toServer.login, handleLogin);
alt.on('playerConnect', handleConnect);
alt.on('playerDisconnect', handleDisconnect);

async function init() {
    // Wait for isReady and Get the API
    botApi.setChannelId(botApi.getChannelsIds().status);
    await botApi.sendEmbed(t('dc.systems.ok'), t('dc.title'), 'DarkGreen', { text: t('dc.version') });
}

init();

export function useAuth() {
    function onLogin(callback: (player: alt.Player) => void) {
        loginCallbacks.push(callback);
    }

    return {
        onLogin,
    };
}

declare global {
    export interface ServerPlugin {
        ['auth-api']: ReturnType<typeof useAuth>;
    }
}

Rebar.useApi().register('auth-api', useAuth());
