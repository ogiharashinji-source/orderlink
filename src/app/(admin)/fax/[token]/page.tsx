"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";

type LinkData = {
  link: {
    token: string;
    title: string | null;
    message: string | null;
    expiresAt: string | null;
    attachmentPath: string | null;
    customer: { name: string; company: string | null; address: string | null; faxNumber: string | null };
  };
  products: Array<{ id: number; name: string; price: number; unit: string; description: string | null }>;
};

export default function FaxPrintPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<LinkData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [orderUrl, setOrderUrl] = useState("");

  useEffect(() => {
    fetch(`/api/order-links/${token}`)
      .then((r) => r.json())
      .then(async (d: LinkData) => {
        setData(d);
        const url = `${window.location.origin}/order/${token}`;
        setOrderUrl(url);
        const qr = await QRCode.toDataURL(url, { width: 200, margin: 2, errorCorrectionLevel: "M" });
        setQrDataUrl(qr);
      });
  }, [token]);

  if (!data) return <div className="p-8 text-gray-500">読み込み中...</div>;

  const { link, products } = data;
  const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          @page { size: A4; margin: 15mm; }
        }
        body { font-family: -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif; }
      `}</style>

      <div className="no-print bg-blue-600 text-white px-6 py-3 flex items-center justify-between">
        <span className="font-medium">FAX発注書プレビュー</span>
        <button
          onClick={() => window.print()}
          className="bg-white text-blue-700 px-4 py-1.5 rounded text-sm font-semibold hover:bg-blue-50"
        >
          印刷 / PDF保存
        </button>
      </div>

      <div className="max-w-[210mm] mx-auto p-8 bg-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{link.title || "ご注文書"}</h1>
            <p className="text-gray-500 mt-1">{today}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-semibold text-base text-gray-800">{link.customer.name}</p>
            {link.customer.company && <p>{link.customer.company}</p>}
            {link.customer.address && <p>{link.customer.address}</p>}
            {link.customer.faxNumber && <p>FAX: {link.customer.faxNumber}</p>}
          </div>
        </div>

        {/* Message */}
        {link.message && (
          <div className="bg-gray-50 rounded p-3 mb-5 text-sm text-gray-700 whitespace-pre-wrap">
            {link.message}
          </div>
        )}

        {/* QR Section */}
        <div className="flex gap-6 mb-6 p-4 border-2 border-blue-400 rounded-lg bg-blue-50">
          <div className="flex-shrink-0">
            {qrDataUrl && <img src={qrDataUrl} alt="QRコード" className="w-32 h-32" />}
          </div>
          <div className="flex-1">
            <p className="font-bold text-blue-800 text-lg mb-1">スマートフォンでご注文</p>
            <p className="text-sm text-blue-700 mb-2">
              左のQRコードをスマートフォンのカメラで読み取ると、かんたんにご注文いただけます。
            </p>
            <p className="text-xs text-gray-500 break-all">{orderUrl}</p>
            {link.expiresAt && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                ※ 有効期限: {new Date(link.expiresAt).toLocaleDateString("ja-JP")} まで
              </p>
            )}
          </div>
        </div>

        {/* Attachment */}
        {link.attachmentPath && (() => {
          const ext = link.attachmentPath.split(".").pop()?.toLowerCase() ?? "";
          const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);
          return (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">添付ファイル</p>
              {isImage ? (
                <img src={link.attachmentPath} alt="添付画像" className="max-w-full max-h-96 rounded" />
              ) : (
                <a
                  href={link.attachmentPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  📎 {link.attachmentPath.split("/").pop()}
                </a>
              )}
            </div>
          );
        })()}

        {/* Product List */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-gray-600 px-3 py-2 text-left">商品名</th>
              <th className="border border-gray-600 px-3 py-2 text-left">説明</th>
              <th className="border border-gray-600 px-3 py-2 text-right w-24">単価</th>
              <th className="border border-gray-600 px-3 py-2 text-center w-16">単位</th>
              <th className="border border-gray-600 px-3 py-2 text-center w-28">ご注文数量</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border border-gray-300 px-3 py-2.5 font-medium">{p.name}</td>
                <td className="border border-gray-300 px-3 py-2.5 text-gray-500">{p.description ?? ""}</td>
                <td className="border border-gray-300 px-3 py-2.5 text-right">¥{p.price.toLocaleString()}</td>
                <td className="border border-gray-300 px-3 py-2.5 text-center text-gray-600">{p.unit}</td>
                <td className="border border-gray-300 px-3 py-2.5 text-center">
                  <div className="border-b border-gray-400 h-6 mx-2"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-400 text-center">
          このFAXまたはQRコードからご注文をお受けいたします。ご不明な点はお問い合わせください。
        </div>
      </div>
    </>
  );
}
