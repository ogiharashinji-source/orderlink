This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## データベースバックアップ

### 自動バックアップの仕組み

GitHub Actions で毎日 **AM 3:00 JST** に自動実行されます。
バックアップは GitHub Actions の Artifact として **30日間保存**されます。

- ワークフロー: `.github/workflows/backup.yml`
- 手動実行: GitHub リポジトリ → Actions → "Daily Database Backup" → "Run workflow"

### 必要な GitHub Secrets の設定

リポジトリの Settings → Secrets and variables → Actions に以下を登録してください。

| Secret名 | 値の内容 |
|---|---|
| `NEON_DB_HOST` | Neonのダイレクト接続ホスト名（`-pooler` なし） |
| `NEON_DB_USER` | データベースユーザー名 |
| `NEON_DB_NAME` | データベース名 |
| `NEON_DB_PASSWORD` | データベースパスワード |

**Neonダイレクト接続ホスト名の確認方法:**
Neon コンソール → プロジェクト → Connection Details → "Direct connection" を選択 → ホスト名をコピー

例: `ep-blue-dawn-xxxxxx.c-2.us-east-1.aws.neon.tech`（`-pooler` が付いていないもの）

### バックアップファイルのダウンロード

1. GitHub リポジトリ → Actions タブを開く
2. "Daily Database Backup" ワークフローを選択
3. 任意の実行を選択
4. ページ下部の "Artifacts" から `db-backup-xxx` をダウンロード
5. ZIP を解凍すると `orderlink_backup_YYYYMMDD_HHMMSS.sql` が取得できる

### データベースの復元方法

復元手順の詳細は **[RESTORE.md](RESTORE.md)** を参照してください。

- 新しい Neon データベースへの復元
- 既存データベースへの上書き復元
- ローカル PostgreSQL への復元
- コマンド例・トラブルシューティング
