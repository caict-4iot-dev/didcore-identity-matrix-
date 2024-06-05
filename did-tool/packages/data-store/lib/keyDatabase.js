// database.js

import sqlite3 from 'sqlite3';

const kdb = new sqlite3.Database('key_document.db');

// 创建表格（如果不存在）
kdb.serialize(() => {
    kdb.run(`
    CREATE TABLE IF NOT EXISTS key_documents (
         id TEXT PRIMARY KEY,
         keyStore TEXT
    )
  `);
});

// 导出数据库对象
export default kdb;
