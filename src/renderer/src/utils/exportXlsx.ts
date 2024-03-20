import * as XLSX from 'xlsx';

/**
 * @description: 导出excel
 * @param {any} dataList
 * @param {Array} fields
 * @param {Array} headers
 * @param {String} fileName.extname
 * @param {String} sheetName
 * @return {*}
 */

export function exportExcel(dataList: any, fields: Array<string>, headers: Array<string>, fileName: string, sheetName: string) {
    let data = new Array();
    if (!Array.isArray(dataList)) return console.warn('dataList is not an array type');

    data = dataList.map((obj) => {
        return fields.map((field) => {
            return obj[field];
        })
    })

    if (headers.length > 0) {
        data.splice(0, 0, headers);
    } else {
        // 将headers设置为英文字段表头
        data.splice(0, 0, fields);
    }
    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(data);
    // 创建工作簿
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
}