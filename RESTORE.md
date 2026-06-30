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

## バックアップファイルについて

バックアップは Neon の pg_dump で生成されるため、ファイル先頭と末尾に Neon 固有のコマンドが含まれます。

```
\restrict <token>   ← 先頭（Neon固有）
... 通常のSQL ...
\unrestrict <token> ← 末尾（Neon固有）
```

**Neon への復元**ではそのまま使用できます。
**ローカル PostgreSQL への復元**では標準 psql がこのコマンドを認識しないため、事前に除去が必要です（[セクション4](#4-ローカル-postgresql-への復元) 参照）。

---

## 1. バックアップファイルの取得

### 方法A: ブラウザでダウンロード

1. [GitHub リポジトリ](https://github.com/ogiharashinji-source/orderlink) を開く
2. **Actions** タブをクリック
3. 左サイドバーの **"Daily Database Backup"** を選択
4. 復元したい日付の実行をクリック
5. ページ下部 **Artifacts** セクションの `db-backup-xxx` をダウンロード
6. ZIP を解凍すると `orderlink_backup_YYYYMMDD_HHMMSS.sql` が得られる

### 方法B: GitHub CLI でダウンロード

```bash
# 最新の成功したバックアップ実行IDを確認
gh run list --workflow=backup.yml --status=success --limit=5

# 指定した実行IDのArtifactをダウンロード（IDは上記コマンドで確認）
gh run download <RUN_ID> --dir ./backup-download

# ダウンロード後のファイルは db-backup-N/ サブディレクトリ内に配置される
# 例: ./backup-download/db-backup-4/orderlink_backup_20260630_102449.sql
BACKUP_FILE="./backup-download/db-backup-$(ls ./backup-download | grep db-backup | tail -1 | sed 's/db-backup-//')/$(ls ./backup-download/db-backup-*/*.sql)"
```

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

# 復元実行（\restrict / \unrestrict の警告が出ても正常に復元されます）
psql \
  --host="$HOST" \
  --port=5432 \
  --username="$USER" \
  --dbname="$DB" \
  --file="$BACKUP_FILE"
```

> 実行中に `invalid command \restrict` と表示されますが、Neon 環境では無視して問題ありません。

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

# バックアップから復元（\restrict の警告は無視して問題ありません）
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

### 事前準備: PostgreSQL サーバーのインストール

ローカルで PostgreSQL **サーバー**を動かすには、クライアントツール（`psql` コマンド）ではなくサーバーパッケージが必要です。

```bash
# macOS (Homebrew) — サーバーごとインストール
brew install postgresql@18

# インストール後、PATH を通す（keg-only のため手動設定が必要）
echo 'export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Ubuntu / Debian
sudo apt-get install postgresql-18
```

> **注意（macOS）:** `brew install libpq` はクライアントツールのみです。サーバーを起動するには `postgresql@18` が必要です。

### ローカル DB の作成

```bash
# PostgreSQL サーバーを起動
brew services start postgresql@18        # macOS（initdb は自動実行されます）
# sudo systemctl start postgresql@18    # Linux

# データベースを作成
createdb orderlink_restore
```

### Neon 固有コマンドの除去

ローカルの標準 psql は `\restrict` / `\unrestrict` を認識しないため、事前に除去します。

```bash
BACKUP_FILE="orderlink_backup_YYYYMMDD_HHMMSS.sql"

# \restrict と \unrestrict の行を除去したファイルを作成
grep -v "^\\\\restrict\|^\\\\unrestrict" "$BACKUP_FILE" > "${BACKUP_FILE%.sql}_local.sql"
BACKUP_FILE="${BACKUP_FILE%.sql}_local.sql"
```

### 復元コマンド

```bash
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
# .env.local（$(whoami) の部分は実際のユーザー名に置き換えてください）
DATABASE_URL="postgresql://$(whoami)@localhost:5432/orderlink_restore"
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

### 警告: `invalid command \restrict` / `invalid command \unrestrict`

Neon 固有のコマンドです。

- **Neon への復元**: 無視して問題ありません。復元は正常に完了します
- **ローカルへの復元**: [セクション4の「Neon 固有コマンドの除去」](#neon-固有コマンドの除去)を実施してください

### エラー: `FATAL: password authentication failed`

パスワードが間違っています。

```bash
# 確認: PGPASSWORD が正しく設定されているか
echo $PGPASSWORD

# Neon コンソール → Connection Details → パスワードを再確認
```

### エラー: `could not connect to server: Connection refused`

ホスト名の `-pooler` が残っているか、サーバーが起動していません。

```bash
# NG（プーラー経由 — pg_dump/psql では使えない場合がある）
HOST="ep-xxxx-pooler.us-east-1.aws.neon.tech"

# OK（ダイレクト接続）
HOST="ep-xxxx.us-east-1.aws.neon.tech"
```

ローカルの場合はサーバーが起動しているか確認してください。

```bash
pg_isready -h localhost -p 5432
brew services list | grep postgresql   # macOS
```

### エラー: `ERROR: relation "xxx" already exists`

既存のテーブルと衝突しています。上書き復元の場合は事前に DROP SCHEMA を実行してください。

```bash
psql ... --command="DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

### エラー: `pg_restore: error: invalid input syntax`

バックアップファイルが破損している可能性があります。別の日付のバックアップで試してください。

### エラー: `psql: command not found`（macOS）

`postgresql@18` は keg-only のため PATH が通っていません。

```bash
export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"
```

永続化するには `~/.zshrc` に上記を追記してください。

### 復元後にアプリが動かない (`PrismaClientInitializationError`)

Vercel の `DATABASE_URL` が古い接続先を指したままです。
[「Vercel の環境変数を更新」](#vercel-の環境変数を更新) の手順を確認してください。

---

## 関連ファイル

- バックアップ設定: [`.github/workflows/backup.yml`](.github/workflows/backup.yml)
- バックアップ概要: [`README.md`](README.md)
