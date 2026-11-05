"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  BookText,
  CircleHelp,
  GraduationCap,
  Home,
  LayoutDashboard,
  Lightbulb,
  Menu,
  NotebookPen,
  Search,
  Settings2,
  Sparkles,
  TrendingUp,
  Volume2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";
import { useSettings } from "@/lib/settings";
import { Button, Modal, RateControl } from "@/components/ui";

interface NavLeaf {
  href: string;
  label: string;
  tab?: "workbook" | "custom";
}

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  children?: NavLeaf[];
  match?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "TỔNG QUAN",
    items: [
      { href: "/", label: "Trang chủ", icon: <Home className="h-[17px] w-[17px]" /> },
      {
        href: "/lektion/1",
        label: "Tổng quan bài học",
        icon: <LayoutDashboard className="h-[17px] w-[17px]" />,
      },
    ],
  },
  {
    title: "HỌC TẬP THEO MODULE",
    items: [
      {
        href: "/kursbuch/vocabulary",
        label: "1. Kursbuch",
        icon: <BookOpen className="h-[17px] w-[17px]" />,
        match: ["/kursbuch"],
        children: [
          { href: "/kursbuch/vocabulary", label: "Từ vựng (Wortschatz)" },
          { href: "/kursbuch/grammar", label: "Ngữ pháp (Grammatik)" },
        ],
      },
      {
        href: "/arbeitsbuch",
        label: "2. Arbeitsbuch",
        icon: <NotebookPen className="h-[17px] w-[17px]" />,
        match: ["/arbeitsbuch"],
        children: [
          { href: "/arbeitsbuch?tab=workbook", label: "Bài tập theo sách", tab: "workbook" },
          { href: "/arbeitsbuch?tab=custom", label: "Bài tập mở rộng", tab: "custom" },
        ],
      },
      {
        href: "/practice/listening",
        label: "3. Practice 4 Skills",
        icon: <GraduationCap className="h-[17px] w-[17px]" />,
        match: ["/practice"],
        children: [
          { href: "/practice/listening", label: "Luyện nghe (Hören)" },
          { href: "/practice/reading", label: "Luyện đọc (Lesen)" },
          { href: "/practice/writing", label: "Luyện viết (Schreiben)" },
          { href: "/practice/speaking", label: "Luyện nói (Sprechen)" },
        ],
      },
    ],
  },
  {
    title: "THEO DÕI",
    items: [
      {
        href: "/lektion/1#tien-do",
        label: "Tiến độ học tập",
        icon: <TrendingUp className="h-[17px] w-[17px]" />,
        match: ["/lektion/1"],
      },
    ],
  },
];

const breadcrumbLabels: Record<string, string> = {
  "": "Trang chủ",
  lektion: "Lektion 1",
  kursbuch: "Kursbuch",
  vocabulary: "Từ vựng",
  grammar: "Ngữ pháp",
  arbeitsbuch: "Arbeitsbuch",
  practice: "Practice 4 Skills",
  listening: "Luyện nghe",
  reading: "Luyện đọc",
  writing: "Luyện viết",
  speaking: "Luyện nói",
};

