import { IBizEnvironment } from './../../environments/ibiz-environment';
import { IBizUtil } from './../util/ibiz-util';
import { IBizUICounter } from './../util/ibiz-ui-counter';
import { IBizApp } from './../util/ibiz-app';
import { IBizObject } from "../ibiz-object";
import { Subject } from 'rxjs';

/**
 * 视图控制器基类
 *
 * @class IBizViewControllerBase
 * @extends {IBizObject}
 */
export class IBizViewControllerBase extends IBizObject {

    /**
     * 计数器
     *
     * @type {Map<string, any>}
     * @memberof IBizViewControllerBase
     */
    public uicounters: Map<string, any> = new Map();

    /**
     * 关系数据
     *
     * @type {*}
     * @memberof IBizViewControllerBase
     */
    public srfReferData: any = {};

    /**
     * 视图控制器父对象数据
     * 
     * @type {*}implements OnInit, OnDestroy, OnChanges
     * @memberof IBizViewController
     */
    public srfParentData: any = {};

    /**
     * 视图控制器父对象模型
     * 
     * @type {*}
     * @memberof IBizViewController
     */
    public srfParentMode: any = {};

    /**
     * 视图控制器是否初始化
     *
     * @type {boolean}
     * @memberof IBizViewControllerBase
     */
    public bInited: boolean = false;

    /**
     * 视图使用模式
     *
     * @private
     * @type {number}
     * @memberof IBizViewControllerBase
     */
    private viewUsage: number = 1;

    /**
     * 视图控制器参数
     *
     * @type {*}
     * @memberof IBizViewControllerBase
     */
    public viewParam: any = {};

    /**
     * vue 路由对象
     *
     * @type {*}
     * @memberof IBizViewControllerBase
     */
    public $router: any = null;;

    /**
     * vue 实例对象
     *
     * @type {*}
     * @memberof IBizViewController
     */
    public $vue: any = null;

    /**
     * vue 当前路由对象
     *
     * @type {*}
     * @memberof IBizViewController
     */
    public $route: any = null;

    /**
     * 当前路由所在位置下标
     *
     * @type {number}
     * @memberof IBizViewController
     */
    public route_index: number = -1;

    /**
     * 当前路由url
     *
     * @type {string}
     * @memberof IBizViewController
     */
    public route_url: string = '';

    /**
     * Creates an instance of IBizViewControllerBase.
     * 创建 IBizViewControllerBase 实例
     * 
     * @param {*} [opts={}]
     * @memberof IBizViewControllerBase
     */
    constructor(opts: any = {}) {
        super(opts);

        let iBizApp: IBizApp = IBizApp.getInstance();
        if (iBizApp) {
            iBizApp.regSRFController(this);
        }
    }

    /**
    * 初始化
    * 模拟vue生命周期
    *
    * @memberof IBizViewController
    */
    VueOnInit(vue: any): void {
        this.beforeVueOnInit(vue);
    }

    /**
     * 视图初始化之前
     *
     * @param {*} vue
     * @memberof IBizViewControllerBase
     */
    public beforeVueOnInit(vue: any) {
        this.$route = vue.$route;
        this.$router = vue.$router;
        this.$vue = vue;
        this.setViewUsage(this.$vue.viewUsage);
    }

    /**
     * 视图组件销毁时调用
     *
     * @memberof IBizViewControllerBase
     */
    public onDestroy(): void {
        this.unRegUICounters();

        let iBizApp: IBizApp = IBizApp.getInstance();
        if (iBizApp) {
            iBizApp.unRegSRFController(this);
        }
    }

    /**
     * 注销计数器
     *
     * @returns {void}
     * @memberof IBizViewControllerBase
     */
    public unRegUICounters(): void {
        if (Object.keys(this.uicounters).length == 0) {
            return;
        }

        const _nameArr: Array<any> = Object.keys(this.uicounters);
        _nameArr.forEach(name => {
            const _counter: IBizUICounter = this.getUICounter(name);
            if (_counter) {
                _counter.close();
            }
        });
    }

    /**
     * 获取界面计数器
     *
     * @param {string} name
     * @returns {*}
     * @memberof IBizViewControllerBase
     */
    public getUICounter(name: string): any {
    }

    /**
     * 设置父模式
     *
     * @param {*} [data={}]
     * @memberof IBizViewControllerBase
     */
    public setParentMode(data: any = {}): void {
        this.srfParentMode = {};
        let _data: any = {};
        Object.keys(data).forEach((name: string) => {
            _data[name.toLowerCase()] = data[name];
        });
        Object.assign(this.srfParentMode, _data);
    }

