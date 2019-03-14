import { IBizObject } from '../ibiz-object';

/**
 * 部件对象
 *
 * @class IBizControl
 * @extends {IBizObject}
 */
export class IBizControl extends IBizObject {

    /**
     * 后台交互URL
     * 
     * @private
     * @type {string}
     * @memberof IBizControl
     */
    private url: string = '';

    /**
     * 视图控制器对象
     * 
     * @private
     * @type {*}
     * @memberof IBizControl
     */
    private viewController: any = null;;

    /**
     * 部件http请求状态
     *
     * @type {boolean}
     * @memberof IBizControl
     */
    public isLoading: boolean = false;

    /**
     * vue 路由对象
     *
     * @type {*}
     * @memberof IBizControl
     */
    public $router: any = null;;

    /**
     * vue 实例对象
     *
     * @type {*}
     * @memberof IBizControl
     */
    public $vue: any = null;

    /**
     * vue 当前路由对象
     *
     * @type {*}
     * @memberof IBizControl
     */
    public $route: any = null;

    /**
     * 部件模型
     *
     * @type {*}
     * @memberof IBizControl
     */
    public model: any = {};

    /**
     * Creates an instance of IBizControl.
     * 创建 IBizControl 实例。 
     * 
     * @param {*} [opts={}] 
     * @memberof IBizControl
     */
    constructor(opts: any = {}) {
        super(opts);
        this.url = opts.url;
        this.viewController = opts.viewController;
        this.$route = opts.$route;
        this.$router = opts.$router;
        this.$vue = opts.$vue;
    }

    /**
     * 获取后台路径
     * 
     * @returns {*} 
     * @memberof IBizControl
     */
    public getBackendUrl(): string {
        let url: string = '';
        let viewController = this.getViewController();
        if (this.url) {
            url = this.url;
        }
        if (Object.is(url, '') && viewController) {
            url = viewController.getBackendUrl();
        }
        return url;
    }

    /**
     * 获取视图控制器
     * 
     * @returns {*} 
     * @memberof IBizControl
     */
    public getViewController(): any {
        if (this.viewController) {
            return this.viewController;
        }
        return undefined;
    }

    /**
     * 部件http请求
     *
     * @memberof IBizControl
     */
    public beginLoading(): void {
        this.isLoading = true;
    }

    /**
     * 部件结束http请求
     *
     * @memberof IBizControl
     */
    public endLoading(): void {
        this.isLoading = false;
    }

    /**
     * 设置部件模型
     *
     * @param {*} model
     * @memberof IBizControl
     */
    public setModel(model: any = {}): void {
        this.model = model;
    }

    /**
     * 获取部件模型
     *
     * @returns {*}
     * @memberof IBizControl
     */
    public getModel(): any {
        return this.model;
    }

    /**
     * 部件模型变化
     *
     * @static
     * @memberof IBizControl
     */
    public static CONTROLMODELCHANGE = 'CONTROLMODELCHANGE';
}
