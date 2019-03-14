import { Subject } from 'rxjs';

/**
 * IBizApp 应用
 * 调用 getInstance() 获取实列
 *
 * @class IBizApp
 */
export class IBizApp {

    /**
     * 获取 IBizApp 单列对象
     *
     * @static
     * @returns {IBizApp}
     * @memberof IBizApp
     */
    public static getInstance(): IBizApp {
        if (!IBizApp.iBizApp) {
            IBizApp.iBizApp = new IBizApp();
        }
        return IBizApp.iBizApp;
    }

    /**
     * 单列变量声明  
     *
     * @private
     * @static
     * @type {IBizApp}
     * @memberof IBizApp
     */
    private static iBizApp: IBizApp;

    /**
     * 当前窗口所有视图控制器  
     *
     * @type {Array<any>}
     * @memberof IBizApp
     */
    public viewControllers: Array<any> = [];

    /**
     * 父窗口window对象
     *
     * @type {*}
     * @memberof IBizApp
     */
    public parentWindow: any = null;

    /**
     * rxjs 流观察对象
     *
     * @private
     * @type {Subject<any>}
     * @memberof IBizApp
     */
    private subject: Subject<any> = new Subject();

    /**
     * postMessage 流观察对象
     *
     * @private
     * @type {Subject<any>}
     * @memberof IBizApp
     */
    private postMessage: Subject<any> = new Subject();

    /**
     * 主题颜色
     *
     * @type {string}
     * @memberof IBizApp
     */
    private themeClass: string = '';

    /**
     * 字体
     *
     * @private
     * @type {string}
     * @memberof IBizApp
     */
    private fontFamily: string = '';

    /**
     * app应用功能数据
     *
     * @private
     * @type {string}
     * @memberof IBizApp
     */
    private appData: string = '';

    /**
     * Creates an instance of IBizApp.
     * 私有构造，拒绝通过 new 创建对象
     * 
     * @memberof IBizApp
     */
    private constructor() {
        const win: any = window;
        win.addEventListener('message', (message: any) => {
            if (message.data && Object.is(message.data.ret, 'OK')) {
                this.firePostMessage(message.data);
            }
        }, false);
    }

    /**
     * 注册视图控制
     *
     * @param {*} ctrler
     * @memberof IBizApp
     */
    public regSRFController(ctrler: any): void {
        this.viewControllers.push(ctrler);
    }

    /**
     * 注销视图控制器
     *
     * @param {*} ctrler
     * @memberof IBizApp
     */
    public unRegSRFController(ctrler: any): void {
        const id = ctrler.getId();
        const viewUsage = ctrler.getViewUsage();
        const index = this.viewControllers.findIndex((ctrl: any) => Object.is(id, ctrl.getId()) && Object.is(viewUsage, ctrl.getViewUsage()));
        if (index !== -1) {
            this.viewControllers[index] = null;
            this.viewControllers.splice(index, 1);
        }
    }

    /**
     * 注销视图控制器
     *
     * @param {string} id 视图id
     * @param {number} viewUsage 视图使用模式
     * @memberof IBizApp
     */
    public unRegSRFController2(id: string, viewUsage: number): void {
        const index = this.viewControllers.findIndex((ctrl: any) => Object.is(id, ctrl.getId()) && Object.is(viewUsage, ctrl.getViewUsage()));
        if (index !== -1) {
            this.viewControllers[index] = null;
            this.viewControllers.splice(index, 1);
        }
    }

    /**
     * 获取视图控制器
     *
     * @param {string} id 视图id
     * @param {number} viewUsage 视图使用模式
     * @returns {*}
     * @memberof IBizApp
     */
    public getSRFController(id: string, viewUsage: number): any {
        let viewController = null;
        const index = this.viewControllers.findIndex((ctrl: any) => Object.is(id, ctrl.getId()) && Object.is(viewUsage, ctrl.getViewUsage()));
        if (index !== -1) {
            viewController = this.viewControllers[index];
        }
        return viewController;
    }

    /**
     * 获取父视图控制器
     *
     * @param {string} id 视图id
     * @param {number} viewUsage 视图使用模式
     * @returns {*}
     * @memberof IBizApp
     */
    public getParentController(id: string, viewUsage: number): any {
        let viewController = null;
        const index = this.viewControllers.findIndex((ctrl: any) => Object.is(id, ctrl.getId()) && Object.is(viewUsage, ctrl.getViewUsage()));
        if (index !== -1) {
            viewController = this.viewControllers[index - 1];
        }
        return viewController;
    }

    /**
     * 注册父窗口window 对象
     *
     * @param {Window} win
     * @memberof IBizApp
     */
    public regParentWindow(win: Window): void {
        this.parentWindow = win;
    }

    /**
     * 获取父窗口window 对象
     *
     * @returns {Window}
     * @memberof IBizApp
     */
    public getParentWindow(): Window {
        return this.parentWindow;
    }

    /**
     * 订阅刷新视图事件
     *
     * @returns {Subject<any>}
     * @memberof IBizApp
     */
    public onRefreshView(): Subject<any> {
        return this.subject;
    }

    /**
     * 通知视图刷新事件
     *
     * @param {*} data
     * @memberof IBizApp
     */
    public fireRefreshView(data: any = {}): void {
        this.subject.next(data);
    }

    /**
     * 订阅postMessage对象
     *
     * @returns {Subject<any>}
     * @memberof IBizApp
     */
    public onPostMessage(): Subject<any> {
        return this.postMessage;
    }

    /**
     * 处理postMessage对象
     *
     * @param {*} [data={}]
     * @memberof IBizApp
     */
    public firePostMessage(data: any = {}): void {
        this.postMessage.next(data);
    }

    /**
     * 设置主题颜色
     *
     * @param {string} name
     * @memberof IBizApp
     */
    public setThemeClass(name: string): void {
        this.themeClass = name;
        // Cookies.set('theme-class', name);
    }

    /**
     * 获取主题颜色
     *
     * @returns {string}
     * @memberof IBizApp
     */
    public getThemeClass(): string {
        if (Object.is(this.themeClass, '')) {
            // let name = Cookies.get('theme-class');
            // if (name) {
            //     return name;
            // }
            return 'ibiz-default-theme';
        } else {
            return this.themeClass;
        }
    }

    /**
     * 设置字体
     *
     * @param {string} font
     * @memberof IBizApp
     */
    public setFontFamily(font: string): void {
        this.fontFamily = font;
        // Cookies.set('font-family', font);
    }

    /**
     * 获取字体
     *
     * @returns {string}
     * @memberof IBizApp
     */
    public getFontFamily(): string {
        if (Object.is(this.fontFamily, '')) {
            // let font = Cookies.get('font-family');
            // if (font) {
            //     return font;
            // }
            return '';
        } else {
            return this.fontFamily;
        }
    }

    /**
     * 获取应用功能数据
     *
     * @returns {string}
     * @memberof IBizApp
     */
    public getAppData(): string {
        return this.appData;
    }

    /**
     * 设置应用功能数据
     *
     * @param {string} appdata
     * @memberof IBizApp
     */
    public setAppData(appdata: string) {
        this.appData = appdata;
    }
}

// 初始化IBizApp 对象， 挂载在window对象下
(() => {
    let win: any = window;
    if (!win.iBizApp) {
        win.iBizApp = IBizApp.getInstance();
    }
    win.getIBizApp = function () {
        if (!win.iBizApp) {
            win.iBizApp = IBizApp.getInstance();
        }
        return win.iBizApp;
    };

    if (window.opener && window.opener.window) {
        IBizApp.getInstance().regParentWindow(window.opener.window);
    }
})();

