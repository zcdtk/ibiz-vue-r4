import { IBizControl } from './ibiz-control';

/**
 * 工具栏
 *
 * @class IBizToolbar
 * @extends {IBizControl}
 */
export class IBizToolbar extends IBizControl {

    /**
     * 数据导出下拉菜单状态
     *
     * @type {boolean}
     * @memberof IBizToolbar
     */
    public exportMenuState: boolean = false;

    /**
     * 导出起始页
     * 
     * @type {string}
     * @memberof IBizToolbar
     */
    public exportStartPage: any;

    /**
     * 导出结束页
     * 
     * @type {string}
     * @memberof IBizToolbar
     */
    public exportEndPage: any;

    /**
     * 工具栏按钮
     * 
     * @type {Array<any>}
     * @memberof IBizToolbar
     */
    public items: Array<any> = [];

    /**
     * Creates an instance of IBizToolbar.
     * 创建IBizToolbar的一个实例。
     * 
     * @param {*} [opts={}] 
     * @memberof IBizToolbar
     */
    constructor(opts: any = {}) {
        super(opts);
        this.regToolBarItems();
    }

    /**
     * 注册所有工具栏按钮
     * 
     * @memberof IBizToolbar
     */
    public regToolBarItems(): void {

    }

    /**
     * 注册工具栏按钮
     * 
     * @param {*} [item={}] 
     * @memberof IBizToolbar
     */
    public regToolBarItem(item: any = {}): void {
        if (Object.keys(item).length === 0) {
            return;
        }

        this.items.push(item);
    }

    /**
     * 获取工具栏按钮
     * 
     * @returns {Array<any>} 
     * @memberof IBizToolbar
     */
    public getItems(): any {
        if (!this.items) {
            this.items = [];
        }
        return this.items;
    }

    /**
     * 获取工具栏项
     *
     * @param {Array<any>} items
     * @param {string} name
     * @returns {*}
     * @memberof IBizToolbar
     */
    public getItem(items: Array<any>, name: string): any {
        let data: any = {};
        items.some((_item: any) => {
            if (Object.is(_item.name, name)) {
                data = _item;
                return true;
            }
            if (_item.items && _item.items.length > 0) {
                let subItem = this.getItem(_item.items, name);
                if (Object.keys(subItem).length > 0) {
                    data = subItem;
                    return true;
                }
            }
            return false;
        });
        return data;
    }

    /**
     * 设置工具栏按钮项是否启用
     *
     * @param {Array<any>} items
     * @param {boolean} disabled
     * @memberof IBizToolbar
     */
    public setItemDisabled(items: Array<any>, disabled: boolean): void {
        items.forEach((_item: any) => {
            if (_item.uiaction && (Object.is(_item.uiaction.target, 'SINGLEKEY') || Object.is(_item.uiaction.target, 'MULTIKEY'))) {
                _item.disabled = disabled;
            }
            if (_item.uiaction && Object.is(_item.uiaction.tag, 'NewRow')) {
                _item.disabled = false;
            }
            if (_item.items && _item.items.length > 0) {
                this.setItemDisabled(_item.items, disabled);
            }
        });
    }

    /**
     * 更新权限
     *
     * @param {Array<any>} items
     * @param {*} [action={}]
     * @memberof IBizToolbar
     */
    public updateAccAction(items: Array<any>, action: any = {}): void {
        items.forEach((_item: any) => {
            const dataaccaction = _item.dataaccaction;
            const state = (dataaccaction && !Object.is(dataaccaction, '')) && (action && Object.keys(action).length > 0 && action[dataaccaction] !== 1);
            _item._dataaccaction = state ? false : true;
            if (_item.items && _item.items.length > 0) {
                this.updateAccAction(_item.items, action);
            }
        });
    }

    /**
     * 工具栏导出功能设置
     * 
     * @param {string} type 
     * @param {string} [itemTag] 
     * @memberof IBizToolbar
     */
    public itemExportExcel(type: string, itemTag?: string): void {
        // tslint:disable-next-line:prefer-const
        let params: any = { tag: type };
        if (itemTag && Object.is(itemTag, 'all')) {
            Object.assign(params, { itemTag: 'all' });
        } else if (itemTag && Object.is(itemTag, 'custom')) {
            if (!this.exportStartPage || !this.exportEndPage) {
                this.iBizNotification.warning('警告', '请输入起始页');
                return;
            }
            const startPage: any = Number.parseInt(this.exportStartPage, 10);
            const endPage: any = Number.parseInt(this.exportEndPage, 10);
            if (Number.isNaN(startPage) || Number.isNaN(endPage)) {
                this.iBizNotification.warning('警告', '请输入有效的起始页');
                return;
            }

            if (startPage < 1 || endPage < 1 || startPage > endPage) {
                this.iBizNotification.warning('警告', '请输入有效的起始页');
                return;
            }
            Object.assign(params, { exportPageStart: startPage, exportPageEnd: endPage, itemTag: 'custom' });
        }
        this.exportMenuState = false;
        this.fire(IBizToolbar.ITEMCLICK, params);
    }

    /**
     * 点击按钮
     * 
     * @param {string} type  界面行为类型
     * @memberof IBizToolbar
     */
    public itemclick(_item: any = {}): void {
        let item = this.getItem(this.items, _item.name);
        if (Object.is(item.tag, 'ToggleRowEdit')) {
            item.rowedit = !item.rowedit
            item.caption = item.rowedit ? '开启行编辑' : '关闭行编辑';
        }
        if (Object.is(item.tag, 'ToggleFilter')) {
            item.opensearchform = !item.opensearchform;
            item.caption = item.opensearchform ? '收起' : '过滤';
        }
        if (!_item.uiaction) {
            return;
        }
        this.fire(IBizToolbar.ITEMCLICK, { tag: _item.uiaction.tag });
    }

    /**
     * 点击按钮事件
     *
     * @static
     * @memberof IBizToolbar
     */
    public static ITEMCLICK = 'ITEMCLICK';
}

