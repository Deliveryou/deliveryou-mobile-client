export interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  get first(): T
  get size(): number;
}

export default class Queue<T> implements IQueue<T> {
  private storage: T[] = [];

  constructor(private capacity: number = Infinity) { }

  get first(): T {
    return this.storage?.[0]
  }

  enqueue(item: T): void {
    if (this.size === this.capacity) {
      throw Error("Queue has reached max capacity, you cannot add more items");
    }
    this.storage.push(item);
  }
  dequeue(): T | undefined {
    return this.storage.shift();
  }
  get size(): number {
    return this.storage.length;
  }
}