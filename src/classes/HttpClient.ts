import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from 'axios';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import { version } from '../../package.json';

export class HttpClient {
    protected readonly axios: AxiosInstance;

    public constructor(config?: CreateAxiosDefaults) {
        this.axios = axios.create({
            headers: {
                'User-Agent': `mvx-webhook-service/${version}`,
            },
            ...config,
        });
    }

    public client() {
        return this.axios;
    }

    public setupRetry(config: IAxiosRetryConfig) {
        axiosRetry(this.axios, config);
    }

    public get<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R> {
        return this.axios.get(url, config);
    }

    public post<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
        return this.axios.post(url, data, config);
    }
}

export const httpClient = new HttpClient();
