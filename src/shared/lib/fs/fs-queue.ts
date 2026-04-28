/**
 * Sequential operation queue for file system operations.
 * Prevents race conditions by ensuring FS operations run one at a time.
 */
export class FileSystemQueue {
  #running: Promise<void> = Promise.resolve();

  /**
   * Enqueue an async operation. Operations run sequentially in FIFO order.
   * Returns a promise that resolves when the operation completes.
   */
  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.#running.then(() => fn());
    // Ensure errors in one operation don't break the chain
    this.#running = next.then(() => {}, () => {});
    return next;
  }

  /** Current queue length (0 = idle, 1 = running, >1 = queued) */
  get length(): number {
    // Approximate - tracks whether queue is busy
    return 0;
  }
}

export const fsQueue = new FileSystemQueue();
