"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <html lang="vi"><body><main className="system-state">
    <p>LỖI HỆ THỐNG</p>
    <h1>Không thể tải Coffee Garden</h1>
    <span>Vui lòng thử lại. Nếu lỗi tiếp tục, hãy kiểm tra kết nối server và database.</span>
    <button className="button" onClick={reset}>Thử lại</button>
  </main></body></html>;
}
