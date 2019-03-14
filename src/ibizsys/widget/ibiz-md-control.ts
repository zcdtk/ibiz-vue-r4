import { IBizControl } from './ibiz-control';

/**
 * 多项数据部件服务对象
 * 
 * @export
 * @class IBizMDControl
 * @extends {IBizControl}
 */
export class IBizMDControl extends IBizControl {

    /**
     * 多数据列头
     *
     * @type {*}
     * @memberof IBizMDControl
     */
    public columns: Array<any> = [];

    /**
     * 默认排序
     *
     * @type {*}
     * @memberof IBizMDControl
     */
    public defaultSort: any = {};

    /**
     * 所有数据项
     * 
     * @type {Array<any>}
     * @memberof IBizMDControl
     */
    public items: Array<any> = [];

    /**
     * 选中数据项
     * 
     * @type {Array<any>}
     * @memberof IBizMDControl
     */
    public selection: Array<any> = [];


    /**
     * Creates an instance of IBizMDControl.
     * 创建 IBizMDControl 实例 
     * 
     * @param {*} [opts={}] 
     * @memberof IBizMDControl
     */
    constructor(opts: any = {}) {
        super(opts);
        this.regColumns();
    }

    /**
     * 加载数据
     * 
     * @param {*} [arg={}] 
     * @returns {void} 
     * @memberof IBizMDControl
     */
    public load(arg: any = {}): void {

    }

    /**
     * 刷新数据
     * @param arg 
     */
    public refresh(arg: any = {}): void {

    }

    /**
     * 设置选中项
     * 
     * @param {Array<any>} selection 
     * @memberof IBizMDControl
     */
    public setSelection(selection: Array<any>): void {
        this.selection = selection;
        this.fire(IBizMDControl.SELECTIONCHANGE, this.selection);
    }

    /**
     * 选中对象
     * 
     * @param {*} [item={}] 
     * @returns {void} 
     * @memberof IBizMDControl
     */
    public clickItem(item: any = {}): void {
        if (this.isLoading) {
            return;
        }
        this.setSelection([item]);
    }

    /**
     * 
     * 
     * @param {any} item 
     * @memberof IBizMDControl
     */
    public activeItem(item: any): void {

    }

    /**
     * 获取列表中某条数据
     * 
     * @param {string} name 字段
     * @param {string} value 名称
     * @returns {*} 
     * @memberof IBizMDControl
     */
    public findItem(name: string, value: string): any {
        let item: any;
        this.items.forEach((element: any) => {
            if (Object.is(element[name], value)) {
                item = element;
                return;
            }
        });
        return item;
    }

    /**
     * 删除数据
     * 
     * @param {*} [arg={}] 
     * @memberof IBizMDControl
     */
    public remove(arg: any = {}): void {

    }

    /**
     * 单选
     * 
     * @memberof IBizMDControl
     */
    public onItemSelect(value: boolean, item: any): void {

    }

    /**
     * 全选
     * 
     * @param {boolean} value 
     * @memberof IBizMDControl
     */
    public selectAll(value: boolean): void {

    }

    /**
     * 获取选中行
     * 
     * @returns {Array<any>} 
     * @memberof IBizMDControl
     */
    public getSelection(): Array<any> {
        return this.selection;
    }

    /**
     * 工作流提交
     * 
     * @param {*} [params={}] 
     * @memberof IBizMDControl
     */
    public wfsubmit(params: any = {}): void {
        if (!params) {
            params = {};
        }
        Object.assign(params, { srfaction: 'wfsubmit', srfctrlid: this.getName() });
        this.beginLoading();
        this.iBizHttp.post(this.getBackendUrl(), params).subscribe((data) => {
            this.endLoading();
            if (data.ret === 0) {
                this.refresh();
            } else {
                this.iBizNotification.error('', '执行工作流操作失败,' + data.info);
            }
        }, (error) => {
            this.endLoading();
            this.iBizNotification.error('', '执行工作流操作失败,' + error.info);
        });
    }

