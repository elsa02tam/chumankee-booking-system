export const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
}

export function toColor(id: number) {
  switch (id % 3) {
    case 0:
      return colors.red
    case 1:
      return colors.blue
    case 2:
      return colors.yellow
  }
}
