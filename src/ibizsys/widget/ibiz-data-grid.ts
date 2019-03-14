import { IBizUtil } from './../util/ibiz-util';
import { IBizMDControl } from './ibiz-md-control';
import { Subject } from 'rxjs';
import { IBizEnvironment } from '@/environments/ibiz-environment';

/**
 * 表格
 *
 * @class IBizDataGrid
 * @extends {IBizMDControl}
 */
export class IBizDataGrid extends IBizMDControl {

    /**
     * 查询开始条数
     * 
     * @memberof IBizGrid
     */
    public start = 0;

    /**
     * 每次加载条数
     * 
     * @memberof IBizGrid
     */
    public limit = 20;

    /**
     * 总条数
     * 
     * @memberof IBizGrid
     */
    public totalrow = 0;

    /**
     * 当前显示页码
     * 
     * @memberof IBizGrid
     */
    public curPage = 1;

    /**
     * 是否全选
     * 
     * @memberof IBizGrid
     */
    public allChecked = false;

    /**
     * 表格行选中动画
     * 
     * @memberof IBizGrid
     */
    public indeterminate = false;

    /**
     * 是否分页设置
     * 
     * @type {boolean}
     * @memberof IBizGrid
     */
    public pageChangeFlag: boolean = true;

    /**
     * 表格全部排序字段
     * 
     * @type {Array<any>}
     * @memberof IBizGrid
     */
    public gridSortField: Array<any> = [];

    /**
     * 行多项选中设置，用于阻塞多次触发选中效果
     *
     * @private
     * @type {boolean}
     * @memberof IBizGrid
     */
    private rowsSelection: boolean = false;

    /**
     * 是否支持多项
     * 
     * @type {boolean}
     * @memberof IBizGrid
     */
    public multiSelect: boolean = true;

    /**
     * 是否启用行编辑
     *
     * @type {boolean}
     * @memberof IBizGrid
     */
    public isEnableRowEdit: boolean = false;

    /**
     * 打开行编辑
     *
     * @type {boolean}
     * @memberof IBizGrid
     */
    public openRowEdit: boolean = false;

    /**
     * 表格编辑项集合
     *
     * @type {*}
     * @memberof IBizGrid
     */
    public editItems: any = {};

    /**
     * 编辑行数据处理
     *
     * @type {*}
     * @memberof IBizGrid
     */
    public state: any = {};

    /**
     * 备份数据
     *
     * @type {Array<any>}
     * @memberof IBizGrid
     */
    public backupDatas: Array<any> = [];

    /**
     * 编辑行保存结果
     *
     * @type {Array<any>}
     * @memberof IBizDataGrid
     */
    public editorRowsSaveResult: Array<any> = [];

    /**
     * 最大导出行数
     *
     * @type {number}
     * @memberof IBizGrid
     */
    public maxExportRow: number = 1000;

    /**
     * Creates an instance of IBizGrid.
     * 创建 IBizGrid 实例
     * 
     * @param {*} [opts={}] 
     * @memberof IBizGrid
     */
    constructor(opts: any = {}) {
        super(opts);
        this.regEditItems();
    }

    /**
     * 加载数据
     *
     * @param {*} [arg={}]
     * @returns {void}
     * @memberof IBizGrid
     */
    public load(arg: any = {}): void {
        // tslint:disable-next-line:prefer-const
        let opt: any = {};
        Object.assign(opt, arg);
        Object.assign(opt, { srfctrlid: this.getName(), srfaction: 'fetch' });
        if (!opt.start) {
            Object.assign(opt, { start: (this.curPage - 1) * this.limit });
        }
        if (!opt.limit) {
            Object.assign(opt, { limit: this.limit });
        }

        Object.assign(opt, { sort: JSON.stringify(this.gridSortField) });

        // 发送加载数据前事件
        this.fire(IBizMDControl.BEFORELOAD, opt);

        this.allChecked = false;
        this.indeterminate = false;
        this.selection = [];
        this.fire(IBizMDControl.SELECTIONCHANGE, this.selection);

        this.beginLoading();
        this.iBizHttp.post(this.getBackendUrl(), opt).subscribe(response => {
            this.endLoading();
            if (!response.items || response.ret !== 0) {
                if (response.errorMessage) {
                    this.iBizNotification.error('', response.errorMessage);
                }
                return;
            }
            this.items = this.rendererDatas(response.items);
            this.totalrow = response.totalrow;
            this.fire(IBizMDControl.LOADED, response.items);
        }, error => {
            this.endLoading();
            this.iBizNotification.error('', error.errorMessage);
        });
    }

