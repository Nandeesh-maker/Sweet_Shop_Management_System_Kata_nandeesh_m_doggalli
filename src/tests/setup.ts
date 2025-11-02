import { TextEncoder, TextDecoder } from 'util';

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder as any;

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Use different port for tests
