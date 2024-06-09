export const AuthEvents = {
    toServer: {
        login: 'auth:event:login',
    },
    toClient: {
        getOAuthToken: 'auth:event:oauth',
        cameraCreate: 'auth:event:camera:create',
        cameraDestroy: 'auth:event:camera:destroy',
    },
    fromServer: {
        invalidLogin: 'auth:event:invalid:login',
        invalidRegister: 'auth:event:invalid:register',
    },
};
