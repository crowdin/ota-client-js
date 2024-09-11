import { HttpClient } from '../../model';

export class FetchHttpClient implements HttpClient {
    async get<T>(url: string): Promise<T> {
        const res = await fetch(url);
        if (this.isJson(res)) {
            return res.json() as T;
        }
        return res.text() as T;
    }

    isJson(res: Response): boolean {
        return res.headers?.get('Content-Type')?.toLowerCase() === 'application/json';
    }
}
