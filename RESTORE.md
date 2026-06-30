# データベース復元手順書

OrderLink (Neon PostgreSQL) のバックアップからデータベースを復元する手順です。

---

## 目次

1. [バックアップファイルの取得](#1-バックアップファイルの取得)
2. [新しい Neon データベースへの復元](#2-新しい-neon-データベースへの復元)
3. [既存の Neon データベースへの上書き復元](#3-既存の-neon-データベースへの上書き復元)
4. [ローカル PostgreSQL への復元](#4-ローカル-postgresql-への復元)
5. [復元後の確認](#5-復元後の確認)
6. [トラブルシューティング](#6-トラブルシューティング)

---

## 1. バックアップファイルの取得

### GitHub Actions Artifact からダウンロード

1. [GitHub リポジトリ](https://github.com/ogiharashinji-source/orderlink) を開く
2. **Actions** タブをクリック
3. 左サイドバーの **"Daily Database Backup"** を選択
4. 復元したい日付の実行をクリック
5. ページ下部 **Artifacts** セクションの `db-backup-xxx` をクリックしてダウンロード
6. ZIP を解凍すると `orderlink_backup_YYYYMMDD_HHMMSS.sql` が得られる

> バックアップは **30日間** 保存されます。それ以前のデータへの復元は不可能です。

---

## 2. 新しい Neon データベースへの復元

障害等で新しい Neon プロジェクト・データベースを作成した場合の手順です。

### 事前準備

1. [Neon コンソール](https://console.neon.tech) で新しいプロジェクトを作成
2. **Connection Details** → **Direct connection**（`-pooler` なし）の接続情報を確認

```
Host:     ep-xxxx-xxxx.us-east-1.aws.neon.tech
Database: neondb
User:     neondb_owner
Password: (Neon コンソールで確認)
```

### 復元コマンド

```bash
# 接続情報を設定
export PGPASSWORD="Neonのパスワード"
HOST="ep-xxxx-xxxx.us-east-1.aws.neon.tech"   # -pooler なしのホスト名
USER="neondb_owner"
DB="neondb"
BACKUP_FILE="orderlink_backup_YYYYMMDD_HHMMSS.sql"

# 復元実行
psql \
  --host="$HOST" \
  --port=5432 \
  --username="$USER" \
  --dbname="$DB" \
  --file="$BACKUP_FILE"
```

### Vercel の環境変数を更新

復元後、新しい接続先に合わせて Vercel の環境変数を変更してください。

1. [Vercel ダッシュボード](https://vercel.com) → プロジェクト → **Settings** → **Environment Variables**
2. `DATABASE_URL` を新しい接続文字列に更新

```
postgresql://neondb_owner:パスワード@ep-xxxx-xxxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

3. Vercel の **Deployments** から最新デプロイを **Redeploy** して反映

---

## 3. 既存の Neon データベースへの上書き復元

> **警告: この操作は現在のデータをすべて削除します。実行前に現時点のバックアップを必ず取得してください。**

### 手順

```bash
# 接続情報を設定
export PGPASSWORD="Neonのパスワード"
HOST="ep-xxxx-xxxx.us-east-1.aws.neon.tech"   # -pooler なしのホスト名
USER="neondb_owner"
DB="neondb"
BACKUP_FILE="orderlink_backup_YYYYMMDD_HHMMSS.sql"

# 既存テーブルをすべて削除
psql \
  --host="$HOST" \
  --port=5432 \
  --username="$USER" \
  --dbname="$DB" \
  --command="DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# バックアップから復元
psql \
  --host="$HOST" \
  --port=5432 \
  --username="$USER" \
  --dbname="$DB" \
  --file="$BACKUP_FILE"
```

---

## 4. ローカル PostgreSQL への復元

開発環境や検証目的でローカルに復元する場合の手順です。

### 事前準備

PostgreSQL 18 以上がインストールされていること。

```bash
# macOS (Homebrew)
brew install postgresql@18

# Ubuntu / Debian
sudo apt-get install postgresql-18
```

### ローカル DB の作成

```bash
# PostgreSQL を起動
brew services start postgresql@18   # macOS
# sudo systemctl start postgresql   # Linux

# データベースを作成
createdb orderlink_restore
```

### 復元コマンド

```bash
BACKUP_FILE="orderlink_backup_YYYYMMDD_HHMMSS.sql"

psql \
  --host=localhost \
  --port=5432 \
  --username="$(whoami)" \
  --dbname="orderlink_restore" \
  --file="$BACKUP_FILE"
```

### ローカルで Next.js を起動

`.env.local` を作成して接続先をローカルに向けます。

```bash
# .env.local
DATABASE_URL="postgresql://ユーザー名@localhost:5432/orderlink_restore"
```

```bash
npm run dev
```

---

## 5. 復元後の確認

復元が成功したか、主要テーブルのレコード数を確認します。

```bash
export PGPASSWORD="パスワード"
HOST="ep-xxxx-xxxx.us-east-1.aws.neon.tech"
USER="neondb_owner"
DB="neondb"

psql --host="$HOST" --port=5432 --username="$USER" --dbname="$DB" <<'SQL'
SELECT
  'Admin'          AS table_name, COUNT(*) FROM "Admin"
UNION ALL SELECT 'Customer',      COUNT(*) FROM "Customer"
UNION ALL SELECT 'Product',       COUNT(*) FROM "Product"
UNION ALL SELECT 'OrderRequest',  COUNT(*) FROM "OrderRequest"
UNION ALL SELECT 'OrderLink',     COUNT(*) FROM "OrderLink"
ORDER BY table_name;
SQL
```

期待される出力例：

```
  table_name   | count
---------------+-------
 Admin         |     1
 Customer      |    XX
 OrderLink     |    XX
 OrderRequest  |    XX
 Product       |    XX
```

---

## 6. トラブルシューティング

### エラー: `FATAL: password authentication failed`

パスワードが間違っています。

```bash
# 確認: PGPASSWORD が正しく設定されているか
echo $PGPASSWORD

# Neon コンソール → Connection Details → パスワードを再確認
```

### エラー: `could not connect to server: Connection refused`

ホスト名の `-pooler` が残っている可能性があります。

```bash
# NG（プーラー経由 — pg_dump/psql では使えない場合がある）
HOST="ep-xxxx-pooler.us-east-1.aws.neon.tech"

# OK（ダイレクト接続）
HOST="ep-xxxx.us-east-1.aws.neon.tech"
```

### エラー: `ERROR: relation "xxx" already exists`

既存のテーブルと衝突しています。上書き復元の場合は事前に DROP SCHEMA を実行してください。

```bash
psql ... --command="DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

### エラー: `pg_restore: error: invalid input syntax`

バックアップファイルが破損している可能性があります。別の日付のバックアップで試してください。

### 復元後にアプリが動かない (`PrismaClientInitializationError`)

Vercel の `DATABASE_URL` が古い接続先を指したままです。
[「Vercel の環境変数を更新」](#vercel-の環境変数を更新) の手順を確認してください。

---

## 関連ファイル

- バックアップ設定: [`.github/workflows/backup.yml`](.github/workflows/backup.yml)
- バックアップ概要: [`README.md`](README.md)
