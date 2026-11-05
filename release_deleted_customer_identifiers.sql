-- 既存の削除済み顧客(deleted=true)が保持したままのemail/loginIdを解放する。
-- email/loginIdはDB上グローバルにユニークなため、保持されたままだと
-- 新規顧客が同じメール/IDで登録できない(Unique constraint違反)。
-- 過去の注文履歴・顧客IDなど他の情報は一切変更しない。
--
-- 実行前の確認（対象件数を見る）:
--   SELECT id, name, email, "loginId" FROM "Customer"
--   WHERE deleted = true AND (email IS NOT NULL OR "loginId" IS NOT NULL);

BEGIN;

UPDATE "Customer"
SET email = NULL, "loginId" = NULL
WHERE deleted = true
  AND (email IS NOT NULL OR "loginId" IS NOT NULL);

COMMIT;