    /**
     *  设置父数据
     *
     * @param {*} [data={}]
     * @memberof IBizViewControllerBase
     */
    public setParentData(data: any = {}): void {

        this.srfParentData = {};
        let _data: any = {};
        Object.keys(data).forEach((name: string) => {
            _data[name.toLowerCase()] = data[name];
        });
        Object.assign(this.srfParentData, _data);

        this.onSetParentData();
        this.reloadUpdatePanels();
    }

    /**
     * 刷新全部界面更新面板
     *
     * @memberof IBizViewControllerBase
     */
    public reloadUpdatePanels(): void {

    }

    /**
     * 设置父数据
     * 
     * @memberof IBizViewController
     */
    public onSetParentData(): void {
    }

    /**
     * 设置关系数据
     *
     * @param {*} [data={}]
     * @memberof IBizViewControllerBase
     */
    public setReferData(data: any = {}): void {
        this.srfReferData = {};
        let _data: any = {};
        Object.keys(data).forEach((name: string) => {
            _data[name.toLowerCase()] = data[name];
        });
        Object.assign(this.srfReferData, _data);
    }

    /**
     * 解析视图参数，初始化调用
     *
     * @memberof IBizViewControllerBase
     */
    public parseViewParams(): void {
        let parsms: any = {};
        if (this.getViewUsage() === IBizViewControllerBase.VIEWUSAGE_DEFAULT) {
            let _parsms: any = {};

            let iBizApp: IBizApp = IBizApp.getInstance();
            if (iBizApp) {
                let _index = 0;
                let views: Array<any> = iBizApp.viewControllers;
                views.some((_view: any) => {
                    if (Object.is(_view.getId(), this.getId()) && Object.is(_view.getViewUsage(), this.getViewUsage())) {
                        return true;
                    }
                    if (Object.is(_view.getViewUsage(), IBizViewControllerBase.VIEWUSAGE_DEFAULT)) {
                        _index = _index + 1;
                    }
                    return true;
                });
                this.route_index = _index;
            }

            let route_arr: Array<any> = this.$route.fullPath.split('/');
            let matched: Array<any> = this.$route.matched;

            const cur_route_name = matched[this.route_index].name;
            const cur_route_index = route_arr.findIndex((_name: any) => Object.is(_name, cur_route_name));
            let route_url_index = cur_route_index + 1;
            if (matched[this.route_index + 1]) {
                const next_route_name = matched[this.route_index + 1].name;
                const next_route_index = route_arr.findIndex((_name: any) => Object.is(_name, next_route_name));
                if (cur_route_index + 2 === next_route_index) {
                    let datas = decodeURIComponent(route_arr[cur_route_index + 1]);
                    Object.assign(_parsms, IBizUtil.matrixURLToJson(datas));
                    route_url_index = route_url_index + 1;
                }
            } else if (route_arr[cur_route_index + 1]) {
                let datas = decodeURIComponent(route_arr[cur_route_index + 1]);
                Object.assign(_parsms, IBizUtil.matrixURLToJson(datas));
                route_url_index = route_url_index + 1;
            }

            this.route_url = route_arr.slice(0, route_url_index).join('/');

            if (Object.keys(_parsms).length > 0) {
                Object.assign(parsms, _parsms);
            }
        } else if (this.getViewUsage() === IBizViewControllerBase.VIEWUSAGE_MODAL) {
            Object.assign(parsms, this.$vue.params);
            if (this.$vue.srfParentMode) {
                this.setParentMode(this.$vue.srfParentMode);
            }
            if (this.$vue.srfParentData) {
                this.setParentData(this.$vue.srfParentData);
            }
            if (this.$vue.srfReferData) {
                this.setReferData(this.$vue.srfReferData);
            }
        } else if (this.getViewUsage() === IBizViewControllerBase.VIEWUSAGE_EMBEDED) {
            Object.assign(parsms, this.$vue.params);
            if (this.$vue.srfParentMode) {
                this.setParentMode(this.$vue.srfParentMode);
            }
            if (this.$vue.srfParentData) {
                this.setParentData(this.$vue.srfParentData);
            }
            if (this.$vue.srfReferData) {
                this.setReferData(this.$vue.srfReferData);
            }
        }
        this.addViewParam(parsms);
    }