    /**
     * 刷新数据
     * 
     * @param {*} [arg={}] 
     * @returns {void} 
     * @memberof IBizGrid
     */
    public refresh(arg: any = {}): void {
        this.load(arg);
    }

    /**
     * 删除数据
     * 
     * @param {*} [arg={}] 
     * @memberof IBizGrid
     */
    public remove(arg: any = {}): void {
        const params: any = {};
        Object.assign(params, arg);
        Object.assign(params, { srfaction: 'remove', srfctrlid: this.getName() });
        this.beginLoading();
        this.iBizHttp.post(this.getBackendUrl(), params).subscribe((response: any) => {
            this.endLoading();
            if (response.ret !== 0) {
                this.iBizNotification.error('', '删除数据失败,' + response.info);
                return;
            }
            if (this.allChecked) {
                const rows = this.curPage * this.limit;
                if (this.totalrow <= rows) {
                    this.curPage = this.curPage - 1;
                    if (this.curPage === 0) {
                        this.curPage = 1;
                    }
                }
            }
            this.load({});
            this.fire(IBizDataGrid.REMOVED, {});
            if (response.info && response.info !== '') {
                this.iBizNotification.success('', '删除成功!');
            }
            this.selection = [];
            // IBizUtil.processResult(response);
        }, (error: any) => {
            this.endLoading();
            this.iBizNotification.error('', '删除数据失败');
        });
    }

    /**
     * 行数据复选框单选
     * 
     * @param {boolean} value 
     * @param {*} [item={}] 
     * @returns {void} 
     * @memberof IBizGrid
     */
    public onItemSelect(value: boolean, item: any = {}): void {
        if (item.disabled) {
            return;
        }
        if (this.isEnableRowEdit && this.openRowEdit) {
            return;
        }

        const index: number = this.selection.findIndex(data => Object.is(data.srfkey, item.srfkey));
        if (index === -1) {
            this.selection.push(item);
        } else {
            this.selection.splice(index, 1);
        }

        if (!this.multiSelect) {
            this.selection.forEach(data => {
                data.checked = false;
            });
            this.selection = [];
            if (index === -1) {
                this.selection.push(item);
            }
        }
        this.rowsSelection = true;
        this.allChecked = this.selection.length === this.items.length ? true : false;
        this.indeterminate = (!this.allChecked) && (this.selection.length > 0);
        item.checked = value;
        this.fire(IBizMDControl.SELECTIONCHANGE, this.selection);
    }

    /**
     * 行数据复选框全选
     * 
     * @param {boolean} value 
     * @memberof IBizMDControl
     */
    public selectAll(value: boolean): void {
        if (this.isEnableRowEdit && this.openRowEdit) {
            return;
        }

        this.allChecked = value;

        if (!this.multiSelect) {
            setTimeout(() => {
                this.allChecked = false;
            });
            return;
        }
        this.items.forEach(item => {
            if (!item.disabled) {
                item.checked = value;
            }
        });
        this.selection = [];
        if (value) {
            this.selection = [...this.items];
        }
        this.indeterminate = (!value) && (this.selection.length > 0);
        this.fire(IBizMDControl.SELECTIONCHANGE, this.selection);
    }

