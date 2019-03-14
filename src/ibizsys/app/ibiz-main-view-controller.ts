import { IBizToolbar } from './../widget/ibiz-toolbar';
import { IBizViewController } from './ibiz-view-controller';

/**
 * 视图主控制器
 *
 * @class IBizMainViewController
 * @extends {IBizViewController}
 */
export class IBizMainViewController extends IBizViewController {

    /**
     * 是否显示工具栏，默认显示
     * 
     * @type {boolean}
     * @memberof IBizMainViewController
     */
    public isShowToolBar: boolean = true;

    /**
     * 视图控制器标题
     * 
     * @type {string}
     * @memberof IBizMainViewController
     */
    public caption: string = '';

    /**
     * 实体数据权限
     *
     * @type {*}
     * @memberof IBizMainViewController
     */
    public dataaccaction: any = {};

    /**
     * 视图模型
     *
     * @type {*}
     * @memberof IBizMainViewController
     */
    public viewModel: any = {};

    /**
     * Creates an instance of IBizMainViewController.
     * 创建 IBizMainViewController 实例
     * 
     * @param {*} [opts={}]
     * @memberof IBizMainViewController
     */
    constructor(opts: any = {}) {
        super(opts);
    }

    /**
     * 视图处初始化部件
     * 
     * @memberof IBizMainViewController
     */
    public onInitComponents(): void {
        super.onInitComponents();

        const toolbar: any = this.getToolBar();
        if (toolbar) {
            // 工具栏点击
            toolbar.on(IBizToolbar.ITEMCLICK).subscribe((params: any) => {
                this.onClickTBItem(params);
            });
        }
        const toolbar2: any = this.getToolBar2();
        if (toolbar2) {
            // 工具栏点击
            toolbar2.on(IBizToolbar.ITEMCLICK).subscribe((params: any) => {
                this.onClickTBItem(params);
            });
        }
    }

    /**
     * 视图加载
     *
     * @memberof IBizMainViewController
     */
    public onLoad(): void {
        super.onLoad();

        this.loadModel();
    }

    /**
     * 加载视图模型之前
     *
     * @param {*} [params={}]
     * @memberof IBizMainViewController
     */
    public beforeLoadMode(params: any): void {
        Object.assign(params, this.getViewParam());
    }

    /**
     * 视图模型加载完毕
     *
     * @protected
     * @param {*} data
     * @memberof IBizMainViewController
     */
    public afterLoadMode(data: any): void { }

    /**
     * 加载视图模型
     *
     * @memberof IBizMainViewController
     */
    public loadModel(): void {
        let params: any = { srfaction: 'loadmodel' };
        this.beforeLoadMode(params);
        const url = this.isDynamicView() ? this.addOptionsForUrl(this.getBackendUrl(), this.getViewParam()) : this.getBackendUrl();
        this.iBizHttp.post(url, params).subscribe((data) => {
            if (data.ret !== 0) {
                console.log(data.info);
                return;
            }
            if (data.dataaccaction && Object.keys(data.dataaccaction).length > 0) {
                Object.assign(this.dataaccaction, data.dataaccaction);
                this.onDataAccActionChange(data.dataaccaction);
            }
            this.afterLoadMode(data);
            Object.assign(this.viewModel, data);
        }, (error) => {
            console.log(error.info);
        });
    }

    /**
     * 添加参数到指定的url中
     *
     * @private
     * @param {string} url
     * @param {*} [opt={}]
     * @returns {string}
     * @memberof IBizMainViewController
     */
    private addOptionsForUrl(url: string, opt: any = {}): string {
        const keys: string[] = Object.keys(opt);
        const isOpt: number = url.indexOf('?');
        keys.forEach((key, index) => {
            if (index === 0 && isOpt === -1) {
                url += `?${key}=${opt[key]}`;
            } else {
                url += `&${key}=${opt[key]}`;
            }
        });
        return url;
    }

    /**
     * 是否是动态视图
     *
     * @returns {boolean}
     * @memberof IBizMainViewController
     */
    public isDynamicView(): boolean {
        return false;
    }

    /**
     * 点击按钮
     * 
     * @param {*} [params={}]  tag 事件源
     * @memberof IBizMainViewController
     */
    public onClickTBItem(params: any = {}): void {
        const uiaction = this.getUIAction(params.tag);
        this.doUIAction(uiaction, params);
    }

