import { IBizObject } from "../ibiz-object";

/**
 * 计数器
 *
 * @class IBizUICounter
 * @extends {IBizControl}
 */
export class IBizUICounter extends IBizObject {

    /**
     * 定时器时间
     * 
     * @private
     * @type {*}
     * @memberof IBizUICounter
     */
    private timer: number;

    /**
     * 定时器
     * 
     * @private
     * @type {*}
     * @memberof IBizUICounter
     */
    private timerTag: any = null;

    /**
     * 计数器id
     * 
     * @private
     * @type {*}
     * @memberof IBizUICounter
     */
    private counterId: string = '';

    /**
     * 计数器参数
     * 
     * @private
     * @type {*}
     * @memberof IBizUICounter
     */
    private counterParam: any = {};

    /**
     * 最后加载数据
     * 
     * @private
     * @type {*}
     * @memberof IBizUICounter
     */
    private lastReloadArg: any = {};

    /**
     * 计数器结果
     * 
     * @private
     * @type {*}
     * @memberof IBizUICounter
     */
    private result: any = {};

    /**
     * 计数器交互数据
     *
     * @private
     * @type {*}
     * @memberof IBizUICounter
     */
    private data: any = {};

    /**
     * url
     *
     * @type {string}
     * @memberof IBizUICounter
     */
    public url: string = '';

    /**
     * Creates an instance of IBizUICounter.
     * 创建 IBizUICounter 服务对象
     * 
     * @param {*} [config={}]
     * @memberof IBizUICounter
     */
    constructor(config: any = {}) {
        super(config);
        this.counterId = config.counterId;
        Object.assign(this.counterParam, config.counterParam);
        this.timer = config.timer;
        this.url = config.url;
        this.load();
    }

    /**
     * 加载定时器
     * 
     * @memberof IBizUICounter
     */
    private load(): void {
        if (this.timer > 1000) {
            this.timerTag = setInterval(() => {
                this.reload();
            }, this.timer);
        }
        this.reload();
    }

    /**
     * 刷新计数器
     * 
     * @private
     * @param {*} [arg={}] 
     * @memberof IBizUICounter
     */
    public reload(arg: any = {}): void {
        let params: any = {};
        Object.assign(this.lastReloadArg, arg);
        Object.assign(params, this.lastReloadArg);
        Object.assign(params, { srfcounterid: this.counterId, srfaction: 'FETCH', srfcounterparam: JSON.stringify(this.counterParam) });
        this.iBizHttp.post2(this.url, params).subscribe((res: any) => {
            if (res.ret === 0) {
                this.setData(res);
            }
        }, error => {
            console.log('加载计数器异常');
        });
    }

    /**
     * 处理数据
     * 
     * @private
     * @param {*} result 
     * @memberof IBizUICounter
     */
    private setData(result: any): void {
        this.result = result;
        this.data = result.data;
        this.fire(IBizUICounter.COUNTERCHANGED, this.data);
    }

    /**
     * 获取结果
     * 
     * @returns {*} 
     * @memberof IBizUICounter
     */
    public getResult(): any {
        return this.result;
    }

    /**
     * 获取数据
     * 
     * @returns {*} 
     * @memberof IBizUICounter
     */
    public getData(): any {
        return this.data;
    }

    /**
     * 关闭计数器
     * 
     * @memberof IBizUICounter
     */
    public close(): void {
        if (this.timerTag !== undefined) {
            clearInterval(this.timerTag);
            delete this.timer;
        }
    }

    /**
     * 计数发生变化
     *
     * @static
     * @memberof IBizUICounter
     */
    public static COUNTERCHANGED = "COUNTERCHANGED"
}

