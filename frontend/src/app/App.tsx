import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  GitBranch,
  Globe,
  Heart,
  Layers,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  PlusCircle,
  Search,
  Send,
  Shield,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Page =
  | "dashboard"
  | "posts"
  | "create-post"
  | "post-details"
  | "monitoring"
  | "cicd"
  | "profile";

type ApiComment = {
  id: number;
  body: string;
  author_name: string;
  created_at: string;
};

type ApiPost = {
  id: number;
  title: string;
  content: string;
  is_published: boolean;
  author_name: string;
  created_at: string;
  updated_at: string;
  comments: ApiComment[];
};

type AuthState = {
  accessToken: string;
  refreshToken: string;
  username: string;
  email: string;
};

type SignupPayload = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  password: string;
  confirm_password: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://django-app-1-c2is.onrender.com/api/";
const activityData = [
  { label: "Mon", posts: 1, comments: 2 },
  { label: "Tue", posts: 2, comments: 4 },
  { label: "Wed", posts: 3, comments: 5 },
  { label: "Thu", posts: 2, comments: 6 },
  { label: "Fri", posts: 4, comments: 8 },
  { label: "Sat", posts: 1, comments: 3 },
  { label: "Sun", posts: 2, comments: 5 },
];

const pipelineStages = [
  { name: "Checkout", status: "success", duration: "12s" },
  { name: "Lint & Tests", status: "success", duration: "1m 18s" },
  { name: "Build Docker Image", status: "success", duration: "1m 42s" },
  { name: "Push Image", status: "running", duration: "40s" },
  { name: "Deploy to Cluster", status: "pending", duration: "--" },
];

const navItems: { key: Page; label: string; icon: typeof FileText }[] = [
  { key: "dashboard", label: "Dashboard", icon: Layers },
  { key: "posts", label: "Blog Posts", icon: FileText },
  { key: "create-post", label: "Create Post", icon: PlusCircle },
  { key: "monitoring", label: "Monitoring", icon: Activity },
  { key: "cicd", label: "CI / CD", icon: GitBranch },
  { key: "profile", label: "Profile", icon: User },
];

function getStoredAuth(): AuthState | null {
  const accessToken = window.localStorage.getItem("accessToken");
  const refreshToken = window.localStorage.getItem("refreshToken");
  const username = window.localStorage.getItem("username");
  const email = window.localStorage.getItem("email");

  if (!accessToken || !refreshToken || !username) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    username,
    email: email || "",
  };
}

function persistAuth(auth: AuthState) {
  window.localStorage.setItem("accessToken", auth.accessToken);
  window.localStorage.setItem("refreshToken", auth.refreshToken);
  window.localStorage.setItem("username", auth.username);
  window.localStorage.setItem("email", auth.email);
}

