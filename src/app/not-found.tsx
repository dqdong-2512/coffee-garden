import Link from "next/link";
import { Coffee } from "lucide-react";

export default function NotFound() {
  return <main className="system-state">
    <Coffee size={34} />
    <p>404</p>
    <h1>Không tìm thấy trang</h1>
    <span>Đường dẫn này không tồn tại hoặc dữ liệu đã được thay đổi.</span>
    <Link className="button" href="/login">Về trang đăng nhập</Link>
  </main>;
}
