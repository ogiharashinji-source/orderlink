"use client";
import { useEffect, useState } from "react";
import FaxCreateForm from "./FaxCreateForm";
import FaxLinkList from "./FaxLinkList";

export default function FaxPage() {
  const [activeTab, setActiveTab] = useState<"create" | "list">("create");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">メール送信</h1>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "create"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          発注書を作成
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "list"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          発行済み一覧
        </button>
      </div>

      {activeTab === "create" && (
        <FaxCreateForm onCreated={() => { setRefreshKey((k) => k + 1); setActiveTab("list"); }} />
      )}
      {activeTab === "list" && <FaxLinkList key={refreshKey} />}
    </div>
  );
}
