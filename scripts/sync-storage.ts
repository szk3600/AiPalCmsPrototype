/**
 * [Script] Smart 1:1 Storage Sync
 * ------------------------------------------------------------
 * 役割: tests/data 配下のフォルダ構造をそのまま Firebase Storage へ同期します。
 * 特殊な推論を廃止し、パスの完全一致（1:1）を保証します。
 */
import fs from 'fs';
import path from 'path';
import { ContentStorage } from '../lib/content-storage';
import { loadEnvConfig } from '@next/env';

// Next.js の環境変数をロード
const projectDir = process.cwd();
loadEnvConfig(projectDir);

/**
 * 【重要】同期スクリプトは常に Firebase Storage に接続する必要があるため、
 * 環境変数に関わらず強制的に 'remote' モードで動作させます。
 */
process.env.DATA_SOURCE = 'remote';

const DATA_ROOT = path.join(projectDir, 'tests/data');
// 同期対象とするストレージ上のルートフォルダ（意図しない同期を防ぐガード）
const ALLOWED_ROOTS = ['brand', '_cms', 'common'];

/**
 * 簡易的な MIME タイプマッピング
 */
const MIME_MAP: Record<string, string> = {
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
};

/**
 * ローカルファイルをスキャン
 */
function getLocalFiles(dir: string, fileList: Map<string, string> = new Map()): Map<string, string> {
  if (!fs.existsSync(dir)) return fileList;
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      getLocalFiles(fullPath, fileList);
    } else {
      const relativePath = path.relative(DATA_ROOT, fullPath).replace(/\\/g, '/');
      // 許可されたルートフォルダ内のみ対象とする
      if (ALLOWED_ROOTS.some(root => relativePath.startsWith(`${root}/`))) {
        fileList.set(relativePath, fullPath);
      }
    }
  });
  return fileList;
}

/**
 * リモートファイルをスキャン
 */
async function getRemoteFiles(bucket: any): Promise<Map<string, { file: any, updated: number }>> {
  const remoteMap = new Map();
  for (const prefix of ALLOWED_ROOTS) {
    const [files] = await bucket.getFiles({ prefix: `${prefix}/` });
    files.forEach((file: any) => {
      if (!file.name.endsWith('/')) {
        remoteMap.set(file.name, {
          file,
          updated: new Date(file.metadata.updated).getTime()
        });
      }
    });
  }
  return remoteMap;
}

async function smartSync() {
  console.log('🚀 Starting Smart 1:1 Storage Sync...');
  console.log('-------------------------------------------');

  const storageInstance = new ContentStorage();
  const bucket = storageInstance.getBucket();

  const localMap = getLocalFiles(DATA_ROOT);
  const remoteMap = await getRemoteFiles(bucket);

  const allPaths = new Set([...localMap.keys(), ...remoteMap.keys()]);

  let pushCount = 0;
  let pullCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const syncPath of allPaths) {
    const localPath = localMap.get(syncPath) || path.join(DATA_ROOT, syncPath);
    const remoteData = remoteMap.get(syncPath);
    const localExists = fs.existsSync(localPath);

    try {
      if (localExists && remoteData) {
        const localStats = fs.statSync(localPath);
        const localTime = localStats.mtime.getTime();
        const remoteTime = remoteData.updated;

        if (Math.abs(localTime - remoteTime) < 1000) {
          skipCount++;
          continue;
        }

        if (localTime > remoteTime) {
          await push(localPath, remoteData.file);
          pushCount++;
        } else {
          await pull(localPath, remoteData.file, remoteData.updated);
          pullCount++;
        }
      } 
      else if (localExists && !remoteData) {
        await push(localPath, bucket.file(syncPath));
        pushCount++;
      }
      else if (!localExists && remoteData) {
        await pull(localPath, remoteData.file, remoteData.updated);
        pullCount++;
      }
    } catch (e) {
      console.error(`❌ Failed: ${syncPath}`, e);
      failCount++;
    }
  }

  console.log('-------------------------------------------');
  console.log(`🏁 Sync Finished!`);
  console.log(`📊 Pushed: ${pushCount}, Pulled: ${pullCount}, Skipped: ${skipCount}, Failed: ${failCount}`);
}

async function push(localPath: string, remoteFile: any) {
  const ext = path.extname(localPath).toLowerCase();
  const contentType = MIME_MAP[ext] || 'application/octet-stream';
  console.log(`⬆️  Pushing: ${remoteFile.name} (${contentType})`);
  const content = fs.readFileSync(localPath);
  await remoteFile.save(content, {
    resumable: false,
    metadata: { contentType, cacheControl: 'no-cache' }
  });
}

async function pull(localPath: string, remoteFile: any, remoteUpdated: number) {
  console.log(`⬇️  Pulling: ${remoteFile.name}`);
  const [content] = await remoteFile.download();
  const dir = path.dirname(localPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(localPath, content);
  const mtime = new Date(remoteUpdated);
  fs.utimesSync(localPath, mtime, mtime);
}

smartSync().catch(err => {
  console.error('💥 Critical error:', err);
  process.exit(1);
});