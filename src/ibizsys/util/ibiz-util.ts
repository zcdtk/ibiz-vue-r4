/**
 * IBizSys平台工具类
 *
 * @class IBizUtil
 */
export class IBizUtil {

    /**
     * 错误提示信息
     * 
     * @static
     * @type {string}
     * @memberof IBizUtil
     */
    public static errorInfo: string = '';

    /**
     * 创建 UUID
     *
     * @static
     * @returns {string}
     * @memberof IBizUtil
     */
    public static createUUID(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    /**
     * 判断条件是否成立
     * 
     * @static
     * @param {*} value 
     * @param {*} op 
     * @param {*} value2 
     * @returns {boolean} 
     * @memberof IBizUtil
     */
    public static testCond(value: any, op: any, value2: any): boolean {
        // 等于操作
        if (Object.is(op, 'EQ')) {
            return value === value2;
        }
        // 大于操作
        if (Object.is(op, 'GT')) {
            const result: number = this.compare(value, value2);
            if (result !== undefined && result > 0) {
                return true;
            } else {
                return false;
            }
        }
        // 大于等于操作
        if (Object.is(op, 'GTANDEQ')) {
            const result: number = this.compare(value, value2);
            if (result !== undefined && result >= 0) {
                return true;
            } else {
                return false;
            }
        }
        // 值包含在给定的范围中
        if (Object.is(op, 'IN')) {
            return this.contains(value, value2);
        }
        // 不为空判断操作
        if (Object.is(op, 'ISNOTNULL')) {
            return (value != null && value !== '');
        }
        // 为空判断操作
        if (Object.is(op, 'ISNULL')) {
            return (value == null || value === '');
        }
        // 文本左包含
        if (Object.is(op, 'LEFTLIKE')) {
            return (value && value2 && (value.toUpperCase().indexOf(value2.toUpperCase()) === 0));
        }
        // 文本包含
        if (Object.is(op, 'LIKE')) {
            return (value && value2 && (value.toUpperCase().indexOf(value2.toUpperCase()) !== -1));
        }
        // 小于操作
        if (Object.is(op, 'LT')) {
            const result: number = this.compare(value, value2);
            if (result !== undefined && result < 0) {
                return true;
            } else {
                return false;
            }
        }
        // 小于等于操作
        if (Object.is(op, 'LTANDEQ')) {
            const result: number = this.compare(value, value2);
            if (result !== undefined && result <= 0) {
                return true;
            } else {
                return false;
            }
        }
        // 不等于操作
        if (Object.is(op, 'NOTEQ')) {
            return value !== value2;
        }
        // 值不包含在给定的范围中
        if (Object.is(op, 'NOTIN')) {
            return !this.contains(value, value2);
        }
        // 文本右包含
        if (Object.is(op, 'RIGHTLIKE')) {
            if (!(value && value2)) {
                return false;
            }
            const nPos = value.toUpperCase().indexOf(value2.toUpperCase());
            if (nPos === -1) {
                return false;
            }
            return nPos + value2.length === value.length;
        }
        // 空判断
        if (Object.is(op, 'TESTNULL')) {

        }
        // 自定义包含
        if (Object.is(op, 'USERLIKE')) {

        }
        return false;
    }

    /**
     * 文本包含
     * 
     * @static
     * @param {any} value 
     * @param {any} value2 
     * @returns {boolean} 
     * @memberof IBizUtil
     */
    public static contains(value: string, value2: { split: (arg0: string) => any[]; }): boolean {
        if (value && value2) {
            // 定义一数组
            let arr = new Array();
            arr = value2.split(',');
            // 定义正则表达式的连接符
            const S = String.fromCharCode(2);
            const reg = new RegExp(S + value + S);
            return (reg.test(S + arr.join(S) + S));
        }
        return false;
    }

    /**
     * 值比较
     * 
     * @static
     * @param {*} value 
     * @param {*} value2 
     * @returns {number} 
     * @memberof IBizUtil
     */
    public static compare(value: any, value2: any): any {
        let result = null;
        if (!Object.is(value, '') && !Object.is(value2, '') && !isNaN(value) && !isNaN(value2)) {
            result = this.compareNumber(parseFloat(value), parseFloat(value2));
        } else if (this.isParseDate(value) && this.isParseDate(value2)) {
            result = this.compareDate((new Date(value)).getTime(), (new Date(value2)).getTime());
        } else if (value && (typeof (value) === 'boolean' || value instanceof Boolean)) {
            result = this.compareBoolean(value, value2);
        } else if (value && (typeof (value) === 'string' || value instanceof String)) {
            result = this.compareString(value, value2);
        }

        return result;
    }

    /**
     * 是否是时间
     *
     * @static
     * @param {string} value
     * @returns {boolean}
     * @memberof IBizUtil
     */
    public static isParseDate(value: string): boolean {
        const time = new Date(value);
        if (isNaN(time.getTime())) {
            return false;
        }
        return true;
    }

    /**
     * 时间值比较（毫秒数）
     *
     * @static
     * @param {number} value
     * @param {number} value2
     * @returns {number}
     * @memberof IBizUtil
     */
    public static compareDate(value: number, value2: number): number {
        if (value > value2) {
            return 1;
        } else if (value < value2) {
            return -1;
        } else {
            return 0;
        }
    }

    /**
     * 数值比较
     *
     * @static
     * @param {number} value
     * @param {number} value2
     * @returns {number}
     * @memberof IBizUtil
     */
    public static compareNumber(value: number, value2: number): number {
        if (value > value2) {
            return 1;
        } else if (value < value2) {
            return -1;
        } else {
            return 0;
        }
    }

    /**
     * 字符串比较
     *
     * @static
     * @param {*} value
     * @param {*} value2
     * @returns {number}
     * @memberof IBizUtil
     */
    public static compareString(value: any, value2: any): number {
        return value.localeCompare(value2);
    }

    /**
     * boolean 值比较
     *
     * @static
     * @param {*} value
     * @param {*} value2
     * @returns {number}
     * @memberof IBizUtil
     */
    public static compareBoolean(value: any, value2: any): number {
        if (value === value2) {
            return 0;
        } else {
            return -1;
        }
    }


    /**
    * 
    * 
    * @param {*} [o={}] 
    * @memberof IBizUtil
    */
    public static processResult(o: any = {}): void {
        if (o.url != null && o.url !== '') {
            window.location.href = o.url;
        }
        if (o.code != null && o.code !== '') {
            eval(o.code);
        }

        if (o.downloadurl != null && o.downloadurl !== '') {
            const downloadurl = this.parseURL2('', o.downloadurl, '');
            this.download(downloadurl);
        }
    }

    /**
     * 下载文件
     * 
     * @static
     * @param {string} url 
     * @memberof IBizUtil
     */
    public static download(url: string): void {
        window.open(url, '_blank');
    }

    /**
     * 
     * 
     * @static
     * @param {any} subapp 
     * @param {any} url 
     * @param {any} params 
     * @returns {string} 
     * @memberof IBizUtil
     */
    public static parseURL2(subapp: string, url: string, params: any): string {
        let tmpURL;
        // let root;
        // if (subapp) {
        //     root = WEBROOTURL;
        // } else {
        //     root = BASEURL;
        // }

        // if (url.toLowerCase().indexOf('http') !== -1) {
        //     tmpURL = url;
        // } else {
        //     tmpURL = root + '/jsp' + url;
        // }

        if (url.indexOf('../../') !== -1) {
            tmpURL = url.substring(url.indexOf('../../') + 6, url.length);
        } else if (url.indexOf('/') === 0) {
            tmpURL = url.substring(url.indexOf('/') + 1, url.length);
        } else {
            tmpURL = url;
        }

        if (params) {
            return tmpURL + (url.indexOf('?') === -1 ? '?' : '&'); // + $.param(params);
        } else {
            return tmpURL;
        }
    }

    /**
     * 是否是数字
     * 
     * @param {*} num 
     * @returns {boolean} 
     * @memberof IBizUtil
     */
    public static isNumberNaN(num: any): boolean {
        return Number.isNaN(num) || num !== num;
    }

    /**
     * 是否未定义
     * 
     * @static
     * @param {*} value 
     * @returns {boolean} 
     * @memberof IBizUtil
     */
    public static isUndefined(value: any): boolean {
        return typeof value === 'undefined';
    }

    /**
     * 是否为空
     * 
     * @static
     * @param {*} value 
     * @returns {boolean} 
     * @memberof IBizUtil
     */
    public static isEmpty(value: any): boolean {
        return this.isUndefined(value) || value === '' || value === null || value !== value;
    }

    /**
     * 检查属性常规条件
     *
     * @static
     * @param {string} defname 属性名称
     * @param {string} op 条件
     * @param {string} paramValue 值项
     * @param {string} errorInfo 错误信息
     * @param {string} paramType 参数类型
     * @param {boolean} primaryModel 是否必须条件
     * @param {*} form 表单
     * @returns {boolean}
     * @memberof IBizUtil
     */
    public static checkFieldSimpleRule(defname: string, op: string, paramValue: string, errorInfo: string, paramType: string, primaryModel: boolean, form: any): boolean {
        let value = null;
        let value2 = null;

        const _deField = form.findField(defname);
        if (_deField) {
            value = _deField.getValue();
        }
        if (Object.is(paramType, 'CURTIME')) {
            value2 = `${new Date()}`;
        }
        if (Object.is(paramType, 'ENTITYFIELD')) {
            value2 = paramValue;
        }
        if (this.isEmpty(errorInfo)) {
            errorInfo = '内容必须符合值规则';
        }
        this.errorInfo = errorInfo;
        const reault = this.testCond(value, op, value2);
        if (!reault) {
            if (primaryModel) {
                throw new Error(this.errorInfo);
            }
            return false;
        }

        this.errorInfo = '';
        return true;
    }

    /**
     * 检查属性字符长度规则
     *
     * @static
     * @param {string} defname 属性名称
     * @param {number} minLength 最小长度
     * @param {boolean} indexOfMin 是否包含最小
     * @param {number} maxLength 最大长度
     * @param {boolean} indexOfMax 是否包含最大
     * @param {string} errorInfo 错误信息
     * @param {boolean} primaryModel 是否关键值
     * @param {*} form 表单
     * @returns {boolean}
     * @memberof IBizUtil
     */
    public static checkFieldStringLengthRule(defname: string, minLength: number, indexOfMin: boolean, maxLength: number, indexOfMax: boolean, errorInfo: string, primaryModel: boolean, form: any): boolean {
        let value = null;
        const _deField = form.findField(defname);
        if (_deField) {
            value = _deField.getValue();
        }

        if (this.isEmpty(errorInfo)) {
            this.errorInfo = '内容长度必须符合范围规则';
        } else {
            this.errorInfo = errorInfo;
        }

        const isEmpty = IBizUtil.isEmpty(value);
        // 值为空或者未定义
        if (isEmpty) {
            if (primaryModel) {
                throw new Error(this.errorInfo);
            }
            return false;
        }

        const viewValueLength: number = value.length;

        // 小于等于
        if (minLength !== null) {
            if (indexOfMin) {
                if (viewValueLength < minLength) {
                    if (primaryModel) {
                        throw new Error(this.errorInfo);
                    }
                    return false;
                }
            } else {
                if (viewValueLength <= minLength) {
                    if (primaryModel) {
                        throw new Error(this.errorInfo);
                    }
                    return false;
                }
            }
        }

        //  大于等于
        if (maxLength !== null) {
            if (indexOfMax) {
                if (viewValueLength > maxLength) {
                    if (primaryModel) {
                        throw new Error(this.errorInfo);
                    }
                    return false;
                }
            } else {
                if (viewValueLength >= maxLength) {
                    if (primaryModel) {
                        throw new Error(this.errorInfo);
                    }
                    return false;
                }
            }
        }

        this.errorInfo = '';
        return true;
    }

    /**
     * 检查属性值正则式规则
     *
     * @static
     * @param {string} defname 属性名称
     * @param {*} strReg 正则表达式
     * @param {string} errorInfo 错误信息
     * @param {boolean} primaryModel 是否关键条件
     * @param {*} form
     * @returns {boolean}
     * @memberof IBizUtil
     */
    public static checkFieldRegExRule(defname: string, strReg: any, errorInfo: string, primaryModel: boolean, form: any): boolean {

        let value = null;
        const _deField = form.findField(defname);
        if (_deField) {
            value = _deField.getValue();
        }
        if (this.isEmpty(errorInfo)) {
            this.errorInfo = '值必须符合正则规则';
        } else {
            this.errorInfo = errorInfo;
        }
        const isEmpty = IBizUtil.isEmpty(value);
        if (isEmpty) {
            if (primaryModel) {
                throw new Error(this.errorInfo);
            }
            return false;
        }
        const regExp = new RegExp(strReg);
        const result = regExp.test(value);
        if (!result) {
            if (primaryModel) {
                throw new Error(this.errorInfo);
            }
            return false;
        }

        this.errorInfo = '';
        return true;
    }

    /**
     * 检查属性值范围规则
     *
     * @static
     * @param {string} defname 属性名称
     * @param {*} minNumber 最小值
     * @param {boolean} indexOfMin 是否包含最小值
     * @param {*} maxNumber 最大值
     * @param {boolean} indexOfMax 是否包含最大值
     * @param {string} errorInfo 错误信息
     * @param {boolean} primaryModel 是否关键条件  
     * @param {*} form 表单
     * @returns {boolean}
     * @memberof IBizUtil
     */
    public static checkFieldValueRangeRule(defname: string, minNumber: any, indexOfMin: boolean, maxNumber: any, indexOfMax: boolean, errorInfo: string, primaryModel: boolean, form: any): boolean {
        let value = null;
        const _deField = form.findField(defname);
        if (_deField) {
            value = _deField.getValue();
        }

        if (this.isEmpty(errorInfo)) {
            this.errorInfo = '值必须符合值范围规则';
        } else {
            this.errorInfo = errorInfo;
        }

        const isEmpty = IBizUtil.isEmpty(value);
        if (isEmpty) {
            if (primaryModel) {
                throw new Error(this.errorInfo);
            }
            return false;
        }

        const valueFormat = this.checkFieldRegExRule(value, /^-?\d*\.?\d+$/, '', primaryModel, form);
        if (!valueFormat) {
            return false;
        } else {
            this.errorInfo = errorInfo;
        }

        const data = Number.parseFloat(value);

        // 小于等于
        if (minNumber !== null) {
            if (indexOfMin) {
                if (data < minNumber) {
                    if (primaryModel) {
                        throw new Error(this.errorInfo);
                    }
                    return false;
                }
            } else {
                if (data <= minNumber) {
                    if (primaryModel) {
                        throw new Error(this.errorInfo);
                    }
                    return false;
                }
            }
        }

        // //大于等于
        if (maxNumber != null) {
            if (indexOfMax) {
                if (data > maxNumber) {
                    if (primaryModel) {
                        throw new Error(this.errorInfo);
                    }
                    return false;
                }
            } else {
                if (data >= maxNumber) {
                    if (primaryModel) {
                        throw new Error(this.errorInfo);
                    }
                    return false;
                }
            }
        }

        this.errorInfo = '';
        return true;
    }

    /**
     * 检查属性值系统值范围规则  暂时支持正则表达式
     *
     * @static
     * @param {string} defname 属性名称
     * @param {*} strReg 正则表达式
     * @param {string} errorInfo 错误信息
     * @param {boolean} primaryModel 是否关键条件
     * @param {*} form 表单
     * @returns {boolean}
     * @memberof IBizUtil
     */
    public static checkFieldSysValueRule(defname: string, strReg: any, errorInfo: string, primaryModel: boolean, form: any): boolean {
        return this.checkFieldRegExRule(defname, strReg, errorInfo, primaryModel, form);
    }

    /**
     * 将文本格式的xml转换为dom模式
     * 
     * @static
     * @param {string} strXml 
     * @memberof IBizUtil
     */
    public static parseXML(strXml: string): any {
        if (strXml) {
            return new DOMParser().parseFromString(strXml, 'text/xml');
        }
    }

    /**
     * 将xml转换为object对象
     * 
     * @static
     * @param {*} node 
     * @param {*} [obj={}] 
     * @memberof IBizUtil
     */
    public static loadXMLNode(node: any, obj: any = {}): void {
        if (node && node.attributes) {
            const arr: any = node.attributes;
            for (let i = 0; i < arr.length; i++) {
                let A = arr.item(i).name;
                const B = arr.item(i).value;
                A = A.toLowerCase();
                obj[A] = B;
            }
        }
    }

    /**
     * 将object转换为xml对象
     * 
     * @static
     * @param {any} XML 
     * @param {any} obj 
     * @memberof IBizUtil
     */
    public static saveXMLNode(XML: { attrib: (arg0: string, arg1: any) => void; }, obj: { [x: string]: { toString: () => void; }; }) {
        let proName = '';
        // tslint:disable-next-line:forin
        for (proName in obj) {
            const value = obj[proName];
            if (!value || value instanceof Object || typeof (value) === 'function') {
                continue;
            }
            const proValue = obj[proName].toString();
            if (!Object.is(proValue, '')) {
                XML.attrib(proName, proValue);
            }
        }
    }

    /**
     *  矩阵 URLJson 格式化
     *
     * @static
     * @param {string} params
     * @returns {*}
     * @memberof IBizUtil
     */
    public static matrixURLToJson(params: string = ''): any {
        const data: any = {};
        const params_arr: string[] = params.split(';');
        params_arr.forEach((_data: string, index: number) => {
            if ((index === params_arr.length - 1) && _data.indexOf('?') !== -1) {
                _data = _data.substr(0, _data.indexOf('?'));
            }
            const _data_arr: string[] = [..._data.split('=')];
            data[_data_arr[0]] = _data_arr[1];
        });
        return data;
    }
}

// Vue.prototype.IBizUtil = IBizUtil;
