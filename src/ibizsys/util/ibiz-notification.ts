import { Subject } from 'rxjs';

/**
 * UI信息提示与交互确认类
 *
 * @class IBizNotification
 */
export class IBizNotification {

    /**
     * 单例变量声明
     *
     * @private
     * @static
     * @type {IBizNotification}
     * @memberof IBizNotification
     */
    private static iBizNotification: IBizNotification;

    /**
     * Creates an instance of IBizNotification.
     * 创建 IBizNotification 实例 私有构造，拒绝通过 new 创建对象
     * @param {*} [opts={}]
     * @memberof IBizNotification
     */
    private constructor(opts: any = {}) {
    }

    /**
     * 获取 IBizNotification 单例对象
     *
     * @static
     * @returns {IBizNotification}
     * @memberof IBizNotification
     */
    public static getInstance(): IBizNotification {
        if (!IBizNotification.iBizNotification) {
            IBizNotification.iBizNotification = new IBizNotification()
        }
        return this.iBizNotification
    }

    /**
     * 信息
     *
     * @param {string} title 标题
     * @param {string} desc 内容
     * @param {number} [duration] 关闭时间，默认4.5秒 （可选）
     * @memberof IBizNotification
     */
    public info(title: string, desc: string, duration?: number): void {
        // iview.Notice.info({ title: title, desc: desc, duration: duration ? duration : 4.5 });
    }

    /**
     * 成功
     *
     * @param {string} title 标题
     * @param {string} desc 内容
     * @param {number} [duration] 关闭时间，默认4.5秒 （可选）
     * @memberof IBizNotification
     */
    public success(title: string, desc: string, duration?: number): void {
        // iview.Notice.success({ title: title, desc: desc, duration: duration ? duration : 4.5 });
    }

    /**
     * 警告
     *
     * @param {string} title 标题
     * @param {string} desc 内容
     * @param {number} [duration] 关闭时间，默认4.5秒 （可选）
     * @memberof IBizNotification
     */
    public warning(title: string, desc: string, duration?: number): void {
        // iview.Notice.warning({ title: title, desc: desc, duration: duration ? duration : 4.5 });
    }

    /**
     * 错误
     *
     * @param {string} title 标题
     * @param {string} desc 内容 
     * @param {number} [duration] 关闭时间，默认4.5秒 （可选）
     * @memberof IBizNotification
     */
    public error(title: string, desc: string, duration?: number): void {
        // iview.Notice.error({ title: title, desc: desc, duration: duration ? duration : 4.5 });
    }

    /**
     * 确认对话框
     *
     * @param {string} title 标题
     * @param {string} contant 内容
     * @returns {Subject<any>} 可订阅对象
     * @memberof IBizNotification
     */
    public confirm(title: string, contant: string): Subject<any> {
        const subject: Subject<any> = new Subject();
        // iview.Modal.confirm({
        //     title: title,
        //     content: contant,
        //     onOk: () => {
        //         subject.next('OK');
        //     }
        // });
        return subject;
    }
}