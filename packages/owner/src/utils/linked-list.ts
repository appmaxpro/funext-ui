class Node<T> {
  data: T;
  next: Node<T> | null;

  constructor(data: T, next: Node<T> | null = null) {
    this.data = data;
    this.next = next;
  }
}

export class LinkedList<T> {
  #head: Node<T> | null;

  constructor() {
    this.#head = null;
  }

  append(data: T): void {
    const newNode = new Node(data);
    if (!this.#head) {
      this.#head = newNode;
    } else {
      let currentNode: Node<T> = this.#head;
      while (currentNode.next) {
        currentNode = currentNode.next;
      }
      currentNode.next = newNode;
    }
  }

  addFirst(data: T): void {
    const newNode = new Node(data);
    newNode.next = this.#head;
    this.#head = newNode;
  }

  delete(data: T): void {
    if (!this.#head) {
      return;
    }

    if (this.#head.data === data) {
      this.#head = this.#head.next;
      return;
    }

    let current: Node<T> = this.#head;
    while (current.next) {
      if (current.next.data === data) {
        current.next = current.next.next;
        return;
      }
      current = current.next;
    }
  }

  get head(){
    return this.#head?.data
  }

}
