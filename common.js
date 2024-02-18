//創建新結點id
function generateUniqueId() {
    const timestamp = Date.now(); // 獲取當前時間戳
    const randomPart = Math.random().toString(36).substring(2, 8); // 生成一個隨機字符串
    return `${timestamp}-${randomPart}`;
}