    /**
     * 处理组件参数
     *
     * @memberof IBizViewControllerBase
     */
    public fullComponentParam(param: any = {}): void {
        let _data: any = {};
        Object.keys(param).forEach((name: string) => {
            _data[name.toLowerCase()] = param[name];
        });
        Object.assign(this.viewParam, _data);
    }

    /**
     * 添加视图参数, 处理视图刷新操作
     *
     * @param {*} [param={}]
     * @memberof IBizViewControllerBase
     */
    public addViewParam(param: any = {}): void {
        let _data: any = {};
        Object.keys(param).forEach((name: string) => {
            _data[name.toLowerCase()] = param[name];
        });
        Object.assign(this.viewParam, _data);
    }

    /**
     * 数据加载
     *
     * @memberof IBizViewControllerBase
     */
    public onLoad(): void {

    }

    /**
     * 是否初始化完毕
     *
     * @returns {boolean}
     * @memberof IBizViewControllerBase
     */
    public isInited(): boolean {
        return this.bInited;
    }

    /**
     * 设置视图的使用模式
     *
     * @private
     * @param {number} [viewUsage=0]
     * @memberof IBizViewControllerBase
     */
    private setViewUsage(viewUsage: number = 0): void {
        this.viewUsage = viewUsage;
    }

    /**
     * 获取视图的使用模式
     *
     * @returns {number}
     * @memberof IBizViewController
     */
    public getViewUsage(): number {
        return this.viewUsage;
    }

    /**
     * 打开数据视图,模态框打开
     *
     * @param {*} [view={}]
     * @returns {Subject<any>}
     * @memberof IBizViewController
     */
    public openModal(view: any = {}): Subject<any> {
        const subject: Subject<any> = new Subject();
        Object.assign(view, { subject: subject });
        this.$vue.$root.addModal(view);
        return subject;
    }

    /**
     * 关闭模态框
     *
     * @param {*} [result]
     * @memberof IBizViewController
     */
    public closeModal(result?: any): void {
        let _this = this;
        _this.$vue.$emit('close', result);
    }

    /**
     * 打开视图;打开方式,路由打开
     * 
     * @param {string} routeString 相对路由地址
     * @param {*} [routeParam={}] 激活路由参数
     * @param {*} [queryParams] 路由全局查询参数
     * @memberof IBizViewController
     */
    public openView(routeString: string, routeParam: any = {}, queryParams?: any) {
        if (this.getViewUsage() !== IBizViewControllerBase.VIEWUSAGE_DEFAULT) {
            return;
        }

        let param_arr: Array<string> = [];
        Object.keys(routeParam).forEach((name: string) => {
            if (routeParam[name] && !Object.is(routeParam[name], '')) {
                param_arr.push(`${name}=${routeParam[name]}`);
            }
        });

        let url: string = `${this.route_url}/${routeString}`;
        if (param_arr.length > 0) {
            url = `${url}/${param_arr.join(';')}`;
        }
        this.$router.push({ path: url, query: queryParams });
    }

    /**
     * 打开新窗口
     *
     * @param {string} viewurl
     * @param {*} [parsms={}]
     * @memberof IBizViewController
     */
    public openWindow(viewurl: string, parsms: any = {}): void {
        let url = `/${IBizEnvironment.BaseUrl}/${IBizEnvironment.AppName.toLowerCase()}${viewurl}`;
        let parsms_arr: Array<string> = [];
        Object.keys(parsms).forEach((name: string) => {
            if (parsms[name] && !Object.is(parsms[name], '')) {
                parsms_arr.push(`${name}=${parsms[name]}`);
            }
        });
        if (parsms_arr.length > 0) {
            url = `${url}/${parsms_arr.join(';')}`;
        }

        let win: any = window;
        win.open(url, '_blank');
    }

    /**
     * 数据变化
     *
     * @param {*} [data]
     * @memberof IBizViewControllerBase
     */
    public dataChange(data?: any): void {
        let _this = this;
        _this.$vue.$emit('dataChange', data);
    }

    /**
     * 视图使用模式，默认
     *
     * @static
     * @memberof IBizViewController
     */
    public static VIEWUSAGE_DEFAULT = 1;

    /**
     * 视图使用模式，模式弹出
     *
     * @static
     * @memberof IBizViewController
     */
    public static VIEWUSAGE_MODAL = 2;

    /**
     * 视图使用模式，嵌入
     *
     * @static
     * @memberof IBizViewController
     */
    public static VIEWUSAGE_EMBEDED = 4;
} 