export namespace Global {
    export namespace Color {
        export const DANGER_LIGHT = '#c9184a'
        export const DANGER_MEDIUM = '#a4133c'
        export const DANGER_DARK = '#800f2f'
        export const PRIMARY_THEME = '#25a18e'
        export const WHITE = '#f8f9fa'
        export const TEXT_DARK_1 = '#4a4e69'
    }

    export namespace Screen {
        export namespace Home {
            export namespace Variable {
                export namespace TOP_IMAGE_BG_HEIGHT {
                    let value: number = 0
                    export const get = () => value
                    export const set = (newValue: number) => {
                        value = (value !== newValue) ? newValue : value
                    }
                }
                export namespace NAV_BAR_HEIGHT {
                    let value: number = 65
                    export const get = () => value
                    export const set = (newValue: number) => {
                        value = (value !== newValue) ? newValue : value
                    }
                }
            }
        }
    }
}