function NavLink({
  href,
  label,
  active,
  children,
  onClick,
}: {
  href: string;
  label: string;
  active?: boolean;
  children?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium transition-colors",
        active ? "bg-soft text-navy" : "text-[#526178] hover:bg-[#f4f7fd] hover:text-navy",
      )}
    >
      <span className={cn("shrink-0", active ? "text-[#2457b8]" : "text-[#7586a3]")}>{children}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { speechRate } = useSettings();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const update = () => setSearch(window.location.search);
    update();
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, [pathname]);

  const tab = new URLSearchParams(search).get("tab");

  return (
    <>
      <div className="px-6 pb-5 pt-6">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5" aria-label="Deutsch Lernen - Trang chủ">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <span className="text-[17px] font-black">D</span>
          </span>
          <span>
            <span className="block text-[17px] font-extrabold leading-tight tracking-[-0.02em] text-navy">
              Deutsch Lernen<span className="text-primary">.</span>
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
              Menschen A1
            </span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-5 thin-scrollbar">
        <div className="mb-5 rounded-xl border border-[#d6e3ff] bg-soft p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#5272a8]">
                Giáo trình hiện tại
              </p>
              <p className="mt-1 text-[12px] font-bold leading-4 text-navy">Lektion 1: Guten Tag!</p>
            </div>
            <BookText className="mt-0.5 h-4 w-4 shrink-0 text-[#5272a8]" aria-hidden="true" />
          </div>
        </div>

        <nav aria-label="Điều hướng chính" className="space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#8795ab]">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = item.match?.some((prefix) => pathname.startsWith(prefix)) ?? false;
                  return (
                    <div key={item.label}>
                      <NavLink href={item.href} label={item.label} active={active} onClick={onNavigate}>
                        {item.icon}
                      </NavLink>
                      {item.children ? (
                        <div className="ml-4 mt-1 space-y-0.5 border-l border-line pl-2">
                          {item.children.map((child) => {
                            const childPath = child.href.split("?")[0].split("#")[0];
                            const childActive = child.tab
                              ? pathname === "/arbeitsbuch" && !pathname.includes("/arbeitsbuch/") && tab === child.tab
                              : pathname === childPath;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={onNavigate}
                                className={cn(
                                  "block rounded-md px-3 py-[7px] text-[12px] transition-colors",
                                  childActive
                                    ? "bg-[#f1f5ff] font-semibold text-[#2457b8]"
                                    : "text-[#6a7890] hover:bg-[#f7f9fd] hover:text-navy",
                                )}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-6 rounded-xl border border-line bg-[#fafbff] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold text-navy">Chế độ âm thanh</p>
            <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <p className="mt-0.5 text-[10px] text-muted">Tốc độ phát chuẩn: {speechRate.toFixed(1)}x</p>
          <div className="mt-2">
            <RateControl compact />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#f0e3b7] bg-warning-soft p-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          <p className="text-[10px] leading-4 text-[#7c5100]">
            Mẹo: học 20 phút mỗi ngày mang lại hiệu quả bền vững hơn học dồn.
          </p>
        </div>
      </div>

      <div className="border-t border-line px-4 py-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e9eefb] text-[11px] font-bold text-navy">
            MA
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-bold text-navy">Minh Anh</p>
            <p className="text-[10px] text-muted">A1 Learner · Lưu cục bộ</p>
          </div>
          <Settings2 className="h-4 w-4 text-[#8795ab]" aria-hidden="true" />
        </div>
      </div>
    </>
  );
}

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  let crumbs: string[] = [];
  if (segments.length === 0) {
    crumbs = ["Trang chủ"];
  } else if (segments[0] === "lektion") {
    crumbs = ["Lektion 1", "Tổng quan"];
  } else if (segments[0] === "kursbuch") {
    crumbs = ["Kursbuch", breadcrumbLabels[segments[1]] ?? "Bài học"];
  } else if (segments[0] === "arbeitsbuch") {
    crumbs = ["Arbeitsbuch", segments[1] ? "Làm bài tập" : "Thư viện bài tập"];
  } else if (segments[0] === "practice") {
    crumbs = ["Practice 4 Skills", breadcrumbLabels[segments[1]] ?? "Luyện tập"];
  } else {
    crumbs = segments.map((segment) => breadcrumbLabels[segment] ?? segment);
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5 text-[12px] text-muted">
      <span className="hidden shrink-0 font-medium text-[#8795ab] sm:inline">Menschen A1</span>
      {crumbs.map((crumb, index) => (
        <span key={`${crumb}-${index}`} className="flex min-w-0 items-center gap-1.5">
          <span className="hidden text-[#b6c0cf] sm:inline">/</span>
          <span
            className={cn(
              "truncate",
              index === crumbs.length - 1 ? "font-semibold text-navy" : "hidden sm:inline",
            )}
          >
            {crumb}
          </span>
        </span>
      ))}
    </div>
  );
}

function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return;
    const onDown = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [notificationsOpen]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/kursbuch/vocabulary?q=${encodeURIComponent(trimmed)}` : "/kursbuch/vocabulary");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] w-full max-w-[1280px] items-center gap-3 px-4 sm:px-6 lg:h-[76px] lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-navy lg:hidden"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="h-4.5 w-4.5" aria-hidden="true" />
        </button>

        <Breadcrumbs />

        <form onSubmit={submitSearch} className="ml-auto hidden min-w-0 md:block" role="search">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b99ad]"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tra cứu từ vựng, ngữ pháp..."
              aria-label="Tra cứu từ vựng, ngữ pháp"
              className="h-9 w-[250px] rounded-lg border border-[#e3e9f4] bg-white/80 pl-9 pr-14 text-[12px] text-navy placeholder:text-[#98a5b8] focus:border-primary/40 focus:bg-white focus:outline-none xl:w-[310px]"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-line bg-[#f7f9fd] px-1.5 py-0.5 text-[9px] font-semibold text-[#8b99ad]">
              ⌘K
            </kbd>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:ml-2">
          <RateControl compact />

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white hover:text-navy"
            aria-label="Hỗ trợ và hướng dẫn"
          >
            <CircleHelp className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((value) => !value)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white hover:text-navy"
              aria-label="Thông báo"
              aria-expanded={notificationsOpen}
            >
              <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e04f3d]" />
            </button>
            {notificationsOpen ? (
              <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-line bg-white p-3 shadow-xl animate-fade-up">
                <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
                  Thông báo
                </p>
                <Link
                  href="/lektion/1"
                  onClick={() => setNotificationsOpen(false)}
                  className="flex gap-2.5 rounded-xl p-2 hover:bg-[#f7f9fd]"
                >
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block text-[12px] font-semibold text-navy">
                      Lektion 1 đã sẵn sàng
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-muted">
                      Bắt đầu với từ vựng và ngữ pháp của bài Guten Tag!
                    </span>
                  </span>
                </Link>
                <Link
                  href="/arbeitsbuch"
                  onClick={() => setNotificationsOpen(false)}
                  className="flex gap-2.5 rounded-xl p-2 hover:bg-[#f7f9fd]"
                >
                  <NotebookPen className="mt-0.5 h-4 w-4 shrink-0 text-[#2457b8]" aria-hidden="true" />
                  <span>
                    <span className="block text-[12px] font-semibold text-navy">
                      6 bộ bài tập đang chờ
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-muted">
                      Gồm 3 bộ theo sách và 3 bộ tự tạo.
                    </span>
                  </span>
                </Link>
              </div>
            ) : null}
          </div>

          <span className="mx-1 hidden h-6 w-px bg-line sm:block" />

          <div className="hidden items-center gap-2 sm:flex">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e9eefb] text-[10px] font-bold text-navy">
              MA
            </span>
            <div className="hidden leading-tight xl:block">
              <p className="text-[11px] font-bold text-navy">Minh Anh</p>
              <p className="text-[9px] text-muted">A1 Learner</p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Hỗ trợ & hướng dẫn nhanh"
        description="Bản demo giao diện học tập, dữ liệu Lektion 1 và tiến độ được lưu cục bộ trong trình duyệt."
      >
        <div className="space-y-4 text-sm leading-6 text-[#3f4d63]">
          <div className="rounded-xl border border-line bg-[#fbfcff] p-3">
            <p className="text-[12px] font-bold text-navy">Phím tắt</p>
            <p className="mt-1 text-xs text-muted">
              <kbd className="rounded border border-line bg-white px-1.5 py-0.5 text-[10px]">⌘K</kbd> /{" "}
              <kbd className="rounded border border-line bg-white px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>{" "}
              để tìm từ vựng · <kbd className="rounded border border-line bg-white px-1.5 py-0.5 text-[10px]">Esc</kbd>{" "}
              để đóng hộp thoại.
            </p>
          </div>
          <div>
            <p className="text-[12px] font-bold text-navy">Âm thanh</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Các nút phát âm dùng giọng tiếng Đức của trình duyệt (Web Speech API). Nếu thiết bị không có
              giọng de-DE, nút sẽ báo không khả dụng thay vì phát giọng ngôn ngữ khác. Tốc độ có thể chỉnh
              ở góc trên bên phải.
            </p>
          </div>
          <div>
            <p className="text-[12px] font-bold text-navy">Dữ liệu học tập</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Tiến độ, bài làm và bản nháp Writing nằm trong localStorage của trình duyệt này. Đổi trình
              duyệt hoặc xóa dữ liệu trang sẽ không tự mang theo tiến độ.
            </p>
          </div>
          <div>
            <p className="text-[12px] font-bold text-navy">Writing trong bản này</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Chưa kết nối backend Gemini. Nút “Chấm bằng AI” đang dùng bộ chấm quy tắc cục bộ để minh hoạ
              luồng phản hồi; kết quả không phải đánh giá CEFR chính thức.
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={() => setHelpOpen(false)}>Đã hiểu</Button>
        </div>
      </Modal>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { storageError, clearStorageError } = useProgress();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[288px] flex-col border-r border-line bg-white lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-navy/35 backdrop-blur-[2px]"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[288px] max-w-[86vw] flex-col bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-[#f3f6fc]"
              aria-label="Đóng menu"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-[288px]">
        <Topbar onOpenMenu={() => setMobileOpen(true)} />
        {storageError ? (
          <div className="mx-auto mt-3 w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-[#f3c1ba] bg-danger-soft px-3.5 py-2.5 text-[12px] leading-5 text-danger"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p className="flex-1">{storageError}</p>
              <button
                type="button"
                onClick={clearStorageError}
                className="shrink-0 rounded p-0.5 hover:bg-white/60"
                aria-label="Đóng cảnh báo"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}
        <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </main>
        <footer className="mx-auto w-full max-w-[1280px] border-t border-line/70 px-4 py-6 text-center text-[11px] text-muted sm:px-6 lg:px-8">
          Deutsch Lernen · Menschen A1 · Dữ liệu học tập lưu cục bộ trong trình duyệt
        </footer>
      </div>
    </div>
  );
}
