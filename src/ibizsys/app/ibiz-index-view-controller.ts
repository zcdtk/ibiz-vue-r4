import { IBizAppMenu } from './../widget/ibiz-app-menu';
import { IBizMainViewController } from "./ibiz-main-view-controller";

/**
 * 首页应用视图
 *
 * @class IBizIndexViewController
 * @extends {IBizMainViewController}
 */
export class IBizIndexViewController extends IBizMainViewController {

    /**
     * 默认打开视图
     *
     * @type {*}
     * @memberof IBizIndexViewController
     */
    public defOpenView: any = {};

    /**
     * Creates an instance of IBizIndexViewController.
     * 创建 IBizIndexViewController 实例
     * 
     * @param {*} [opts={}]
     * @memberof IBizIndexViewController
     */
    constructor(opts: any = {}) {
        super(opts);
        this.regDefOpenView();
    }

    /**
     * 应用菜单部件初始化
     * 
     * @memberof IBizIndexViewController
     */
    public onInitComponents(): void {
        super.onInitComponents();

        const appMenu = this.getAppMenu();
        if (appMenu) {
            // 菜单加载完成
            appMenu.on(IBizAppMenu.LOADED).subscribe((items: any[]) => {
                this.appMenuLoaded(items);
            });
            // 菜单选中
            appMenu.on(IBizAppMenu.MENUSELECTION).subscribe((items: any[]) => {
                this.appMenuSelection(items);
            });
        }
    }

    /**
     * 部件加载
     * 
     * @memberof IBizIndexViewController
     */
    public onLoad(): void {
        super.onLoad();

        const appMenu = this.getAppMenu();
        if (appMenu) {
            appMenu.load();
        }
        this.setMianMenuState();
    }

    /**
     * 应用菜单部件加载完成,调用基类处理
     * 
     * @private
     * @param {any[]} items 
     * @memberof IBizIndexViewController
     */
    public appMenuLoaded(items: any[]): void {
        let matched: Array<any> = this.$route.matched;
        let appMenu: any = this.getAppMenu();
        if (matched[this.route_index + 1]) {
            const next_route_name = matched[this.route_index + 1].name;
            let _app = appMenu.getAppFunction('', next_route_name);
            let _item: any = {};
            if (_app && Object.keys(_app).length > 0) {
                Object.assign(_item, appMenu.getSelectMenuItem(items, _app));
            }
            if (Object.keys(_item).length > 0) {
                appMenu.setAppMenuSelected(_item);
            }
        } else if (this.defOpenView && Object.keys(this.defOpenView).length > 0) {
            let defView: any = {};
            let _app = appMenu.getAppFunction('', this.defOpenView.routepath);
            if (_app) {
                Object.assign(defView, appMenu.getSelectMenuItem(items, _app), _app);
            }
            if (Object.keys(defView).length > 0) {
                appMenu.setAppMenuSelected(defView);
                this.appMenuSelection([defView]);
            }
        } else {
            let firstItem: any = {};

            Object.assign(firstItem, this.getFirstMenuItem(items));

            if (firstItem && Object.keys(firstItem).length > 0) {
                appMenu.setAppMenuSelected(firstItem);
                this.appMenuSelection([firstItem]);
            }
        }
    }

    /**
     * 应用菜单选中
     *
     * @param {Array<any>} items
     * @memberof IBizIndexViewController
     */
    public appMenuSelection(items: Array<any>): void {
        let item: any = {};
        Object.assign(item, items[0]);
        this.getAppMenu().setAppMenuSelected(items[0]);
        if (Object.is(item.functype, 'APPVIEW')) {
            // 打开应用视图
            this.openView(item.routepath, item.openviewparam);
        } else if (Object.is(item.functype,'OPENHTMLPAGE')) {
            // 打开HTML页面
            window.open(item.htmlPageUrl, '_blank');
        }
    }

    /**
     * 获取表单项
     * 
     * @returns {*} 
     * @memberof IBizIndexViewController
     */
    public getAppMenu(): any {
        return this.getControl('appmenu');
    }

    /**
     * 设置主菜单状态
     *
     * @param {string} [align]
     * @memberof IBizIndexViewController
     */
    public setMianMenuState(align?: string): void {
    }

    /**
     * 注册默认打开视图
     *
     * @memberof IBizIndexViewController
     */
    public regDefOpenView(): void {

    }

    /**
     * 获取第一个带导航内容的菜单数据
     *
     * @private
     * @param {Array<any>} items
     * @returns {*}
     * @memberof IBizIndexViewController
     */
    private getFirstMenuItem(items: Array<any>): any {
        let app: any = {};
        let appMenu: any = this.getAppMenu();
        items.some((_item: any) => {
            let _app = appMenu.getAppFunction(_item.appfuncid, '');
            if (_app && Object.keys(_app).length > 0) {
                Object.assign(app, _item, _app);
                return true;
            }
            if (_item.items && _item.items.length > 0) {
                let subapp = this.getFirstMenuItem(_item.items);
                if (subapp && Object.keys(subapp).length > 0) {
                    Object.assign(app, _item, subapp);
                    return true;
                }
            }
            return false;
        });
        return app;
    }

}