    /**
     * 导出数据
     * 
     * @param {any} params 
     * @memberof IBizGrid
     */
    public exportData(arg: any = {}): void {
        // tslint:disable-next-line:prefer-const
        let params: any = {};
        this.fire(IBizMDControl.BEFORELOAD, params);
        if (params.search) {
            Object.assign(params, { query: params.search });
        }
        Object.assign(params, { srfaction: 'exportdata', srfctrlid: this.getName() });

        if (Object.is(arg.itemTag, 'all')) {
            Object.assign(params, { start: 0, limit: this.maxExportRow });
        } else if (Object.is(arg.itemTag, 'custom')) {
            const nStart = arg.exportPageStart;
            const nEnd = arg.exportPageEnd;
            if (nStart < 1 || nEnd < 1 || nStart > nEnd) {
                this.iBizNotification.warning('警告', '请输入有效的起始页');
                return;
            }
            Object.assign(params, { start: (nStart - 1) * this.limit, limit: (nEnd - nStart + 1) * this.limit });
        } else {
            Object.assign(params, { start: (this.curPage * this.limit) - this.limit, limit: this.curPage * this.limit });
        }

        if (this.gridSortField.length > 0) {
            Object.assign(params, { sort: this.gridSortField[0].property, sortdir: this.gridSortField[0].direction });
        }
        this.beginLoading();
        this.iBizHttp.post(this.getBackendUrl(), params).subscribe((res: any) => {
            this.endLoading();
            if (res.ret !== 0) {
                this.iBizNotification.warning('警告', res.info);
                return;
            }
            if (res.downloadurl) {
                let downloadurl = `/${IBizEnvironment.AppName.toLowerCase()}${res.downloadurl} `;
                downloadurl = (IBizEnvironment.LocalDeve ? '' : `/${IBizEnvironment.BaseUrl}`) + downloadurl;
                IBizUtil.download(downloadurl);
            }
        }, (error: any) => {
            this.endLoading();
            this.iBizNotification.error('', error.errorMessage);
        });
    }

    /**
     * 导出模型
     *
     * @param {*} [arg={}]
     * @memberof IBizDataGrid
     */
    public exportModel(arg: any = {}): void {
        let params: any = {};

        Object.assign(params, arg);
        Object.assign(params, { srfaction: 'exportmodel', srfctrlid: this.getName() });

        this.beginLoading();
        this.iBizHttp.post(this.getBackendUrl(), params).subscribe((res: any) => {
            this.endLoading();
            if (res.ret === 0) {
                if (res.downloadurl) {
                    let downloadurl = `/${IBizEnvironment.AppName.toLowerCase()}${res.downloadurl} `;
                    downloadurl = (IBizEnvironment.LocalDeve ? '' : `/${IBizEnvironment.BaseUrl}`) + downloadurl;
                    IBizUtil.download(downloadurl);
                }
            } else {
                this.iBizNotification.warning('警告', res.info);
            }
        }, (error: any) => {
            this.endLoading();
            this.iBizNotification.error('', error.errorMessage);
        });
    }

    /**
     * 重置分页
     *
     * @memberof IBizGrid
     */
    public resetStart(): void {
        this.start = 0;
    }

    /**
     * 分页页数改变
     * 
     * @memberof IBizGrid
     */
    public pageIndexChange() {
        this.refresh();
    }

    /**
     * 每页显示条数
     * 
     * @memberof IBizGrid
     */
    public pageSizeChange(): void {
        this.curPage = 1;
        this.refresh();
    }

    /**
     * 单击行选中
     *
     * @param {*} [data={}]
     * @memberof IBizGrid
     */
    public clickRowSelect(data: any = {}): void {
        if (data.disabled) {
            return;
        }
        if (this.doRowDataSelect(data)) {
            return;
        }
        this.fire(IBizDataGrid.ROWCLICK, this.selection);
    }

    /**
     * 双击行选中
     *
     * @param {*} [data={}]
     * @memberof IBizGrid
     */
    public dblClickRowSelection(data: any = {}): void {
        if (data.disabled) {
            return;
        }
        if (this.doRowDataSelect(data)) {
            return;
        }
        this.fire(IBizDataGrid.ROWDBLCLICK, this.selection);
    }

    /**
     * 表格排序
     * 
     * @param {string} name 字段明显
     * @param {string} type 排序类型
     * @returns {void} 
     * @memberof IBizGrid
     */
    public sort(name: string, type: string): void {
        if (!name || !type) {
            return;
        }
        let _item: any = this.gridSortField[0];
        if (_item && Object.is(_item.property, name) && Object.is(_item.direction, type)) {
            return;
        }

        let sort: any = { property: name };
        Object.assign(sort, { direction: type });
        this.gridSortField = [];
        this.gridSortField.push(sort);

        this.refresh({});
    }

