import { useTranslate } from '@Shared/translate.js';
const { setBulk } = useTranslate();

setBulk({
    en: {
        'auth.loading.discord': 'Validating discord account',
        'auth.loading.failed': 'We found a problem validating the account',
        'auth.register.failed': 'We found a problem creating the account',
        'dc.systems.ok': 'All systems OK! 🌍',
        'dc.title': 'MetaRP \t\t 🚀',
        'dc.version': 'version: 1.0.0'
    },
    pt: {
        'auth.loading.discord': 'A validar conta discord',
        'auth.loading.failed': 'Houve um problema ao validar a conta',
        'auth.register.failed': 'Houve um problema ao criar a conta',
        'dc.systems.ok': 'Todos os serviços estão operacionais! 🌍',
        'dc.title': 'MetaRP \t\t 🚀',
        'dc.version': 'versão: 1.0.0'
    }
});
