import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Wallet,
  PiggyBank,
  Home as HomeIcon,
  CreditCard,
  ChevronLeft,
} from "lucide-react";
import PayForwardHome from "./pages/PayForwardHome";
import PaymentApproval from "./pages/PaymentApproval";
import SavingsTracker from "./pages/SavingsTracker";

function MobileContainer({ children }) {
  return <div className="mobile-container">{children}</div>;
}

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header
      style={{
        padding: "20px 16px 16px",
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {!isHome && (
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ChevronLeft size={24} color="var(--text-main)" />
        </button>
      )}
      <div
        style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--primary)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
          }}
        >
          T
        </div>
        <h2 style={{ fontSize: "18px", margin: 0 }}>TNG eWallet</h2>
      </div>
    </header>
  );
}

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: HomeIcon, label: "Home" },
    { path: "/savings", icon: PiggyBank, label: "Savings" },
    { path: "/pay", icon: CreditCard, label: "Pay" },
  ];

  return (
    <nav
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        background: "var(--card-bg)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-around",
        padding: "12px 0 24px",
        boxShadow: "0 -4px 10px rgba(0,0,0,0.03)",
        zIndex: 10,
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.path ||
          (item.path !== "/" && location.pathname.startsWith(item.path));
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
              color: isActive ? "var(--primary)" : "var(--text-muted)",
            }}
          >
            <Icon size={24} />
            <span
              style={{ fontSize: "12px", fontWeight: isActive ? 600 : 400 }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <MobileContainer>
        <Header />
        <div className="scroll-area">
          <Routes>
            <Route path="/" element={<PayForwardHome />} />
            <Route path="/pay" element={<PaymentApproval />} />
            <Route path="/savings" element={<SavingsTracker />} />
          </Routes>
        </div>
        <BottomNav />
      </MobileContainer>
    </Router>
  );
}

export default App;