    /**
     * 设置表格数据当前页
     * 
     * @param {number} page 分页数量
     * @memberof IBizGrid
     */
    public setCurPage(page: number): void {
        this.curPage = page;
    }

    /**
     * 设置是否支持多选
     * 
     * @param {boolean} state 是否支持多选
     * @memberof IBizGrid
     */
    public setMultiSelect(state: boolean): void {
        this.multiSelect = state;
    }

    /**
     * 界面行为
     *
     * @param {string} tag
     * @param {*} [data={}]
     * @memberof IBizGrid
     */
    public uiAction(tag: string, data: any = {}) {
        if (data.disabled) {
            return;
        }
        if (this.doRowDataSelect(data)) {
            return;
        }
        this.fire(IBizMDControl.UIACTION, { tag: tag, data: data });
    }

    /**
     * 处理非复选框行数据选中,并处理是否激活数据
     *
     * @private
     * @param {*} [data={}]
     * @returns {boolean} 是否激活
     * @memberof IBizGrid
     */
    private doRowDataSelect(data: any = {}): boolean {
        if (this.isEnableRowEdit && this.openRowEdit) {
            return true;
        }
        if (this.rowsSelection) {
            this.rowsSelection = false;
            return true;
        }
        this.selection.forEach((item) => {
            item.checked = false;
        });
        this.selection = [];
        data.checked = true;
        this.selection.push(data);
        this.indeterminate = (!this.allChecked) && (this.selection.length > 0);
        return false;
    }

    /**
     * 渲染绘制多项数据
     *
     * @param {Array<any>} items
     * @returns {Array<any>}
     * @memberof IBizGrid
     */
    public rendererDatas(items: Array<any>): Array<any> {
        super.rendererDatas(items);
        items.forEach(item => {
            const names: Array<any> = Object.keys(item);
            names.forEach(name => { item[name] = item[name] ? item[name] : ''; });
            item.checked = false;
        });
        if (this.isEnableRowEdit) {
            items.forEach((item: any) => { item.openeditrow = (this.openRowEdit) ? false : true; });

            if (this.openRowEdit) {
                this.selection = [];
                this.fire(IBizMDControl.SELECTIONCHANGE, this.selection);
                this.backupDatas = [...JSON.parse(JSON.stringify(items))]
                items.forEach((item: any, index: number) => {
                    this.setEditItemState(item.srfkey);
                    this.editRow(item, index, false);
                });
            } else {
                this.backupDatas = [];
                this.state = {};
            }
        }
        return items;
    }

    /**
     * 注册表格所有编辑项
     *
     * @memberof IBizGrid
     */
    public regEditItems(): void {
    }

    /**
     * 注册表格编辑项
     *
     * @param {*} [item={}]
     * @returns {void}
     * @memberof IBizGrid
     */
    public regEditItem(item: any = {}): void {
        if (Object.keys(item).length === 0) {
            return;
        }
        this.editItems[item.name] = item;
    }

    /**
     * 获取编辑项
     *
     * @param {string} name
     * @returns {*}
     * @memberof IBizDataGrid
     */
    public getEditItem(name: string): any {
        if (name) {
            return this.editItems[name];
        }
    }

    /**
     * 设置编辑项状态
     *
     * @param {string} srfkey
     * @returns {void}
     * @memberof IBizGrid
     */
    public setEditItemState(srfkey: string): void {
        if (!this.state) {
            return;
        }
        if (!srfkey) {
            this.iBizNotification.warning('警告', '数据异常');
        }
        // tslint:disable-next-line:prefer-const
        let editItems: any = {};
        const itemsName: Array<any> = Object.keys(this.editItems);
        itemsName.forEach(name => {
            // tslint:disable-next-line:prefer-const
            let item: any = {};
            const _editor = JSON.stringify(this.editItems[name]);
            Object.assign(item, JSON.parse(_editor));
            editItems[name] = item;
        });
        this.state[srfkey] = editItems;
    }

