import i18n from '@Utils/Vue/i18n';
import locKeys from '@Regulation/locKeys.mjs';

const { t } = i18n.global;

export default [
    [
        ['RushRSHydroDc'],
        (v) => `${t(locKeys[v])} (${t('RS')})`,
    ],
];
