import Queue from "../data_structures/Queue"

export function debounce(callback: Function, delay: number = 1000) {
  let timeout: any

  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => callback(...args), delay)
  }
}

export function throttle(callback: Function, delay: number = 1000) {

  let shouldWait = false
  let waitingArgs: any

  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false
    } else {
      callback(...waitingArgs)
      waitingArgs = null
      setTimeout(timeoutFunc, delay)
    }
  }

  return (...args: any[]) => {
    if (shouldWait) {
      waitingArgs = args
      return
    }

    callback(...args)
    shouldWait = true
    setTimeout(timeoutFunc, delay)
  }

}

export const delay = (miliseconds: number) => new Promise(res => setTimeout(res, miliseconds));

export namespace Prioritizer {
  export class FirstOnlyMode {
    private first?: () => void
    private freezeSpan: number

    constructor(freezeSpan: number = 0) {
      this.changeFreezeSpan(freezeSpan)
      this.first = undefined
    }

    changeFreezeSpan(value: number) {
      if (value < 0)
        throw new Error('Freeze span cannot be negative')
      this.freezeSpan = value
    }

    async run(callback: () => void) {
      if (this.first === undefined) {
        this.first = callback
        this.first()
        await delay(this.freezeSpan)
        this.first = undefined
      }
    }
  }

  export class QueueMode {
    private queue: Queue<() => void>
    private active: boolean

    constructor(queueCapacity?: number) {
      this.queue = new Queue<() => void>(queueCapacity)
      this.active = false
    }

    async run(callback: () => void) {
      this.queue.enqueue(callback)
      if (!this.active) {
        this.active = true
        await this.excecuteCallback()
        this.active = false
      }
    }

    private async excecuteCallback() {
      const pr = new Promise((resolve) => {
        resolve(true)
      })
      while (this.queueSize > 0) {
        await this.queue.first()
        this.queue.dequeue()
      }
    }

    get queueSize() {
      return this.queue.size
    }
  }
}