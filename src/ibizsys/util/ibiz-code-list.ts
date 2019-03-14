import { IBizObject } from "../ibiz-object";

/**
 * 代码表对象
 *
 * @class IBizCodeList
 * @extends {IBizObject}
 */
export class IBizCodeList extends IBizObject {

    /**
     * 静态代码表数据
     *
     * @type {Array<any>}
     * @memberof IBizCodeList
     */
    public data: Array<any> = [];

    /**
     * Creates an instance of IBizCodeList. 
     * 创建 IBizCodeList 实例
     * 
     * @param {*} [opts={}]
     * @memberof IBizCodeList
     */
    constructor(opts: any = {}) {
        super(opts);
        this.data = [...opts.datas];
    }

    /**
     * 获取代码表数据
     * 
     * @returns {Array<any>} 
     * @memberof IBizCodeList
     */
    public getData(): Array<any> {
        return this.data;
    }

    /**
     * 获取数据项的值
     * 
     * @param {string} value 
     * @param {*} cascade 
     * @returns {*} 
     * @memberof IBizCodeList
     */
    public getItemByValue(value: string, cascade?: any): any {
        let result: any = {};
        const arr: Array<any> = this.data.filter(item => Object.is(item.value, value));
        if (arr.length !== 1) {
            return undefined;
        }

        result = { ...arr[0] };
        return result;
    }

    /**
     * 获取代码表文本值
     * 
     * @param {*} [item={}] 
     * @returns {string} 
     * @memberof IBizCodeList
     */
    public getCodeItemText(item: any = {}): string {
        const color = item.color;
        const textCls = item.textcls;
        const iconCls = item.iconcls;
        const realText = item.text;
        let ret = '';
        if (iconCls) {
            ret = `<i class='${iconCls}'></i>&nbsp;`;
        }
        if (textCls || color) {
            ret = `${ret}<span class='${textCls ? textCls : ''}' style='color: ${color ? color : ''}'>${realText}</span>`;
        } else {
            ret += realText;
        }

        return ret;
    }
}

