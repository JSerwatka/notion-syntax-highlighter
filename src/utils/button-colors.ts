const buttonColors = {
  dark: {
    languageSwitcher: {
      hoverBackground: 'rgba(255, 255, 255, 0.055)',
      text: {
        color: 'rgba(255, 255, 255, 0.443)'
      },
      icons: {
        fill: 'rgba(255, 255, 255, 0.282)'
      }
    },
    options: {
      background: 'rgb(37, 37, 37);',
      hoverBackground: 'rgba(255, 255, 255, 0.055)',
      text: {
        color: 'rgba(255, 255, 255, 0.81)'
      },
      icons: {
        fill: 'rgba(255, 255, 255, 0.443)'
      }
    }
  },
  light: {
    languageSwitcher: {
      hoverBackground: 'rgba(55, 53, 47, 0.08)',
      text: {
        color: 'rgba(55, 53, 47, 0.65)'
      },
      icons: {
        fill: 'rgba(55, 53, 47, 0.35)'
      }
    },
    options: {
      background: 'rgb(234, 233, 229)',
      hoverBackground: 'rgba(55, 53, 47, 0.08)',
      text: {
        color: 'rgb(55, 53, 47)'
      },
      icons: {
        fill: 'rgba(55, 53, 47, 0.45)'
      }
    }
  }
} as const;
