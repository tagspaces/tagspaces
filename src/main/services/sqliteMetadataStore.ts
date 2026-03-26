/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

export type MetadataPayload = Record<string, unknown>;

export type MetadataEntry = {
  filePath: string;
  metadata: MetadataPayload;
  createdAt: number;
  updatedAt: number;
};

type MetadataRow = {
  file_path: string;
  metadata_json: string;
  created_at: number;
  updated_at: number;
};

class SQLiteMetadataStore {
  private dbPath: string;
  private db: sqlite3.Database | undefined;
  private initialized: boolean;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.initialized = false;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (!this.db) {
      fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
      this.db = await this.openDatabase(this.dbPath);
    }

    await this.run('PRAGMA journal_mode = WAL;');
    await this.run(`
      CREATE TABLE IF NOT EXISTS file_metadata (
        file_path TEXT PRIMARY KEY,
        metadata_json TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_file_metadata_updated_at
      ON file_metadata(updated_at);
    `);

    this.initialized = true;
  }

  async close(): Promise<void> {
    if (!this.db) {
      this.initialized = false;
      return;
    }

    const db = this.db;
    this.db = undefined;
    this.initialized = false;

    await new Promise<void>((resolve, reject) => {
      db.close((error: Error | null) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  async saveMetadata(filePath: string, metadata: MetadataPayload): Promise<void> {
    await this.initialize();

    await this.run(
      `
      INSERT INTO file_metadata (
        file_path,
        metadata_json,
        created_at,
        updated_at
      ) VALUES (
        ?,
        ?,
        CAST(strftime('%s', 'now') AS INTEGER),
        CAST(strftime('%s', 'now') AS INTEGER)
      )
      ON CONFLICT(file_path) DO UPDATE SET
        metadata_json = excluded.metadata_json,
        updated_at = excluded.updated_at;
      `,
      [filePath, JSON.stringify(metadata)],
    );
  }

  async getMetadata(filePath: string): Promise<MetadataEntry | undefined> {
    await this.initialize();

    const row = await this.get<MetadataRow>(
      `
      SELECT file_path, metadata_json, created_at, updated_at
      FROM file_metadata
      WHERE file_path = ?;
      `,
      [filePath],
    );

    if (!row) {
      return undefined;
    }

    return this.mapRow(row);
  }

  async getAllMetadata(): Promise<MetadataEntry[]> {
    await this.initialize();

    const rows = await this.all<MetadataRow>(
      `
      SELECT file_path, metadata_json, created_at, updated_at
      FROM file_metadata
      ORDER BY file_path COLLATE NOCASE;
      `,
    );

    return rows.map((row) => this.mapRow(row));
  }

  async deleteMetadata(filePath: string): Promise<boolean> {
    await this.initialize();

    const result = await this.run(
      `
      DELETE FROM file_metadata
      WHERE file_path = ?;
      `,
      [filePath],
    );

    return result.changes > 0;
  }

  async clear(): Promise<void> {
    await this.initialize();
    await this.run('DELETE FROM file_metadata;');
  }

  private mapRow(row: MetadataRow): MetadataEntry {
    let metadata: MetadataPayload;

    try {
      const parsed = JSON.parse(row.metadata_json);
      metadata =
        typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
          ? parsed
          : {};
    } catch (error) {
      throw new Error(
        `Unable to parse metadata for "${row.file_path}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return {
      filePath: row.file_path,
      metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private openDatabase(filePath: string): Promise<sqlite3.Database> {
    const sqlite = sqlite3.verbose();

    return new Promise((resolve, reject) => {
      const db = new sqlite.Database(filePath, (error: Error | null) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(db);
      });
    });
  }

  private getDatabase(): sqlite3.Database {
    if (!this.db) {
      throw new Error('SQLite metadata store is not initialized');
    }

    return this.db;
  }

  private run(
    sql: string,
    params: unknown[] = [],
  ): Promise<{ changes: number; lastID: number }> {
    const db = this.getDatabase();

    return new Promise((resolve, reject) => {
      db.run(sql, params, function (this: sqlite3.RunResult, error: Error | null) {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          changes: this.changes ?? 0,
          lastID: this.lastID ?? 0,
        });
      });
    });
  }

  private get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    const db = this.getDatabase();

    return new Promise((resolve, reject) => {
      db.get(sql, params, (error: Error | null, row: T | undefined) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(row);
      });
    });
  }

  private all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const db = this.getDatabase();

    return new Promise((resolve, reject) => {
      db.all(sql, params, (error: Error | null, rows: T[]) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(rows);
      });
    });
  }
}

export { SQLiteMetadataStore };
export default SQLiteMetadataStore;