    /**
     * 删除信息编辑项状态
     *
     * @param {string} srfkey
     * @memberof IBizGrid
     */
    public deleteEditItemState(srfkey: string): void {
        if (srfkey && this.state.hasOwnProperty(srfkey)) {
            delete this.state.srfkey;
        }
    }

    /**
     * 设置编辑项是否启用
     *
     * @param {string} srfkey
     * @param {number} type
     * @memberof IBizGrid
     */
    public setEditItemDisabled(srfkey: string, type: number): void {
        if (this.state && this.state.hasOwnProperty(srfkey)) {
            // tslint:disable-next-line:prefer-const
            let item = this.state[srfkey];
            const itemsName = Object.keys(item);
            itemsName.forEach(name => {
                const disabled: boolean = (item[name].enabledcond === 3 || item[name].enabledcond === type);
                item[name].disabled = !disabled;
            });
            Object.assign(this.state[srfkey], item);
        }
    }

    /**
     * 获取行编辑状态
     *
     * @returns {boolean}
     * @memberof IBizGrid
     */
    public getOpenEdit(): boolean {
        return this.openRowEdit;
    }

    /**
     * 保存表格所有编辑行 <在插件模板中提供重写>
     *
     * @param {*} [params={}]
     * @memberof IBizDataGrid
     */
    public saveAllEditRow(params: any = {}): void {
        let saveCount = 0;
        this.items.forEach((_item: any, index: number) => {
            let data = this.backupDatas.find((_data: any) => Object.is(_data.srfkey, _item.srfkey));
            if (!data) {
                return;
            }
            Object.keys(data).some((name: string) => {
                let fieldIsSave: boolean = !Object.is(name, 'openeditrow') && (typeof _item[name] === 'string' && typeof data[name] === 'string') && !Object.is(_item[name], data[name]);
                if (!fieldIsSave) {
                    return false;
                }

                let templData = {};
                Object.assign(templData, params, _item);
                let subject = this.editRowSave(templData, index);
                subject.subscribe((result: any) => {
                    this.editorRowsSaveResult.push(result);
                    if (this.editorRowsSaveResult.length === saveCount) {
                        this.showSaveResultInfo();
                        this.editorRowsSaveResult = [];
                    }
                });
                saveCount++;
                return true;
            });

        });
    }

    /**
     * 显示保存结果信息
     *
     * @private
     * @memberof IBizDataGrid
     */
    private showSaveResultInfo(): void {
        let successInfo: string = '';
        let errorInfo: string = '';
        let info: string = '';
        this.editorRowsSaveResult.sort((a: any, b: any) => {
            return a.index - b.index;
        });
        this.editorRowsSaveResult.forEach((data: any) => {
            if (Object.is(data.state, 'success')) {
                if (!Object.is(successInfo, '')) {
                    successInfo = `${successInfo}、`;
                }
                successInfo = `${successInfo}${data.index + 1}`;
            }
            if (Object.is(data.state, 'error')) {
                errorInfo = `${errorInfo}\n第 ${data.index + 1} 条保存失败，错误信息如下：`;
                let _info = '';
                if (data.result && Array.isArray(data.result) && data.result.length > 0) {
                    const items: Array<any> = data.result;
                    items.forEach((item, index) => {
                        if (index > 0) {
                            _info = `${_info}、`;
                        }
                        _info = `${_info}${item.info}`;
                    });
                } else if (!Object.is(data.errorMessage, '')) {
                    _info = !Object.is(_info, '') ? `${_info}、` : _info;
                    _info = `${_info}${data.errorMessage}`;
                }
                errorInfo = `${errorInfo}${_info}`;
            }
        });
        if (!Object.is(successInfo, '')) {
            info = `${info}第 ${successInfo} 条保存成功！\n`;
        }
        if (!Object.is(errorInfo, '')) {
            info = `${info}${errorInfo}`;
        }
        this.iBizNotification.info('', info);
    }

