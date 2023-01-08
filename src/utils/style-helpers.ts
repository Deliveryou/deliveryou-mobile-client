export function mergeStyles(styles: any) {
    let targetStyle: any = undefined
    if (Array.isArray(styles)) {
        targetStyle = {}
        styles.forEach((value, index, array) => Object.assign(targetStyle, value))
        targetStyle = !targetStyle ? {} : targetStyle
    } else if (!styles)
        targetStyle = {}

    console.log('run')

    return targetStyle
}