    /**
     * 实体界面行为
     * 
     * @param {*} [params={}] 
     * @memberof IBizMDControl
     */
    public doUIAction(arg: any = {}): void {
        let params: any = {};
        if (arg) {
            Object.assign(params, arg);
        }
        Object.assign(params, { srfaction: 'uiaction', srfctrlid: this.getName() });
        this.beginLoading();
        this.iBizHttp.post(this.getBackendUrl(), params).subscribe((data) => {
            this.endLoading();
            if (data.ret === 0) {
                if (data.reloadData) {
                    this.refresh();
                }
                if (data.info && !Object.is(data.info, '')) {
                    this.iBizNotification.success('', '操作成功');
                }
                // IBizUtil.processResult(data);
            } else {
                this.iBizNotification.error('操作失败', '操作失败,执行操作发生错误,' + data.info);
            }
        }, (error) => {
            this.endLoading();
            this.iBizNotification.error('操作失败', '操作失败,执行操作发生错误,' + error.info);
        });
    }

    /**
     * 批量添加
     * 
     * @param {*} [arg={}] 
     * @memberof IBizMDControl
     */
    public addBatch(arg: any = {}): void {
        let params: any = {};
        if (arg) {
            Object.assign(params, arg);
        }

        Object.assign(params, { srfaction: 'addbatch', srfctrlid: this.getName() });
        this.beginLoading();
        this.iBizHttp.post(this.getBackendUrl(), params).subscribe((data) => {
            this.endLoading();
            if (data.ret === 0) {
                this.refresh();
                this.fire(IBizMDControl.ADDBATCHED, data);
            } else {
                this.iBizNotification.error('添加失败', '执行批量添加失败,' + data.info);
            }
        }, (error) => {
            this.endLoading();
            this.iBizNotification.error('添加失败', '执行批量添加失败,' + error.info);
        });
    }

    /**
     * 获取所有数据项
     * 
     * @returns {Array<any>} 
     * @memberof IBizMDControl
     */
    public getItems(): Array<any> {
        return this.items;
    }

    /**
     * 注册多数据列头
     * 
     * @memberof IBizMDControl
     */
    public regColumns(): void {

    }

    /**
     * 获取多数据列头
     *
     * @returns {*}
     * @memberof IBizMDControl
     */
    public getColumns(): any {
        return this.columns;
    }

    /**
     * 设置多数据列头
     * 
     * @param {*} [column={}] 
     * @returns {void} 
     * @memberof IBizMDControl
     */
    public regColumn(column: any = {}): void {
        if (Object.keys(column).length === 0) {
            return;
        }
        if (!this.columns) {
            this.columns = [];
        }
        this.columns.push(column);
    }

    /**
     * 多数据项界面_数据导入栏
     * 
     * @memberof IBizMDControl
     */
    public doImportData(name: string): void {
        if (Object.is(name, '')) {
            return;
        }
        // this.nzModalService.open({
        //     content: IBizImportdataViewComponent,
        //     wrapClassName: 'ibiz_wrap_modal',
        //     componentParams: { dename: name },
        //     footer: false,
        //     maskClosable: false,
        //     width: 500,
        // }).subscribe((result) => {
        //     if (result && result.ret) {
        //         this.refresh();
        //     }
        // });
    }

    /**
     * 界面行为
     *
     * @param {string} tag
     * @param {*} [data={}]
     * @memberof IBizMDControl
     */
    public uiAction(tag: string, data: any = {}) {

    }

    /**
     * 渲染绘制多项数据
     *
     * @param {Array<any>} items
     * @returns {Array<any>}
     * @memberof IBizMDControl
     */
    public rendererDatas(items: Array<any>): Array<any> {
        return items;
    }


    /*****************事件声明************************/

    /**
     * 添加数据
     *
     * @static
     * @memberof IBizMDControl
     */
    public static ADDBATCHED = 'ADDBATCHED';

    /**
     * 加载之前
     *
     * @static
     * @memberof IBizMDControl
     */
    public static BEFORELOAD = 'BEFORELOAD';

    /**
     * 加载完成
     *
     * @static
     * @memberof IBizMDControl
     */
    public static LOADED = 'LOADED';

    /**
     * 行数据选中
     *
     * @static
     * @memberof IBizMDControl
     */
    public static SELECTIONCHANGE = 'SELECTIONCHANGE';

    /**
     * 实体界面行为
     *
     * @static
     * @memberof IBizMDControl
     */
    public static UIACTION = 'UIACTION';
}