function clearAuth() {
  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("refreshToken");
  window.localStorage.removeItem("username");
  window.localStorage.removeItem("email");
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed.";

    try {
      const data = await response.json();
      if (typeof data === "string") {
        message = data;
      } else if (data.detail) {
        message = data.detail;
      } else {
        message = Object.values(data).flat().join(" ");
      }
    } catch {
      message = `${response.status} ${response.statusText}`;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[#1E293B] border border-white/[0.06] rounded-xl ${className}`}
    >
      {children}
    </div>
  );
}

function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "muted" | "error";
}) {
  const variants = {
    default: "bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/20",
    success: "bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/20",
    warning: "bg-[#F59E0B]/15 text-[#FCD34D] border border-[#F59E0B]/20",
    muted: "bg-[#334155]/70 text-[#94A3B8] border border-white/5",
    error: "bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium font-mono ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  icon: Icon,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  icon?: typeof ArrowRight;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
}) {
  const variants = {
    primary:
      "bg-[#6366F1] hover:bg-[#5558E3] text-white border border-[#6366F1]/50 shadow-lg shadow-[#6366F1]/20",
    outline:
      "bg-transparent hover:bg-white/[0.04] text-[#CBD5E1] border border-white/[0.1]",
    ghost:
      "bg-transparent hover:bg-white/[0.04] text-[#94A3B8] border border-transparent",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: typeof User;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#CBD5E1]">{label}</label>
      <div className="relative">
        {Icon ? (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
        ) : null}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-white/[0.08] bg-[#0F172A] px-4 py-2.5 text-sm text-[#F1F5F9] outline-none transition-all placeholder:text-[#475569] focus:border-[#6366F1]/60 ${Icon ? "pl-9" : ""}`}
        />
      </div>
    </div>
  );
}

function Sidebar({
  page,
  onNavigate,
  mobile,
  onClose,
}: {
  page: Page;
  onNavigate: (page: Page) => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/[0.06] bg-[#0B1120]">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-lg shadow-[#6366F1]/30">
          <Layers className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#F1F5F9]">Post Your Thought</p>
          <p className="text-[10px] font-mono text-[#64748B]">
            Blog
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map(({ key, label, icon: Icon }) => {
          const active = page === key;
          return (
            <button
              key={key}
              onClick={() => {
                onNavigate(key);
                onClose?.();
              }}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                active
                  ? "border-[#6366F1]/20 bg-[#6366F1]/15 text-[#818CF8]"
                  : "border-transparent text-[#64748B] hover:bg-white/[0.04] hover:text-[#CBD5E1]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </nav>
      {mobile ? (
        <div className="border-t border-white/[0.06] px-3 py-3">
          <Button variant="ghost" onClick={onClose} icon={X} className="w-full">
            Close
          </Button>
        </div>
      ) : null}
    </aside>
  );
}

function LoginPage({
  onLogin,
  loading,
  error,
}: {
  onLogin: (payload: {
    username: string;
    password: string;
    email: string;
    mode: "login" | "signup";
    firstName: string;
    lastName: string;
    bio: string;
  }) => Promise<void>;
  loading: boolean;
  error: string;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (mode === "signup" && password !== confirmPassword) {
      return;
    }

    await onLogin({
      username,
      password,
      email,
      mode,
      firstName,
      lastName,
      bio,
    });
  };

  return (
    <div className="flex min-h-screen bg-[#0F172A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="relative hidden flex-1 overflow-hidden lg:flex">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute left-1/3 top-1/3 h-96 w-96 rounded-full bg-[#6366F1]/20 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 h-64 w-64 rounded-full bg-[#8B5CF6]/15 blur-3xl" />
        <div className="relative z-10 flex max-w-xl flex-col justify-center px-16">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-lg shadow-[#6366F1]/30">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#F1F5F9]">BlogPro</p>
              <p className="text-xs font-mono text-[#64748B]">I have a Thought</p>
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-[#F1F5F9]">
            Think
            <br />
            <span className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
              Create....
            </span>
            <br />
            and publish faster.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-[#64748B]">
            Share Your Thought With Us
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:max-w-md">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#1E293B]/70 p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-[#6366F1]/15 text-[#818CF8]"
                  : "text-[#64748B]"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-[#6366F1]/15 text-[#818CF8]"
                  : "text-[#64748B]"
              }`}
            >
              Sign Up
            </button>
          </div>

          <h2 className="mb-1 text-2xl font-bold text-[#F1F5F9]">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mb-8 text-sm text-[#64748B]">
            {mode === "login"
              ? "Use your username and password to access the dashboard"
              : "Register here, then the same credentials will log you in"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              value={username}
              onChange={setUsername}
              placeholder="your-username"
              icon={User}
            />
            {mode === "signup" ? (
              <>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  icon={Mail}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    value={firstName}
                    onChange={setFirstName}
                    placeholder="John"
                  />
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChange={setLastName}
                    placeholder="Doe"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#CBD5E1]">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    placeholder="Write a short bio"
                    rows={3}
                    className="w-full rounded-lg border border-white/[0.08] bg-[#0F172A] px-4 py-2.5 text-sm text-[#F1F5F9] outline-none placeholder:text-[#475569] focus:border-[#6366F1]/60"
                  />
                </div>
              </>
            ) : null}
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              icon={Lock}
            />
            {mode === "signup" ? (
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter password"
                icon={Shield}
              />
            ) : null}

            {mode === "signup" && password !== confirmPassword && confirmPassword ? (
              <p className="text-xs text-[#F87171]">Passwords must match.</p>
            ) : null}
            {error ? <p className="text-xs text-[#F87171]">{error}</p> : null}

            <Button type="submit" icon={ArrowRight} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({
  posts,
  apiHealthy,
}: {
  posts: ApiPost[];
  apiHealthy: boolean;
}) {
  const totalComments = posts.reduce(
    (sum, post) => sum + post.comments.length,
    0
  );
  const publishedPosts = posts.filter((post) => post.is_published).length;
  const uniqueAuthors = new Set(posts.map((post) => post.author_name)).size;

  const chartData =
    posts.slice(0, 7).map((post) => ({
      label: post.title.slice(0, 10) || `Post ${post.id}`,
      comments: post.comments.length,
      titleSize: Math.min(post.title.length, 60),
    })) || [];

  const metricCards = [
    {
      label: "Total Posts",
      value: posts.length,
      icon: FileText,
      color: "#818CF8",
    },
    {
      label: "Published",
      value: publishedPosts,
      icon: CheckCircle2,
      color: "#34D399",
    },
    {
      label: "Comments",
      value: totalComments,
      icon: MessageSquare,
      color: "#C084FC",
    },
    {
      label: "Authors",
      value: uniqueAuthors,
      icon: Users,
      color: "#FBBF24",
    },
  ];

  return (
    <div className="max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold text-[#F1F5F9]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{label}</p>
                <p className="mt-2 text-2xl font-bold text-[#F1F5F9]">{value}</p>
              </div>
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h3 className="text-sm font-semibold text-[#F1F5F9]">
              Post Activity
            </h3>
          </div>
          <div className="h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.length ? chartData : activityData}>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Bar dataKey="comments" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="titleSize" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F1F5F9]">API Status</h3>
            <Badge variant={apiHealthy ? "success" : "error"}>
              {apiHealthy ? "Healthy" : "Unavailable"}
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl bg-[#0F172A] p-4">
              <div className="flex items-center gap-2 text-sm text-[#CBD5E1]">
                <Zap className="h-4 w-4 text-[#34D399]" />
                Health endpoint
              </div>
              <p className="mt-2 text-xs font-mono text-[#64748B]">
                GET /api/health/
              </p>
            </div>
            <div className="rounded-xl bg-[#0F172A] p-4">
              <div className="flex items-center gap-2 text-sm text-[#CBD5E1]">
                <BookOpen className="h-4 w-4 text-[#818CF8]" />
                Posts feed
              </div>
              <p className="mt-2 text-xs font-mono text-[#64748B]">
                GET /api/posts/
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function BlogPostsPage({
  posts,
  onSelectPost,
  onNavigate,
}: {
  posts: ApiPost[];
  onSelectPost: (post: ApiPost) => void;
  onNavigate: (page: Page) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = posts.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F1F5F9]">Blog Posts</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            {filtered.length} posts connected from backend
          </p>
        </div>
        <Button icon={PlusCircle} onClick={() => onNavigate("create-post")}>
          New Post
        </Button>
      </div>

      <Card className="p-4">
        <Input
          label="Search posts"
          value={search}
          onChange={setSearch}
          placeholder="Search by title"
          icon={Search}
        />
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Title", "Author", "Status", "Comments", "Created", ""].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-medium text-[#64748B]"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-[#CBD5E1]">
                      {post.title}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-[#475569]">
                      {post.content}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#94A3B8]">
                    {post.author_name}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={post.is_published ? "success" : "warning"}>
                      {post.is_published ? "published" : "draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-[#94A3B8]">
                    {post.comments.length}
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-[#64748B]">
                    {formatDate(post.created_at)}
                  </td>
                  <td className="px-4 py-3.5">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onSelectPost(post);
                        onNavigate("post-details");
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function CreatePostPage({
  onSubmit,
  busy,
  message,
}: {
  onSubmit: (payload: {
    title: string;
    content: string;
    is_published: boolean;
  }) => Promise<void>;
  busy: boolean;
  message: string;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({ title, content, is_published: isPublished });
    setTitle("");
    setContent("");
    setIsPublished(true);
  };

  return (
    <div className="max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold text-[#F1F5F9]">Create Post</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Publish directly to the Django backend.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="p-5">
          <div className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={setTitle}
              placeholder="Post title"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#CBD5E1]">Content</label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={14}
                placeholder="Write your post content"
                className="w-full rounded-xl border border-white/[0.08] bg-[#0F172A] px-4 py-3 text-sm text-[#CBD5E1] outline-none placeholder:text-[#475569] focus:border-[#6366F1]/60"
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-[#CBD5E1]">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(event) => setIsPublished(event.target.checked)}
              />
              Publish immediately
            </label>
          </div>
        </Card>

        {message ? <p className="text-sm text-[#34D399]">{message}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" icon={Send} disabled={busy}>
            {busy ? "Publishing..." : "Publish Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function PostDetailsPage({
  post,
  onAddComment,
  commentBusy,
}: {
  post: ApiPost | null;
  onAddComment: (body: string) => Promise<void>;
  commentBusy: boolean;
}) {
  const [body, setBody] = useState("");

  if (!post) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <p className="text-sm text-[#94A3B8]">
            No post selected. Open a post from the list first.
          </p>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onAddComment(body);
    setBody("");
  };

  return (
    <div className="max-w-5xl space-y-6 p-6">
      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant={post.is_published ? "success" : "warning"}>
            {post.is_published ? "published" : "draft"}
          </Badge>
          <Badge variant="muted">{post.author_name}</Badge>
          <Badge variant="muted">{formatDate(post.created_at)}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-[#F1F5F9]">{post.title}</h1>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#CBD5E1]">
          {post.content}
        </p>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F1F5F9]">
            Comments
            <span className="ml-2 font-mono text-xs text-[#64748B]">
              {post.comments.length}
            </span>
          </h3>
        </div>

        <div className="space-y-4">
          {post.comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-white/[0.05] bg-[#0F172A]/60 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6366F1]/20 text-xs font-semibold text-[#818CF8]">
                    {getInitials(comment.author_name)}
                  </div>
                  <span className="text-sm font-semibold text-[#CBD5E1]">
                    {comment.author_name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#475569]">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-sm text-[#94A3B8]">{comment.body}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            placeholder="Write a comment"
            className="w-full rounded-xl border border-white/[0.08] bg-[#0F172A] px-4 py-3 text-sm text-[#CBD5E1] outline-none placeholder:text-[#475569] focus:border-[#6366F1]/60"
          />
          <Button type="submit" icon={MessageSquare} disabled={commentBusy || !body.trim()}>
            {commentBusy ? "Posting..." : "Add Comment"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function MonitoringPage({ apiHealthy }: { apiHealthy: boolean }) {
  const chartData = [
    { time: "00:00", value: 20 },
    { time: "04:00", value: 34 },
    { time: "08:00", value: 48 },
    { time: "12:00", value: 65 },
    { time: "16:00", value: 54 },
    { time: "20:00", value: 32 },
  ];

  return (
    <div className="max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold text-[#F1F5F9]">Monitoring</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Health view for the connected API and sample infra telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F1F5F9]">Backend Health</h3>
            <Badge variant={apiHealthy ? "success" : "error"}>
              {apiHealthy ? "ok" : "down"}
            </Badge>
          </div>
          <p className="mt-4 text-sm text-[#94A3B8]">
            C\
          </p>
        </Card>

        <Card className="xl:col-span-2">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h3 className="text-sm font-semibold text-[#F1F5F9]">Sample Load Trend</h3>
          </div>
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366F1"
                  fill="rgba(99,102,241,0.25)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CICDPage() {
  return (
    <div className="max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold text-[#F1F5F9]">CI / CD</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          UI panel for the task's GitHub Actions and deployment flow.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <h3 className="text-sm font-semibold text-[#F1F5F9]">Pipeline Stages</h3>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {pipelineStages.map((stage) => (
            <div key={stage.name} className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F172A]">
                {stage.status === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-[#34D399]" />
                ) : stage.status === "running" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#818CF8]" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-[#64748B]" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#CBD5E1]">{stage.name}</p>
                <p className="text-xs font-mono text-[#64748B]">{stage.duration}</p>
              </div>
              <Badge
                variant={
                  stage.status === "success"
                    ? "success"
                    : stage.status === "running"
                    ? "default"
                    : "muted"
                }
              >
                {stage.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ProfilePage({ auth }: { auth: AuthState }) {
  return (
    <div className="max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold text-[#F1F5F9]">Profile</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Basic account info currently available on the frontend.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6366F1]/20 text-lg font-semibold text-[#818CF8]">
            {getInitials(auth.username)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#F1F5F9]">{auth.username}</h2>
            <p className="text-sm text-[#64748B]">
              {auth.email || "Email not available from current login session"}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="success">JWT Authenticated</Badge>
              <Badge variant="muted">Django Backend</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DashboardLayout({
  page,
  onNavigate,
  onLogout,
  auth,
  children,
}: {
  page: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  auth: AuthState;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F172A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className={`fixed inset-y-0 left-0 z-40 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"} transition-transform`}>
        <Sidebar
          page={page}
          onNavigate={onNavigate}
          mobile
          onClose={() => setMobileOpen(false)}
        />
      </div>

      <div className="hidden lg:block">
        <Sidebar page={page} onNavigate={onNavigate} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-white/[0.06] bg-[#0B1120]/80 px-4 backdrop-blur-md">
          <button
            className="text-[#64748B] lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#F1F5F9] capitalize">
              {page.replace("-", " ")}
            </p>
            <p className="text-xs text-[#64748B]">
              Logged in as {auth.username}
            </p>
          </div>
          <Button variant="ghost" onClick={onLogout} icon={LogOut}>
            Logout
          </Button>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(() => getStoredAuth());
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [page, setPage] = useState<Page>("dashboard");
  const [apiHealthy, setApiHealthy] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [postMessage, setPostMessage] = useState("");
  const [postBusy, setPostBusy] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);

  const selectedPost =
    posts.find((post) => post.id === selectedPostId) || null;

  const loadPosts = async () => {
    const data = await apiRequest<ApiPost[]>("posts/");
    setPosts(data);
    if (selectedPostId && !data.some((post) => post.id === selectedPostId)) {
      setSelectedPostId(null);
    }
  };

  const checkHealth = async () => {
    try {
      const data = await apiRequest<{ status: string }>("health/");
      setApiHealthy(data.status === "ok");
    } catch {
      setApiHealthy(false);
    }
  };

  useEffect(() => {
    loadPosts().catch(() => undefined);
    checkHealth().catch(() => undefined);
  }, []);

  const handleAuth = async (payload: {
    username: string;
    password: string;
    email: string;
    mode: "login" | "signup";
    firstName: string;
    lastName: string;
    bio: string;
  }) => {
    setAuthLoading(true);
    setAuthError("");

    try {
      if (payload.mode === "signup") {
        const signupPayload: SignupPayload = {
          username: payload.username,
          email: payload.email,
          first_name: payload.firstName,
          last_name: payload.lastName,
          bio: payload.bio,
          password: payload.password,
          confirm_password: payload.password,
        };
        await apiRequest("signup/", {
          method: "POST",
          body: JSON.stringify(signupPayload),
        });
      }

      const tokenResponse = await apiRequest<{
        access: string;
        refresh: string;
      }>("token/", {
        method: "POST",
        body: JSON.stringify({
          username: payload.username,
          password: payload.password,
        }),
      });

      const nextAuth: AuthState = {
        accessToken: tokenResponse.access,
        refreshToken: tokenResponse.refresh,
        username: payload.username,
        email: payload.email,
      };

      persistAuth(nextAuth);
      setAuth(nextAuth);
      setPage("dashboard");
      await loadPosts();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setAuth(null);
    setPage("dashboard");
    setSelectedPostId(null);
  };

  const handleCreatePost = async (payload: {
    title: string;
    content: string;
    is_published: boolean;
  }) => {
    if (!auth) {
      return;
    }

    setPostBusy(true);
    setPostMessage("");

    try {
      await apiRequest<ApiPost>(
        "posts/",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        auth.accessToken
      );
      setPostMessage("Post created successfully.");
      await loadPosts();
      setPage("posts");
    } catch (error) {
      setPostMessage(error instanceof Error ? error.message : "Failed to create post.");
    } finally {
      setPostBusy(false);
    }
  };

  const handleAddComment = async (body: string) => {
    if (!auth || !selectedPost) {
      return;
    }

    setCommentBusy(true);

    try {
      await apiRequest<ApiComment>(
        `posts/${selectedPost.id}/comments/`,
        {
          method: "POST",
          body: JSON.stringify({ body }),
        },
        auth.accessToken
      );
      await loadPosts();
    } finally {
      setCommentBusy(false);
    }
  };

  if (!auth) {
    return (
      <LoginPage onLogin={handleAuth} loading={authLoading} error={authError} />
    );
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage posts={posts} apiHealthy={apiHealthy} />;
      case "posts":
        return (
          <BlogPostsPage
            posts={posts}
            onNavigate={setPage}
            onSelectPost={(post) => setSelectedPostId(post.id)}
          />
        );
      case "create-post":
        return (
          <CreatePostPage
            onSubmit={handleCreatePost}
            busy={postBusy}
            message={postMessage}
          />
        );
      case "post-details":
        return (
          <PostDetailsPage
            post={selectedPost}
            onAddComment={handleAddComment}
            commentBusy={commentBusy}
          />
        );
      case "monitoring":
        return <MonitoringPage apiHealthy={apiHealthy} />;
      case "cicd":
        return <CICDPage />;
      case "profile":
        return <ProfilePage auth={auth} />;
      default:
        return <DashboardPage posts={posts} apiHealthy={apiHealthy} />;
    }
  };

  return (
    <DashboardLayout
      page={page}
      onNavigate={setPage}
      onLogout={handleLogout}
      auth={auth}
    >
      {renderPage()}
    </DashboardLayout>
  );
}