    /**
     * 处理实体界面行为
     * 
     * @param {*} [uiaction={}] 
     * @param {*} [params={}] 
     * @returns {void} 
     * @memberof IBizMainViewController
     */
    public doUIAction(uiaction: any = {}, params: any = {}): void {

        if (uiaction && (typeof uiaction === 'string')) {
            uiaction = this.getUIAction(uiaction);
        }
        if (uiaction) {
            if (Object.is(uiaction.type, 'DEUIACTION')) {
                this.doDEUIAction(uiaction, params);
                return;
            }
            if (Object.is(uiaction.type, 'WFUIACTION')) {
                this.doWFUIAction(uiaction, params);
                return;
            }
        }
    }

    /**
     * 获取前台行为参数
     * 
     * @param {*} [uiaction={}] 行为
     * @param {*} [params={}] 
     * @returns {*} 
     * @memberof IBizMainViewController
     */
    public getFrontUIActionParam(uiaction: any = {}, params: any = {}): any {

        let arg: any = {};
        if (uiaction.refreshview) {
            arg.callback = function (win: any) {
                this.refresh();
            };
        }
        return arg;
    }

    /**
     * 获取后台行为参数
     * 
     * @param {*} [uiaction={}] 行为
     * @param {*} [params={}] 
     * @returns {*} 
     * @memberof IBizMainViewController
     */
    public getBackendUIActionParam(uiaction: any = {}, params: any = {}): any {
        let arg: any = {};
        return arg;
    }

    /**
     * 打开界面行为视图，前端实体界面行为
     * 
     * @param {*} [uiaction={}] 行为
     * @param {*} [viewparam={}]  视图参数
     * @memberof IBizMainViewController
     */
    public openUIActionView(uiaction: any = {}, viewparam: any = {}): void {
        let frontview = uiaction.frontview;
        frontview.viewparam = viewparam;


        if (Object.is(uiaction.fronttype, 'TOP')) {
            Object.assign(viewparam, { openerid: this.getId(), viewusage: this.getViewUsage() })
            this.openWindow(frontview.viewurl, viewparam);
            return;
        }

        this.openModal(frontview).subscribe((result) => {
            if (result && Object.is(result.ret, 'OK')) {
                if (uiaction.reload) {
                    this.onRefresh();
                }
            }
        });
        return;
    }

    /**
     * 执行实体行为
     * 
     * @param {*} [uiaction={}] 行为
     * @param {*} [params={}] 
     * @returns {void} 
     * @memberof IBizMainViewController
     */
    public doDEUIAction(uiaction: any = {}, params: any = {}): void {

        if (Object.is(uiaction.actionmode, 'FRONT')) {
            if ((Object.is(uiaction.fronttype, 'WIZARD')) || (Object.is(uiaction.fronttype, 'SHOWPAGE')) || (Object.is(uiaction.fronttype, 'TOP'))) {
                let viewparam = this.getFrontUIActionParam(uiaction, params);
                if (!viewparam) {
                    viewparam = {};
                }
                let frontview = uiaction.frontview;
                if (frontview.redirectview) {
                    this.redirectOpenView({ redirectUrl: frontview.backendurl, viewParam: viewparam });
                    return;
                }

                // 携带所有的实体界面行为参数
                this.openUIActionView(uiaction, viewparam);
                return;
            }

            if (Object.is(uiaction.fronttype, 'OPENHTMLPAGE')) {
                let viewparam = this.getFrontUIActionParam(uiaction, params);
                const _names: Array<any> = Object.keys(viewparam);
                let viewparam_arr: Array<string> = [];
                _names.forEach((name: string) => {
                    if (viewparam[name]) {
                        viewparam_arr.push(`${name}=${viewparam[name]}`);
                    }
                });
                const url = uiaction.htmlpageurl.indexOf('?') !== -1 ? `${uiaction.htmlpageurl}${viewparam_arr.join('&')}` : `${uiaction.htmlpageurl}?${viewparam_arr.join('&')}`;
                window.open(url, '_blank');
                return;
            }
        }

        if (Object.is(uiaction.actionmode, 'BACKEND')) {
            let param = this.getBackendUIActionParam(uiaction, params);
            if (!param) {
                return;
            }
            param.srfuiactionid = uiaction.tag;
            if (uiaction.confirmmsg) {
                this.iBizNotification.confirm('提示', uiaction.confirmmsg).subscribe((result) => {
                    if (result && Object.is(result, 'OK')) {
                        this.doBackendUIAction(param);
                    }
                });
            } else {
                this.doBackendUIAction(param);
            }
            return;
        }
        this.iBizNotification.error('错误', '未处理的实体行为[' + uiaction.tag + ']');
    }

