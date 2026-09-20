import Link from "next/link";
import {
  ArrowRight,
  Coffee,
  Leaf,
  LogIn,
  QrCode,
  ShoppingBag,
  Sparkles,
  Utensils,
} from "lucide-react";

const highlights = [
  { icon: Utensils, label: "Bữa sáng nóng hổi" },
  { icon: Coffee, label: "Cà phê pha tại quán" },
  { icon: Leaf, label: "Không gian nhiều cây xanh" },
];

const signatureItems = [
  {
    number: "01",
    name: "Bún bò Huế",
    description: "Nước dùng thơm sả, thịt bò mềm, chả và rau tươi.",
    price: "55.000 đ",
    tone: "terracotta",
    icon: Utensils,
  },
  {
    number: "02",
    name: "Cà phê sữa",
    description: "Cà phê phin đậm vị hòa cùng sữa đặc, dùng với đá.",
    price: "30.000 đ",
    tone: "coffee",
    icon: Coffee,
  },
  {
    number: "03",
    name: "Bánh mì chảo",
    description: "Trứng ốp la, xúc xích, pa-tê và sốt cà chua nóng hổi.",
    price: "49.000 đ",
    tone: "garden",
    icon: Sparkles,
  },
];

export function HomePage() {
  return (
    <main className="home-page">
      <header className="home-header">
        <Link href="/" className="home-brand" aria-label="Coffee Garden - Trang chủ">
          <span className="home-brand-mark">CG</span>
          <span>
            <strong>Coffee Garden</strong>
            <small>Coffee · Breakfast · Garden</small>
          </span>
        </Link>

        <nav className="home-nav" aria-label="Điều hướng chính">
          <a href="#cau-chuyen">Không gian</a>
          <a href="#mon-dac-trung">Thực đơn</a>
          <Link href="/staff/tables" className="home-login-link">
            <LogIn size={15} /> Khu vực nhân viên
          </Link>
        </nav>
      </header>

      <section className="home-hero" id="cau-chuyen">
        <div className="home-hero-copy">
          <p className="home-eyebrow">
            <Leaf size={15} /> Một góc vườn giữa ngày bận rộn
          </p>
          <h1>
            Một khoảng xanh
            <span>cho ngày thật dịu.</span>
          </h1>
          <p className="home-hero-description">
            Bữa sáng nóng hổi, cà phê pha vừa tới và một góc ngồi đủ yên để bạn
            bắt đầu ngày mới theo cách mình muốn.
          </p>

          <div className="home-hero-actions">
            <a href="#mon-dac-trung" className="home-primary-action">
              Khám phá thực đơn <ArrowRight size={17} />
            </a>
            <a href="#nhan-vien" className="home-text-action">
              Khu vực nhân viên
            </a>
          </div>

          <div className="home-highlights" aria-label="Tiện ích tại quán">
            {highlights.map(({ icon: Icon, label }) => (
              <span key={label}>
                <Icon size={15} /> {label}
              </span>
            ))}
          </div>
        </div>

        <div className="home-showcase" aria-label="Không khí tại Coffee Garden">
          <span className="home-decor-leaf home-decor-leaf-one" aria-hidden="true" />
          <span className="home-decor-leaf home-decor-leaf-two" aria-hidden="true" />

          <div className="home-showcase-card">
            <div className="home-showcase-topline">
              <span className="home-open-badge"><i /> Đang mở cửa</span>
              <span>07:00 — 22:00</span>
            </div>

            <div className="home-cup-scene" aria-hidden="true">
              <span className="home-sun" />
              <span className="home-plant home-plant-left" />
              <span className="home-plant home-plant-right" />
              <span className="home-steam home-steam-one" />
              <span className="home-steam home-steam-two" />
              <span className="home-cup"><Coffee size={76} /></span>
              <span className="home-table-line" />
            </div>

            <div className="home-showcase-message">
              <span>Khoảnh khắc hôm nay</span>
              <strong>Chậm một chút.<br />Ngon hơn một chút.</strong>
            </div>
          </div>

          <div className="home-floating-note home-floating-table">
            <span>Mở cửa mỗi ngày</span>
            <strong>7—22</strong>
          </div>
          <div className="home-floating-note home-floating-rating">
            <span className="home-rating-icon"><Leaf size={15} /></span>
            <span><strong>Pha mới mỗi ngày</strong><small>Đậm vị · vừa gu</small></span>
          </div>
        </div>
      </section>

      <section className="home-signature" id="mon-dac-trung">
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">Thực đơn được yêu thích</p>
            <h2>Món quen, vị thật.</h2>
          </div>
          <span className="home-menu-link">
            <QrCode size={16} /> Quét QR tại bàn để gọi món
          </span>
        </div>

        <div className="home-signature-grid">
          {signatureItems.map(({ icon: Icon, ...item }) => (
            <article className={`home-signature-card home-signature-${item.tone}`} key={item.name}>
              <div className="home-dish-visual">
                <span>{item.number}</span>
                <Icon size={38} strokeWidth={1.35} />
              </div>
              <div className="home-dish-content">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <strong>{item.price}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-staff-section" id="nhan-vien" aria-labelledby="staff-heading">
        <div className="home-staff-intro">
          <p className="home-eyebrow">Khu vực nhân viên</p>
          <h2 id="staff-heading">Gọi món giúp khách tại bàn.</h2>
          <p>Đăng nhập, chọn bàn khách đang ngồi và tạo order trực tiếp cho bàn đó.</p>
        </div>
        <div className="home-staff-access">
          <div className="home-staff-steps" aria-label="Quy trình gọi món cho khách">
            <span><b>01</b><strong>Đăng nhập</strong></span>
            <span><b>02</b><strong>Chọn bàn</strong></span>
            <span><b>03</b><strong>Tạo order</strong></span>
          </div>
          <Link href="/staff/tables" className="home-staff-button">
            <ShoppingBag size={18} /> Vào khu vực nhân viên <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-brand home-footer-brand">
          <span className="home-brand-mark">CG</span>
          <span><strong>Coffee Garden</strong><small>Mỗi ngày một khoảng xanh.</small></span>
        </div>
        <p>Phục vụ cà phê và bữa sáng mỗi ngày · 07:00 — 22:00</p>
      </footer>
    </main>
  );
}
