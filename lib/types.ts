import { URL, URLSearchParams } from 'url';

import { Req } from './request';
import { Res } from './response';

export type { Req, Res };

export type BodyType = 'arrayBuffer' | 'blob' | 'formData' | 'json' | 'text';

export interface Cookies {
  [key: string]: string;
}

export type Context = {
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
};

export type Step = (context: Context) => Promise<void> | void;
