export default class OtaClient {
    /**
     * @param distributionHash hash of released Crowdin project distribution
     */
    constructor(private distributionHash: string) {}

    getHash(): string {
        return this.distributionHash;
    }
}
