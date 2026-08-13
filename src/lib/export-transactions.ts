import type { Tx } from "@/lib/data";

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadTransactionsCsv(transactions: Tx[], currency = "RWF") {
  const headers = [
    "Date",
    "Time",
    "Amount",
    "Currency",
    "Type",
    "Category",
    "Merchant",
    "Notes",
  ];

  const rows = transactions.map((tx) => {
    const merchant =
      tx.title.includes(" - ") ? tx.title.split(" - ").slice(1).join(" - ") : tx.title;
    return [
      tx.day,
      tx.time ?? "",
      String(tx.amount),
      currency,
      tx.type,
      tx.category,
      merchant,
      tx.subtitle,
    ]
      .map((cell) => escapeCsv(cell))
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `fintrace-export-${stamp}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
