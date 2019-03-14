import { IBizUtil } from './ibiz-util';
import { IBizApp } from './ibiz-app';
import { Subject } from 'rxjs';
import axios from 'axios';
import { IBizEnvironment } from '@/environments/ibiz-environment';

/**
 * IBizHttp net 对象
 * 调用 getInstance() 获取实例
 *
 * @class IBizHttp
 */
export class IBizHttp {

    /**
     * 获取 IBizHttp 单例对象
     *
     * @static
     * @returns {IBizHttp}
     * @memberof IBizHttp
     */
    public static getInstance(): IBizHttp {
        if (!IBizHttp.iBizHttp) {
            IBizHttp.iBizHttp = new IBizHttp();
        }
        return this.iBizHttp;
    }

    /**
     * 单例变量声明
     *
     * @private
     * @static
     * @type {IBizHttp}
     * @memberof IBizHttp
     */
    private static iBizHttp: IBizHttp;

    /**
     * 是否正在加载中
     *
     * @type {boolean}
     * @memberof IBizHttp
     */
    public isLoading: boolean = false;

    /**
     * 统计加载
     *
     * @type {number}
     * @memberof IBizHttp
     */
    private loadingCount: number = 0;

    /**
     * Creates an instance of IBizHttp.
     * 私有构造，拒绝通过 new 创建对象
     * 
     * @memberof IBizHttp
     */
    private constructor() { }

    /**
     * post请求
     *
     * @param {string} url 请求路径
     * @param {*} [params={}] 请求参数
     * @returns {Subject<any>} 可订阅请求对象
     * @memberof IBizHttp
     */
    public post(url: string, params: any = {}): Subject<any> {
        let _this = this;
        const subject: Subject<any> = new Subject();
        let win: any = window;
        let iBizApp: IBizApp = win.getIBizApp();
        if (!Object.is(iBizApp.getAppData(), '')) {
            Object.assign(params, { srfappdata: iBizApp.getAppData() });
        }
        const _strParams: string = _this.transformationOpt(params);
        let _url = '';
        let BaseUrl = IBizEnvironment.BaseUrl;
        _url = `/${BaseUrl}${url}`;
        _this.beginLoading();
        axios({
            method: 'post',
            url: _url,
            data: _strParams,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'Accept': 'application/json' },
            transformResponse: [(data: any) => {
                let _data: any = null;
                try {
                    _data = JSON.parse(JSON.parse(JSON.stringify(data)));
                } catch (error) {
                }
                return _data;
            }],
        }).then((data: any) => {
            _this.endLoading();
            if (data && data.notlogin) {
                return;
            }
            if (data.ret !== 0) {
                data.failureType = 'CLIENT_INVALID';
                data.info = data.info ? data.info : '本地网络异常，请重试';
                data.info = data.errorMessage ? data.errorMessage : '本地网络异常，请重试';
            }
            IBizUtil.processResult(data);
            subject.next(data);
        }).catch((error: any) => {
            _this.endLoading();
            subject.error(error);
        });
        return subject;
    }

    /**
     * post请求,不处理loading加载
     *
     * @param {string} url
     * @param {*} [params={}]
     * @returns {Subject<any>}
     * @memberof IBizHttp
     */
    public post2(url: string, params: any = {}): Subject<any> {
        const subject: Subject<any> = new Subject();
        let iBizApp: IBizApp = IBizApp.getInstance();

        if (!Object.is(iBizApp.getAppData(), '')) {
            Object.assign(params, { srfappdata: iBizApp.getAppData() });
        }
        const _strParams: string = this.transformationOpt(params);
        let _url = '';
        const BaseUrl = IBizEnvironment.BaseUrl;
        _url = `/${BaseUrl}${url}`;
        axios({
            method: 'post',
            url: _url,
            data: _strParams,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'Accept': 'application/json' },
            transformResponse: [(data: any) => {
                let _data = null;
                try {
                    _data = JSON.parse(JSON.parse(JSON.stringify(data)));
                } catch (error) {

                }
                return _data;
            }],
        }).then((data: any) => {
            if (data && data.notlogin) {
                return;
            }
            if (data.ret !== 0) {
                data.failureType = 'CLIENT_INVALID';
                data.info = data.info ? data.info : '本地网络异常，请重试';
                data.info = data.errorMessage ? data.errorMessage : '本地网络异常，请重试';
            }
            IBizUtil.processResult(data);
            subject.next(data);
        }).catch((error: any) => {
            subject.error(error);
        });
        return subject;
    }

    /**
     * get请求
     *
     * @param {string} url 请求路径
     * @param {*} [params={}] 请求参数
     * @returns {Subject<any>} 可订阅请求对象
     * @memberof IBizHttp
     */
    public get(url: string, params: any = {}): Subject<any> {
        const subject: Subject<any> = new Subject();
        const iBizApp: IBizApp = IBizApp.getInstance();

        if (!Object.is(iBizApp.getAppData(), '')) {
            Object.assign(params, { srfappdata: iBizApp.getAppData() });
        }
        if (Object.keys(params).length > 0) {
            const _strParams: string = this.transformationOpt(params);
            url = url.indexOf('?') ? `${url}&${_strParams}` : `${url}?&${_strParams}`
        }

        let _url = '';
        const BaseUrl = IBizEnvironment.BaseUrl;
        _url = `/${BaseUrl}${url}`;
        this.beginLoading();
        axios.get(_url).then((response: any) => {
            this.endLoading();
            subject.next(response);
        }).catch((error: any) => {
            this.endLoading();
            subject.error(error);
        });
        return subject;
    }

    /**
     * 请求参数转义处理
     *
     * @private
     * @param {*} [opt={}]
     * @returns {string}
     * @memberof IBizHttp
     */
    private transformationOpt(opt: any = {}): string {
        let params: any = {};
        let postData: string[] = [];

        Object.assign(params, opt);
        let keys: string[] = Object.keys(params);
        keys.forEach((key: string) => {
            const val: any = params[key];
            if (val instanceof Array || val instanceof Object) {
                postData.push(`${key}=${encodeURIComponent(JSON.stringify(val))}`);
            } else {
                postData.push(`${key}=${encodeURIComponent(val)}`);
            }
        });
        return postData.join('&');
    }

    /**
     * 开始加载
     *
     * @private
     * @memberof IBizHttp
     */
    private beginLoading(): void {
        if (this.loadingCount === 0) {
            setTimeout(() => {
                this.isLoading = true;
            });
        }
        this.loadingCount++;
    }

    /**
     * 加载结束
     *
     * @private
     * @memberof IBizHttp
     */
    private endLoading(): void {
        if (this.loadingCount > 0) {
            this.loadingCount--;
        }
        if (this.loadingCount === 0) {
            setTimeout(() => {
                this.isLoading = false;
            });
        }
    }
}
