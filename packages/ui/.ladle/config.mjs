/** @type {import('@ladle/react').UserConfig} */
export default {
  addons: {
    a11y: {
      enabled: true,
    },
    action: {
      enabled: true,
      defaultState: [],
    },
    control: {
      enabled: true,
      defaultState: {},
    },
    ladle: {
      enabled: true,
    },
    mode: {
      enabled: true,
      defaultState: 'full',
    },
    msw: {
      enabled: false,
    },
    rtl: {
      enabled: true,
      defaultState: false,
    },
    source: {
      enabled: true,
      defaultState: false,
    },
    theme: {
      enabled: true,
      defaultState: 'light',
    },
    width: {
      enabled: true,
      options: {
        mobile: 414,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
      },
      defaultState: 0,
    },
  },
};
