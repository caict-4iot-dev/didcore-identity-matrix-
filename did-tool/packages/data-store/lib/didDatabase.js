// database.js

import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('did_document.db');

// 创建表格（如果不存在）
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS did_documents (
         id TEXT PRIMARY KEY,
         context TEXT,
         verificationMethod TEXT,
         authentication TEXT,
         extension TEXT,
         service TEXT,
         created TEXT,
         updated TEXT,
         proof TEXT
    )
  `);
});

// 导出数据库对象
export default db;
