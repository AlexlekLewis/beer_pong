import { expect, it } from 'vitest';
import { generateGroupCode, hashGroupCode } from '../src/lib/registration-api';

it('generates shareable codes and hashes typed variants consistently', async () => {
    const code = generateGroupCode();
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{4}(-[A-HJ-NP-Z2-9]{4}){2}$/);
    expect(await hashGroupCode(code)).toMatch(/^[a-f0-9]{64}$/);
    expect(await hashGroupCode(code.toLowerCase().replace(/-/g, ' '))).toBe(await hashGroupCode(code));
    expect(generateGroupCode()).not.toBe(code);
});
