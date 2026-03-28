import { KeepLast } from "./concurrency";

export type Task<T> = () => Promise<T>;

export class TaskQueue {
  #queue: Task<any>[] = [];
  #running = false;
  #inc = 0;
  #paused = false;
  #waiting: Promise<void> | undefined;
  #finished: (() => void) | undefined;
  #keepLast = new KeepLast();

  #run(force: boolean = false) {
    if (!force && this.#running) {
      return;
    }
    this.#running = true;
    this.#waiting ??= new Promise((resolve) => {
      this.#finished = resolve;
    });

    const current = ++this.#inc;

    console.log("%c Run queue: " + current, "background: #222; color: #bada55");
    const task = this.#queue.shift();
    if (task) {
      return task().finally(() => {
        console.log(
          "%c Finish queue: " + current,
          "background: #222; color: #bada55",
        );
        this.#run(true);
      });
    } else {
      this.#running = false;
      this.#finished?.();
      this.#waiting = undefined;
      console.log(
        "%c Finish queue: " + current,
        "background: #222; color:rgb(241, 117, 1)",
      );
    }
  }

  add<T>(task: Task<T>) {
    if (this.#paused) return task();
    return new Promise<T>((resolve, reject) => {
      this.#queue.push(() => task().then(resolve).catch(reject));
      this.#run();
    });
  }

  orAdd<T>(task: Task<T>) {
    return Promise.resolve(() => {
      if (!this.#running) return this.add(task)
    })
  }

  wait(timeout: number = -1) {
    let handle:ReturnType<typeof setTimeout>|undefined;
    if (timeout > 0) {
       const that = this;
       handle = setTimeout(() => {
          handle = undefined; 
          if (that.#waiting) {
            that.#finished!();
            console.log(
              "%c Kill waiting: ",
              "background: #222; color:rgb(241, 1, 1)",
            );
            this.#waiting = undefined;
          }
        }, timeout);
    }

    return this.add(async() => {
      if(handle) {
        console.log(
              "%c Wait OK ",
              "background: #222; color:rgb(241, 117, 1)",
            );
        clearTimeout(handle)
      }
    });
    
  }

  addLast(fn: ()=> void) {
    
    const onDone = new Promise((resolve, reject) => {
      const runLast = async () => 1;
      this.#queue.push(() => runLast().then(resolve).catch(reject));
      this.#run();
    });
    return this.#keepLast.add(onDone).then(() => fn());
  }

  get all() {
    return this.#queue;
  }

  get current() {
    return this.#inc;
  }

  get running() {
    return this.#running;
  }

  pause() {
    this.#paused = true;
  }

  resume() {
    this.#paused = false;
  }

  restart(){
    this.#queue = [];
    this.#paused = false;
  }
}
