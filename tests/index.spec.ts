import OtaClient from '../src/index';

describe('OTA client', () => {
    let client: OtaClient;
    const hash = 'testHash';

    beforeAll(() => {
        client = new OtaClient(hash);
    });

    it('should return correct hash', () => {
        expect(client.getHash()).toBe(hash);
    });
});