    /**
     * 执行工作流行为
     * 
     * @param {*} [uiaction={}] 行为
     * @param {*} [params={}] 
     * @returns {void} 
     * @memberof IBizMainViewController
     */
    public doWFUIAction(uiaction: any = {}, params: any = {}): void {

        if (Object.is(uiaction.actionmode, 'WFFRONT')) {
            if (Object.is(uiaction.fronttype, 'WIZARD') || Object.is(uiaction.fronttype, 'SHOWPAGE')) {
                // let className: string;
                // if (uiaction.frontview.className) {
                //     className = uiaction.frontview.className;
                // } else {
                //     className = uiaction.frontview.classname;
                // }
                let opt: any = { viewparam: {} };
                let data: any = this.getFrontUIActionParam(uiaction, params);

                // opt.modalZIndex = this.modalZIndex;
                // opt.viewparam = {};
                if (data) {
                    Object.assign(opt.viewparam, data);
                }
                if (uiaction.frontview.viewParam) {
                    Object.assign(opt.viewparam, uiaction.frontview.viewParam);
                } else {
                    Object.assign(opt.viewparam, uiaction.frontview.viewparam);
                }
                Object.assign(opt, { modalviewname: uiaction.frontview.modalviewname, title: uiaction.frontview.title });

                // 打开模态框
                const modal = this.openModal(opt);
                modal.subscribe((result) => {
                    if (result && Object.is(result.ret, 'OK')) {
                        this.onWFUIFrontWindowClosed(result);
                    }
                });
                return;
            }
        }
        // IBiz.alert(IGM('IBIZAPP.CONFIRM.TITLE.ERROR','错误'),IGM('MAINVIEWCONTROLLER.DOWFUIACTION.INFO','未处理的实体工作流行为['+uiaction.tag+']',[uiaction.tag]), 2);
        this.iBizNotification.warning('错误', '未处理的实体工作流行为[' + uiaction.tag + ']');
    }

    /**
     * 关系工作流窗口对象
     * 
     * @param {*} win 
     * @param {*} [data={}] 
     * @memberof IBizMainViewController
     */
    public onWFUIFrontWindowClosed(win: any, data: any = {}): void {

    }

    /**
     * 执行后台行为
     * 
     * @param {*} [uiaction={}] 行为
     * @memberof IBizMainViewController
     */
    public doBackendUIAction(uiaction: any = {}): void {
        // IBiz.alert(IGM('IBIZAPP.CONFIRM.TITLE.ERROR','错误'),IGM('MAINVIEWCONTROLLER.DOBACKENDUIACTION.INFO','未处理的后台界面行为['+uiaction.tag+']',[uiaction.tag]), 2);
        this.iBizNotification.error('错误', '未处理的后台界面行为[' + uiaction.tag + ']');
    }

    /**
     * 是否-模式框显示
     * 
     * @returns {boolean} 
     * @memberof IBizMainViewController
     */
    public isShowModal(): boolean {
        return false;
    }

    /**
     * 关闭窗口
     * 
     * @memberof IBizMainViewController
     */
    public closeWindow(): void {
        if (this.isModal()) {
            this.closeModal({});
            return;
        }
        let win = this.getWindow();
        let viewParams: any = this.getViewParam();
        if (viewParams.ru && !Object.is(viewParams.ru, '') && (viewParams.ru.startsWith('https://') || viewParams.ru.startsWith('http://'))) {
            win.location.href = viewParams.ru;
            return;
        }
        win.close();
    }

    /**
     * 获取窗口对象
     * 
     * @returns {Window} 
     * @memberof IBizMainViewController
     */
    public getWindow(): Window {
        return window;
    }

