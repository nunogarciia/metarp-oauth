import { useTranslate } from '@Shared/translate.js';
const { setBulk } = useTranslate();

setBulk({
    en: {
        'auth.loading.discord': 'Validating discord account',
        'auth.loading.failed': 'We found a problem validating the account',
        'auth.register.failed': 'We found a problem creating the account',
    },
    pt: {
        'auth.loading.discord': 'A validar conta discord',
        'auth.loading.failed': 'Houve um problema ao validar a conta',
        'auth.register.failed': 'Houve um problema ao criar a conta',
    }
});