    /**
     * 启用行编辑
     *
     * @param {*} params
     * @returns {void}
     * @memberof IBizDataGrid
     */
    public openEdit(params: any): void {
        if (!this.isEnableRowEdit) {
            this.iBizNotification.info('提示', '未启用行编辑');
            return;
        }
        if (!this.openRowEdit) {
            this.openRowEdit = true;
            this.items.forEach((item: any) => { item.openeditrow = true; });

            this.selection.forEach((data) => {
                data.checked = false;
            });
            this.selection = [];
            this.indeterminate = false;
            this.fire(IBizMDControl.SELECTIONCHANGE, this.selection);
            this.backupDatas = [...JSON.parse(JSON.stringify(this.items))];
            this.items.forEach((item: any, index: number) => {
                this.setEditItemState(item.srfkey);
                this.editRow(item, index, false);
            });
        }
    }

    /**
     * 关闭行编辑
     *
     * @param {*} params
     * @returns {void}
     * @memberof IBizDataGrid
     */
    public closeEdit(params: any): void {
        if (!this.isEnableRowEdit) {
            this.iBizNotification.info('提示', '未启用行编辑');
            return;
        }
        if (this.openRowEdit) {
            this.openRowEdit = false;
            this.backupDatas = [];
            this.items = [];
            this.state = {};
            this.refresh({});
        }
    }

    /**
     * 编辑行数据
     *
     * @param {*} [data={}]
     * @param {number} rowindex
     * @memberof IBizGrid
     */
    public editRow(data: any = {}, rowindex: number, state: boolean): void {
        data.openeditrow = state;
        this.setEditItemState(data.srfkey);
        if (data.openeditrow) {
            const index: number = this.backupDatas.findIndex(item => Object.is(item.srfkey, data.srfkey));
            if (index !== -1) {
                Object.assign(data, this.backupDatas[index]);
            }
            if (Object.is(data.srfkey, '')) {
                this.items.splice(rowindex, 1);
            }
        } else {
            this.setEditItemDisabled(data.srfkey, 2);
        }
    }

    /**
     * 保存编辑行数据
     *
     * @param {*} [data={}]
     * @param {number} rowindex
     * @memberof IBizGrid
     */
    public editRowSave(data: any = {}, rowindex: number): Subject<any> {
        let subject: Subject<any> = new Subject();

        const srfaction: string = data.rowdatamodal && Object.is(data.rowdatamodal, 'gridloaddraft') ? 'create' : 'update';

        let params: any = { srfaction: srfaction, srfctrlid: 'grid' };
        const _names: Array<any> = Object.keys(data);
        _names.forEach(name => {
            data[name] = data[name] ? data[name] : '';
        });
        Object.assign(params, data);
        this.iBizHttp.post(this.getBackendUrl(), params).subscribe((responce: any) => {
            if (responce.ret === 0) {
                const index: number = this.backupDatas.findIndex(item => Object.is(data.srfkey, item.srfkey));
                if (index !== -1) {
                    Object.assign(this.backupDatas[index], responce.data);
                    if (this.backupDatas[index].hasOwnProperty('srfisnewdata')) {
                        delete this.backupDatas[index].srfisnewdata;
                    }
                    this.deleteEditItemState(data.srfkey);
                    this.setEditItemState(responce.data.srfkey);
                }
                Object.assign(this.items[rowindex], responce.data);
                subject.next({ state: 'success', index: rowindex, result: [] });
            } else {
                let message = responce.errorMessage ? responce.errorMessage : '保存异常!';
                subject.next({ state: 'eroor', index: rowindex, result: [], errorMessage: message });
            }
        }, (error: any) => {
            if (error.error && (error.error.items && Array.isArray(error.error.items) && error.error.items.length > 0)) {
                const items: Array<any> = error.error.items;
                items.forEach((item, index) => {
                    Object.assign(this.state[data.srfkey][item.id].styleCss, { 'border': '1px solid #f04134', 'border-radius': '4px' });
                });
                subject.next({ state: 'eroor', index: rowindex, result: error.error.items });
            } else {
                let message = error.errorMessage ? error.errorMessage : '保存异常!';
                subject.next({ state: 'eroor', index: rowindex, result: [], errorMessage: message });
            }
        });

        return subject;
    }

