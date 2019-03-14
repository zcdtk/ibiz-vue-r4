import { IBizControl } from './ibiz-control';

/**
 * 应用菜单
 *
 * @class IBizAppMenu
 * @extends {IBizControl}
 */
export class IBizAppMenu extends IBizControl {

    /**
     * 应用功能数据
     *
     * @type {Array<any>}
     * @memberof IBizAppMenu
     */
    public appFunctions: Array<any> = [];

    /**
     * 展开数据项
     *
     * @type {Array<string>}
     * @memberof IBizAppMenu
     */
    public expandItems: Array<string> = [];

    /**
     * 菜单数据项
     * 
     * @type {any[]}
     * @memberof IBizAppMenu
     */
    public items: Array<any> = [];

    /**
     * 导航树部件是否收缩，默认展开
     *
     * @type {boolean}
     * @memberof IBizAppMenu
     */
    public isCollapsed: boolean = true;

    /**
     * 菜单宽度
     *
     * @type {number}
     * @memberof IBizAppMenu
     */
    public width: number = 240;

    /**
     * 选中项
     *
     * @type {*}
     * @memberof IBizAppMenu
     */
    public selectItem: any = {};

    /**
     * Creates an instance of IBizAppMenu.
     * 创建 IBizAppMenu 实例
     * 
     * @param {*} [opts={}]
     * @memberof IBizAppMenu
     */
    constructor(opts: any = {}) {
        super(opts);
        this.setAppFunctions();
    }

    /**
     * 设置应用功能参数
     *
     * @memberof IBizAppMenu
     */
    public setAppFunctions(): void {
    }

    /**
     * 
     *
     * @param {string} [appfuncid]
     * @param {string} [routepath]
     * @returns {*}
     * @memberof IBizAppMenu
     */
    public getAppFunction(appfuncid?: string, routepath?: string): any {
        let appfunc: any = {};
        this.appFunctions.some((_appFunction: any = {}) => {
            if (appfuncid && Object.is(appfuncid, _appFunction.appfuncid)) {
                Object.assign(appfunc, _appFunction);
                return true;
            }
            if (routepath && Object.is(routepath, _appFunction.routepath)) {
                Object.assign(appfunc, _appFunction);
                return true;
            }
            return false
        });
        return appfunc;
    }

    /**
     * 部件加载
     * 
     * @memberof IBizAppMenu
     */
    public load(): void {
        const params: any = { srfctrlid: this.getName(), srfaction: 'FETCH' };
        this.iBizHttp.post(this.getBackendUrl(), params).subscribe((success: any) => {
            if (success.ret === 0) {
                this.items = success.items;
                this.fire(IBizAppMenu.LOADED, this.items);
            }
        }, error => {
            console.log(error);
        });
    }

    /**
     * 菜单选中
     *
     * @param {*} [item={}]
     * @returns {*}
     * @memberof IBizAppMenu
     */
    public onSelectChange(item: any = {}): any {
        // tslint:disable-next-line:prefer-const
        let _item = {};
        Object.assign(_item, item);
        const _appFunction: any = this.appFunctions.find(appfunction => Object.is(appfunction.appfuncid, item.appfuncid));
        if (!_appFunction) {
            return;
        }
        Object.assign(_item, _appFunction);
        this.fire(IBizAppMenu.MENUSELECTION, [_item]);
    }

    /**
     * 设置选中菜单
     *
     * @param {*} [item={}]
     * @memberof IBizAppMenu
     */
    public setAppMenuSelected(item: any = {}): void {
        if (item && Object.keys(item).length > 0) {
            Object.assign(this.selectItem, item);
        }
    }

    /**
     * 根据应用功能数据获取菜单数据项
     *
     * @param {Array<any>} items
     * @param {*} [appfunction={}]
     * @returns {*}
     * @memberof IBizAppMenu
     */
    public getSelectMenuItem(items: Array<any>, appfunction: any = {}): any {
        // tslint:disable-next-line:prefer-const
        let item = {};
        items.some((_item: any) => {
            if (Object.is(_item.appfuncid, appfunction.appfuncid)) {
                Object.assign(item, _item);
                return true;
            }
            if (_item.items) {
                const subItem = this.getSelectMenuItem(_item.items, appfunction);
                if (subItem && Object.keys(subItem).length > 0) {
                    Object.assign(item, subItem);
                    return true;
                }
            }
            return false
        });
        return item;
    }

    /**
    * 获取菜单数据
    *
    * @returns {Array<any>}
    * @memberof IBizAppMenu
    */
    public getItems(): Array<any> {
        return this.items;
    }

    /**
     * 根据菜单节点获取菜单数据项
     *
     * @param {Array<any>} items 菜单数据项
     * @param {*} [data={}] 
     * @returns {*}
     * @memberof IBizAppMenu
     */
    public getItem(items: Array<any>, data: any = {}): any {
        let _this = this;
        let _item: any = {};
        items.some((item: any) => {
            if (Object.is(item.id, data.id)) {
                Object.assign(_item, item);
                return true;
            }
            if (item.items && item.items.length > 0 && Array.isArray(item.items)) {
                let _subItem = _this.getItem(item.items, data);
                if (_subItem && Object.keys(_subItem).length > 0) {
                    Object.assign(_item, _subItem);
                    return true;
                }
            }
            return false
        });
        return _item;
    }

    /**
     * 菜单收缩
     *
     * @memberof IBizAppMenu
     */
    public collapseChange(): void {
        this.isCollapsed = !this.isCollapsed;
        this.width = (this.isCollapsed ? 240 : 64);
    }

    /**
     * 菜单加载
     *
     * @static
     * @memberof IBizAppMenu
     */
    public static LOADED = 'LOADED';

    /**
     * 菜单选中
     *
     * @static
     * @memberof IBizAppMenu
     */
    public static MENUSELECTION = 'MENUSELECTION';
}
