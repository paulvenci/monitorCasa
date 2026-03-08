import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

const electrosunTheme = {
    dark: true,
    colors: {
        primary: '#00cec9',
        'primary-darken-1': '#00a8a3',
        secondary: '#0984e3',
        accent: '#fab1a0',
        success: '#00b894',
        warning: '#fdcb6e',
        error: '#d63031',
        info: '#0984e3',
        background: '#0f0f1e',
        surface: '#16213e',
    },
}

export default createVuetify({
    theme: {
        defaultTheme: 'electrosunTheme',
        themes: {
            electrosunTheme,
        },
    },
    defaults: {
        VCard: {
            elevation: 4,
            rounded: 'lg',
            class: 'border-opacity-10',
        },
        VBtn: {
            rounded: 'md',
        },
    },
})
