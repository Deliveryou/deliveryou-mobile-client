export default class FilterChain {
    private chain: Filter[]
    private defaultFilterChainConfig: FilterChainConfig

    constructor() {
        this.chain = []
        this.defaultFilterChainConfig = new FilterChainConfig()
    }

    appendFilter(filter: Filter) {
        this.chain.push(filter)
    }

    comsumeAllFilter(callback: () => void, onFailedCallback?: (reason: string) => void, config?: FilterChainConfig) {
        if (this.chain.length === 0)
            return

        config = (config) ? config : this.defaultFilterChainConfig
        let failedAtStep: string | undefined = undefined

        for (let item of this.chain)
            if (!item.doFilter() && config.stopWhenFailed) {
                failedAtStep = item.name
                break
            }

        if (failedAtStep === undefined)
            callback()
        else
            onFailedCallback?.(`Failed at step [${failedAtStep}]`)
    }
}

export class FilterChainConfig {
    stopWhenFailed: boolean = true
}

export class Filter {
    private filter: () => boolean
    private onFailed?: () => void
    readonly name: string = 'NO NAME FILTER'

    constructor(name: string | undefined, filter: () => boolean, onFailed?: () => void) {
        this.filter = filter
        this.onFailed = onFailed
        this.name = (name === undefined || name.trim() === '') ? this.name : name
    }

    doFilter() {
        if (!this.filter()) {
            this.onFailed?.()
            return false
        }
        return true
    }
}