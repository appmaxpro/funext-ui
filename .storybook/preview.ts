import { Preview } from "@storybook/react";
import { WithTheme } from "./decorators/with-theme";
import { withThemeByDataAttribute } from '@storybook/addon-themes';

const preview:Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        order: [
          "System",
          "Layout",
          "Animation",
          "Core",
          "Icons",
          "Components",
          "Advanced",
        ],
      },
    },
  },
  globalTypes: {

    locale: {
      name: "Locale",
      description: "Global locale for components",
      defaultValue: "en_US",
      toolbar: {
        icon: "globe",
        items: [
          { value: "en_US", title: "English" },
          { value: "ar_MA", title: "العربية" },
        ],
      },
    },
    
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-bs-theme',
    }),
    WithTheme
  ],
};

export default preview;