    /**
     * 行编辑文本框光标移出事件
     *
     * @param {*} event
     * @param {string} name
     * @param {*} [data={}]
     * @returns {void}
     * @memberof IBizGrid
     */
    public onBlur(event: any, name: string, data: any = {}): void {
        if ((!event) || Object.keys(data).length === 0) {
            return;
        }
        if (Object.is(event.target.value, data[name])) {
            return;
        }
        this.colValueChange(name, event.target.value, data);
    }

    /**
     * 行编辑文本框键盘事件
     *
     * @param {*} event
     * @param {string} name
     * @param {*} [data={}]
     * @returns {void}
     * @memberof IBizGrid
     */
    public onKeydown(event: any, name: string, data: any = {}): void {
        if ((!event) || Object.keys(data).length === 0) {
            return;
        }
        if (event.keyCode !== 13) {
            return;
        }
        if (Object.is(event.target.value, data[name])) {
            return;
        }
        this.colValueChange(name, event.target.value, data);
    }

    /**
     * 行编辑单元格值变化
     *
     * @param {string} name
     * @param {*} data
     * @memberof IBizGrid
     */
    public colValueChange(name: string, value: string, data: any): void {
        const srfkey = data.srfkey;
        const _data = this.items.find(back => Object.is(back.srfkey, srfkey));
        if (this.state[srfkey] && this.state[srfkey][name]) {
            if (_data && !Object.is(_data[name], value)) {
                Object.assign(this.state[srfkey][name].styleCss, { 'border': '1px solid #49a9ee', 'border-radius': '4px' });
            } else {
                Object.assign(this.state[srfkey][name].styleCss, { 'border': '0px', 'border-radius': '0px' });
            }
            data[name] = value;
            this.fire(IBizDataGrid.UPDATEGRIDITEMCHANGE, { name: name, data: data });
        }
    }

    /**
     * 更新表格编辑列值
     *
     * @param {string} srfufimode
     * @param {*} [data={}]
     * @memberof IBizGrid
     */
    public updateGridEditItems(srfufimode: string, data: any = {}): void {
        // tslint:disable-next-line:prefer-const
        let opt: any = { srfaction: 'updategridedititem', srfufimode: srfufimode, srfctrlid: 'grid' };
        const _names: Array<any> = Object.keys(data);
        _names.forEach(name => {
            data[name] = data[name] ? data[name] : '';
        });
        Object.assign(opt, { srfactivedata: JSON.stringify(data) });
        this.iBizHttp.post(this.getBackendUrl(), opt).subscribe((success) => {
            if (success.ret === 0) {
                const index: number = this.items.findIndex(item => Object.is(item.srfkey, data.srfkey));
                if (index !== -1) {
                    Object.assign(this.items[index], success.data);
                }
            } else {
                this.iBizNotification.error('错误', success.info);
            }
        }, (error) => {
            this.iBizNotification.error('错误', error.info);
        });
    }

