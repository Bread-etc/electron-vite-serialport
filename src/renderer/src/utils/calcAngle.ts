// 分割数据
export function splitHexData(
  hexData: string
): [[string, string], [string, string], [string, string]] {
  const startIndex = hexData.indexOf("aaaa0106");
  if (startIndex !== -1) {
    const group1 = hexData.substring(startIndex + 8, startIndex + 12);
    const group2 = hexData.substring(startIndex + 12, startIndex + 16);
    const group3 = hexData.substring(startIndex + 16, startIndex + 20);

    const splitGroups = (group: string): [string, string] => {
      return [group.substring(0, 2), group.substring(2, 4)];
    };

    return [splitGroups(group1), splitGroups(group2), splitGroups(group3)];
  }
  return [
    ["00", "00"],
    ["00", "00"],
    ["00", "00"],
  ];
}

// 添加0x, 转换为16进制
export function hexStringTohexNumber(
  hexStringList: [[string, string], [string, string], [string, string]]
): [[number, number], [number, number], [number, number]] {
  const insertStr = (singleStringList: [string, string]): [string, string] => {
    const head: string = "0x";
    return [head.concat(singleStringList[0]), head.concat(singleStringList[1])];
  };

  hexStringList = [
    insertStr(hexStringList[0]),
    insertStr(hexStringList[1]),
    insertStr(hexStringList[2]),
  ];

  const hexStrToNumber = (
    singleHexString: [string, string]
  ): [number, number] => {
    return [parseInt(singleHexString[0], 16), parseInt(singleHexString[1], 16)];
  };

  return [
    hexStrToNumber(hexStringList[0]),
    hexStrToNumber(hexStringList[1]),
    hexStrToNumber(hexStringList[2]),
  ];
}

// 计算角度
export function calculateAngles(
  groups: [[number, number], [number, number], [number, number]]
): [number, number, number] {
  const angle = (group: [number, number]): number => {
    return ((group[0] << 8) + group[1]) / 100;
  };
  return [angle(groups[0]), angle(groups[1]), angle(groups[2])];
}


// 计算ACC GYRO MAG
export function analyticData(hexData: any) {
    const startIndex = hexData.indexOf('aaaa0212');
    // 解码收到的信息
    if (startIndex !== -1) {
        const group1 = parseInt(hexData.substring(startIndex + 8, startIndex + 12), 16);
        const group2 = parseInt(hexData.substring(startIndex + 12, startIndex + 16), 16);
        const group3 = parseInt(hexData.substring(startIndex + 16, startIndex + 20), 16);
        const group4 = parseInt(hexData.substring(startIndex + 20, startIndex + 24), 16);
        const group5 = parseInt(hexData.substring(startIndex + 24, startIndex + 28), 16);
        const group6 = parseInt(hexData.substring(startIndex + 28, startIndex + 32), 16);
        const group7 = parseInt(hexData.substring(startIndex + 32, startIndex + 36), 16);
        const group8 = parseInt(hexData.substring(startIndex + 36, startIndex + 40), 16);
        const group9 = parseInt(hexData.substring(startIndex + 40, startIndex + 44), 16);
        
        // 返回解析后的数据
        return {
            group1,
            group2,
            group3,
            group4,
            group5,
            group6,
            group7,
            group8,
            group9
        };
    }
    // 如果未找到匹配的开始标志，则返回空对象
    return {};
}