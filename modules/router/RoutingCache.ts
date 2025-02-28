import { get } from 'node:http';
import { Route } from './router.d';

interface CacheNode {
  request: string;
  route: Route;
  prev: CacheNode | null;
  next: CacheNode | null;
}

class RoutingCache {
  private maxSize: number;
  private map: Map<string, CacheNode>;
  private head: CacheNode | null;
  private tail: CacheNode | null;
  private _size: number;

  constructor(maxSize: number = 100) {
    if (typeof maxSize !== 'number' || maxSize < 1) {
      throw new Error('Invalid maxSize');
    }
    if (parseInt(maxSize.toString()) !== maxSize) {
      console.warn('maxSize should be an integer');
    }

    this.maxSize = maxSize;
    this.map = new Map();
    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  private createNode(request: string, route: Route): CacheNode {
    return {
      request,
      route,
      prev: null,
      next: null,
    };
  }

  private removeNode(node: CacheNode): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    this.map.delete(node.request);
    this._size--;
  }

  private addToTail(node: CacheNode): void {
    node.prev = this.tail;
    node.next = null;

    if (this.tail) {
      this.tail.next = node;
    } else {
      this.head = node;
    }

    this.tail = node;
    this.map.set(node.request, node);
    this._size++;
  }

  get size(): number {
    return this._size;
  }

  // get(request: string): Route | undefined {
  //   const node = this.map.get(request);
  //   if (node) {
  //     if (node !== this.tail) {
  //       this.removeNode(node);
  //       this.addToTail(node);
  //     }
  //     return node.route;
  //   }
  // }

  push(request: string, route: Route): number {
    if (this.map.has(request)) {
      this.removeNode(this.map.get(request)!);
    }

    this.addToTail(this.createNode(request, route));

    if (this._size > this.maxSize) {
      this.removeNode(this.head!);
    }

    return this._size;
  }
}

export default RoutingCache;