    /**
     * 新建编辑行
     *
     * @param {*} [param={}]
     * @memberof IBizGrid
     */
    public newRowAjax(param: any = {}): void {
        // tslint:disable-next-line:prefer-const
        let opt: any = {};
        Object.assign(opt, param);
        this.fire(IBizMDControl.BEFORELOAD, opt);
        Object.assign(opt, { srfaction: 'loaddraft', srfctrlid: 'grid' });
        this.iBizHttp.post(this.getBackendUrl(), opt).subscribe(success => {
            if (success.ret === 0) {
                const srfkey: string = (Object.is(success.data.srfkey, '')) ? IBizUtil.createUUID() : success.data.srfkey;
                success.data.srfkey = srfkey;
                this.setEditItemState(srfkey);
                this.setEditItemDisabled(srfkey, 1);
                this.items.splice(0, 0, Object.assign(success.data, { openeditrow: false, rowdatamodal: 'gridloaddraft', srfisnewdata: true }));
                let backdata: any = JSON.parse(JSON.stringify(success.data));
                this.backupDatas.push(backdata);
            } else {
                this.iBizNotification.error('错误', `获取默认数据失败, ${success.info}`);
            }
        }, error => {
            this.iBizNotification.error('错误', `获取默认数据失败, ${error.info}`);
        });
    }
    // BEGIN：Element UI 表格部件内置方法
    /**
     * 复选框行选中 (表格)
     *
     * @param {*} argu
     * @returns {void}
     * @memberof IBizDataGrid
     */
    public elementSelect(argu: any): void {
        if (this.openRowEdit) {
            this.$vue.$refs.multipleTable.clearSelection();
            return;
        }
        let [selections, row]: [Array<any>, any] = argu;

        let index = selections.findIndex((data: any) => Object.is(data.srfkey, row.srfkey));
        this.onItemSelect(index !== -1 ? false : true, row);
    }
    /**
     * 复选框全选 (表格)
     *
     * @param {*} argu
     * @returns {void}
     * @memberof IBizDataGrid
     */
    public elementSelectAll(argu: any): void {
        if (this.openRowEdit) {
            this.$vue.$refs.multipleTable.clearSelection();
            return;
        }
        let [selections]: [Array<any>] = argu;
        if (Array.isArray(selections)) {
            this.selectAll(selections.length !== 0 ? true : false);
        }
    }
    /**
     * 行单击 (表格)
     *
     * @param {*} argu
     * @returns {void}
     * @memberof IBizDataGrid
     */
    public elementRowClick(argu: any): void {
        if (this.openRowEdit) {
            this.$vue.$refs.multipleTable.clearSelection();
            return;
        }
        let [row]: [any] = argu;
        this.$vue.$refs.multipleTable.clearSelection();
        this.$vue.$refs.multipleTable.toggleRowSelection(row);
        this.clickRowSelect(row);
    }
    /**
     * 行双击 (表格)
     *
     * @param {*} argu
     * @returns {void}
     * @memberof IBizDataGrid
     */
    public elementRowDblclick(argu: any): void {
        if (this.openRowEdit) {
            this.$vue.$refs.multipleTable.clearSelection();
            return;
        }
        let [row]: [any] = argu;
        this.$vue.$refs.multipleTable.clearSelection();
        this.$vue.$refs.multipleTable.toggleRowSelection(row);
        this.dblClickRowSelection(row);
    }
    /**
     * 改变页码
     *
     * @param {*} argu
     * @memberof IBizDataGrid
     */
    public elementOnChange(argu: any): void {
        [this.curPage] = argu;
        this.pageIndexChange();
    }
    /**
     * 分页数量改变
     *
     * @param {*} argu
     * @memberof IBizDataGrid
     */
    public elementOnPageSizeChange(argu: any): void {
        [this.limit] = argu;
        this.pageSizeChange();
    }
    /**
     * 排序
     *
     * @param {*} argu
     * @memberof IBizDataGrid
     */
    public elementSortChange(argu: any): void {
        let [event]: [any] = argu;
        let type = event.order.indexOf('descending') >= 0 ? 'desc' : 'asc';
        this.sort(event.prop, type);
    }
    /**
     * 是否支持选中
     *
     * @param {*} argu
     * @returns {boolean}
     * @memberof IBizDataGrid
     */
    public elementSelectable() {
        return (row: any, index: any) => {
            return this.openRowEdit ? false : true;
        }
    }
    // END：Element UI 表格部件内置方法

    /*****************事件声明************************/

    /**
     * 改变启用行编辑按钮信息
     *
     * @static
     * @memberof IBizDataGrid
     */
    public static CHANGEEDITSTATE = 'CHANGEEDITSTATE';

    /**
     * 表格行数据变化
     *
     * @static
     * @memberof IBizDataGrid
     */
    public static UPDATEGRIDITEMCHANGE = 'UPDATEGRIDITEMCHANGE';

    /**
     * 数据删除完成
     *
     * @static
     * @memberof IBizDataGrid
     */
    public static REMOVED = 'REMOVED';

    /**
     * 行单击选中
     *
     * @static
     * @memberof IBizDataGrid
     */
    public static ROWCLICK = 'ROWCLICK';

    /**
     * 行数据双击选中
     *
     * @static
     * @memberof IBizDataGrid
     */
    public static ROWDBLCLICK = 'ROWDBLCLICK';
}

