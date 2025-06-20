import * as i18next from 'i18next';
import { z } from 'zod';
import { zodI18nMap } from 'zod-i18n-map';
import { zodMessages } from '~configs';
// Import your language translation files

// lng and resources key depend on your locale.
i18next.init({
  lng: 'ja',
  resources: {
    ja: { zod: zodMessages },
  },
});
z.setErrorMap(zodI18nMap);

// export configured zod instance
export { z as zodJP };
