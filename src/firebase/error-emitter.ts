'use client';

import EventEmitter from 'eventemitter3';
import type { FirestorePermissionError } from './errors';

type Events = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// Create a singleton instance of the event emitter
export const errorEmitter = new EventEmitter<Events>();