    /**
     * 获取标题
     * 
     * @returns {string} 标题
     * @memberof IBizMainViewController
     */
    public getCaption(): string {
        return this.caption;
    }

    /**
     * 设置标题
     * 
     * @param {string} caption 标题
     * @memberof IBizMainViewController
     */
    public setCaption(caption: string): void {
        if (!Object.is(this.caption, caption)) {
            this.caption = caption;
            this.fire(IBizMainViewController.CAPTIONCHANGED, this);
        }
    }

    /**
     * 获取工具栏服务对象
     * 
     * @returns {*} 
     * @memberof IBizMainViewController
     */
    public getToolBar(): any {
        return this.getControl('toolbar');
    }

    /**
     * 获取工具栏服务对象
     *
     * @returns {*}
     * @memberof IBizMainViewController
     */
    public getToolBar2(): any {
        return this.getControl('toolbar2');
    }

    /**
     * 计算工具栏项状态-<例如 根据是否有选中数据,设置 工具栏按钮是否可点击>
     * 
     * @param {boolean} hasdata 是否有数据
     * @param {*} dataaccaction 
     * @memberof IBizMainViewController
     */
    public calcToolbarItemState(hasdata: boolean, dataaccaction: any): void {
        const toolbar = this.getToolBar();
        if (toolbar && toolbar.getItems().length > 0) {
            let items: Array<any> = toolbar.getItems();
            toolbar.setItemDisabled(items, !hasdata);
            toolbar.updateAccAction(items, Object.assign({}, this.dataaccaction, dataaccaction));
        }

        const toolbar2 = this.getToolBar2();
        if (toolbar2 && toolbar2.getItems().length > 0) {
            let items: Array<any> = toolbar2.getItems();
            toolbar2.setItemDisabled(items, !hasdata);
            toolbar2.updateAccAction(items, Object.assign({}, this.dataaccaction, dataaccaction));
        }
    }

    /**
     * 获取引用视图
     * 
     * @returns {*} 
     * @memberof IBizMainViewController
     */
    public getReferView(): any {
        return undefined;
    }

    /**
     * 打开重定向视图
     *
     * @param {*} view 打开视图的参数
     * @memberof IBizMainViewController
     */
    public redirectOpenView(view: any): void {
        let viewParam: any = {};
        viewParam.srfviewparam = JSON.stringify(view.viewParam);
        Object.assign(viewParam, { 'srfaction': 'GETRDVIEW' });
        this.iBizHttp.post(view.redirectUrl, viewParam).subscribe((response: any) => {
            if (!response.rdview || response.ret !== 0) {
                if (response.errorMessage) {
                    this.iBizNotification.info('错误', response.errorMessage);
                }
                return;
            }
            if (response.rdview && response.rdview.viewurl && response.ret === 0) {
                if (response.rdview.srfkey || Object.is(response.rdview.srfkey, '')) {
                    view.viewParam.srfkey = response.rdview.srfkey;
                    view.viewParam.srfkeys = response.rdview.srfkey;
                }
                if (response.rdview.srfviewparam) {
                    Object.assign(view.viewParam, response.rdview.srfviewparam);
                }

                let routeLink: string = response.rdview.viewurl;
                if (routeLink.lastIndexOf('.jsp') !== -1) {
                    this.iBizNotification.error('错误', `视图类型jsp不支持，请检查配置`);
                    return;
                }
            } else {
                this.iBizNotification.info('错误', '重定向视图信息获取错误,无法打开!');
            }
        }, (error: any) => {
            this.iBizNotification.info('错误', error.info);
        });
    }

    /**
     * 实体数据发生变化
     *
     * @param {*} [dataaccaction={}]
     * @memberof IBizMainViewController
     */
    public onDataAccActionChange(dataaccaction: any = {}): void {

    }

    /**
     * 是否自由布局
     *
     * @returns {boolean}
     * @memberof IBizMainViewController
     */
    public isFreeLayout(): boolean {
        return false;
    }

    /**
     * 设置视图标题
     *
     * @static
     * @memberof IBizMainViewController
     */
    public static CAPTIONCHANGED = 'CAPTIONCHANGED';

    /**
     * 视图模型加载完成
     *
     * @static
     * @memberof IBizMainViewController
     */
    public static VIEWMODELLOADED = 'VIEWMODELLOADED';
}