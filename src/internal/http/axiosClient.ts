import axios, { AxiosInstance } from 'axios';
import { HttpClient } from '../../model';

export class AxiosHttpClient implements HttpClient {
    private axios: AxiosInstance = axios.create({});

    async get<T>(url: string): Promise<T> {
        return (await this.axios.get(url)).data;
    }
}
