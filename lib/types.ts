import type { ServeOptions } from 'bun';

import { URL, URLSearchParams } from 'url';

import type { Req, BodyType } from './request';
import { Res } from './response';

export type { Req, BodyType, Res };

export interface Cookies {
  [key: string]: string;
}

export interface BakeryOptions extends Partial<ServeOptions> {}

export interface Context {
  req: Request;
  request: Req;
  response: Res;
  steps: {
    readonly length: number;
    readonly value: Step[];
    readonly index: number;
    readonly current: Step;
    insertStep: (...steps: Step[]) => void;
    insert: (...steps: Step[]) => void;
    after: (...steps: Step[]) => void;
    nextStep: () => Promise<void>;
    next: () => Promise<void>;
  };
  throw: (error: Error) => never;
  next: () => Promise<void>;
}

export type Step = (context: Context) => Promise<void> | void;

export interface ErrorHandler {}
