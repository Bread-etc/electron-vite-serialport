import * as XLSX from "xlsx";

export function createExcel(
  fileName: string,
  sheetName: string,
  newData: any[]
) {
  try {
    console.log(newData);
    // 创建工作簿
    const workBook = XLSX.utils.book_new();
    // 创建工作表
    const workSheet = XLSX.utils.json_to_sheet(newData);

    // 设置列宽为 10px
    const columns =
      newData.length > 0
        ? Object.keys(newData[0]).map(() => ({ wch: 10 }))
        : [];
    workSheet["!cols"] = columns;

    // 生成xlsx文件
    XLSX.utils.book_append_sheet(workBook, workSheet, sheetName);
    // 写文件
    XLSX.writeFile(workBook, fileName);
  } catch (error) {
    console.error("写入 Excel 文件时出现错误:", error);
  }
}
