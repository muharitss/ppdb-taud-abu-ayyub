# 06 — UI Conventions

## 1. shadcn/ui Rules

### 1.1 Installation

Always install components via the official CLI. Never copy-paste component source manually.

```bash
npx shadcn@latest add <component>
```

Multiple components can be added in one command:

```bash
npx shadcn@latest add input label textarea select checkbox radio-group form dialog alert-dialog alert badge table tabs dropdown-menu sheet skeleton progress separator sonner toast
```

Configuration (already set in `components.json`):
- Style: `new-york`
- Base color: `neutral`
- CSS variables: `true`
- Alias: `@/components/ui`

---

### 1.2 Currently Installed Components

| Component | Status | Known Issue |
|---|---|---|
| `button` | ✅ Installed | Imports `cn` from `"cn"` package instead of `"@/lib/utils"` — **must fix** |
| `card` | ✅ Installed | Same `cn` import bug — **must fix** |
| `carousel` | ✅ Installed | Same `cn` import bug — **must fix** |

> **Import bug fix:** In each installed component file under `src/components/ui/`, change:
> ```ts
> // ❌ Wrong
> import { cn } from "cn"
> // ✅ Correct
> import { cn } from "@/lib/utils"
> ```
> Apply this fix before adding new components. Verify `src/lib/utils.ts` exists and exports `cn`.

---

### 1.3 Required Components for PPDB Features

Install all of the following before building PPDB pages:

```
input, label, textarea, select, checkbox, radio-group, form,
dialog, alert-dialog, alert, badge, table, tabs,
dropdown-menu, sheet, skeleton, progress, separator, sonner, toast
```

---

### 1.4 Strict Rules — What NOT to Do

- **Do NOT** modify source files of installed shadcn components under `src/components/ui/`.  
  If behavior customization is needed, wrap the component or use props.
- **Do NOT** create custom UI primitives that duplicate shadcn equivalents  
  (e.g., a custom `<MyButton>` when `<Button>` from shadcn already exists).
- **Do NOT** add utility CSS classes (e.g., `hover-lift`, `fade-in-up`) to shadcn component source.
- **Do NOT** override shadcn CSS variables (`--primary`, `--secondary`, etc.) for PPDB pages to match landing page branding — use Tailwind utilities on wrapper elements instead.

---

## 2. Landing Page Preservation Rules

The landing page (`/`) has established styles and assets that must be preserved exactly as-is. PPDB feature development must not break the landing page.

### 2.1 CSS Variables — Keep Intact

The custom CSS variables defined in `src/index.css` (or equivalent) are the landing page's color palette. Do not alter or remove them. These are separate from shadcn's own CSS variables.

### 2.2 Fonts — Keep Intact

- **Amiri** (Arabic, Google Fonts): Used for Quranic text and Arabic content on the landing page. Keep the `@import` and font-face declarations.
- **Inter** (Latin, Google Fonts): Used for body text and UI.

Do not remove either font import.

### 2.3 Animation Utilities — Keep Intact

The following CSS utility classes are landing page utilities and must not be removed:
- `.hover-lift` — subtle lift effect on hover
- `.fade-in-up` — entrance animation

These are applied directly on landing page HTML elements. Do not apply them to PPDB app pages or shadcn component internals.

### 2.4 Custom Card Styles — Keep Intact, Scope Correctly

- `.card-islamic` — custom card style with Islamic ornamental decoration.
- **Keep** this class and its styles in the CSS.
- **Do NOT** apply `.card-islamic` to shadcn `<Card>` components used on PPDB pages.
- If a PPDB page needs a visually distinct card, use shadcn's `<Card>` with Tailwind wrapper classes, not `.card-islamic`.

### 2.5 App.css (Vite Boilerplate)

`src/App.css` likely contains default Vite boilerplate styles. It is **safe to delete** only after confirming:
1. No file imports `App.css` (check `src/App.tsx` and `src/main.tsx`).
2. The landing page renders correctly without it.

---

## 3. shadcn vs. Landing Page CSS Boundary

| Zone | Component Source | Styling Approach |
|---|---|---|
| Landing page (`/`) | Custom HTML + custom CSS classes | Custom CSS variables, utility classes applied directly on HTML elements |
| PPDB pages (`/daftar/*`, `/status`, `/admin/*`) | shadcn/ui components | Tailwind utilities on wrapper `<div>`s; shadcn component props |

**Rules:**
1. Landing page HTML elements may use custom CSS variables and utility classes directly — this is expected and correct.
2. PPDB app pages must use shadcn components as the primary UI building block.
3. Never modify shadcn component source files to match landing page colors.
4. If a PPDB page needs a brand color (e.g., a green CTA), apply Tailwind utilities to a wrapper `<div>` around the shadcn component, not inside the component's source file.

**Example — correct approach:**
```tsx
// ✅ Correct: wrap the shadcn Button with a custom container
<div className="bg-[var(--brand-green)] rounded-lg p-4">
  <Button variant="default">Daftar Sekarang</Button>
</div>

// ❌ Wrong: modify Button source in src/components/ui/button.tsx
```

---

## 4. Typography

| Font | Family | Usage | Class |
|---|---|---|---|
| Inter | Latin / Latin Extended | Body text, UI labels, form fields, navigation, headings on PPDB pages | Default (no special class needed) |
| Amiri | Arabic | Quranic text, Arabic content, landing page Islamic ornamental text | `font-arabic` |

**Rules:**
- Do not apply `font-arabic` / Amiri to Latin text.
- Do not apply Inter to Arabic script content — it will render incorrectly.
- Heading font sizes follow Tailwind's default scale; do not define custom heading sizes in component source.

---

## 5. Routing and Navigation

### 5.1 Route Map

| Route | Component / Page | Access |
|---|---|---|
| `/` | Landing page (single-page scroll) | Public |
| `/daftar` | Initial registration form | Public |
| `/daftar/pembayaran` | Payment info + admin WA help + proof upload | Public (requires `registration_number` + `access_code`) |
| `/daftar/formulir` | Full registration form + KK & Akte upload | Public (accessible immediately after payment proof upload) |
| `/daftar/berhasil` | Success page + WA link | Public (requires form submitted state) |
| `/status` | Status check entry | Public |
| `/status/:registrationNumber` | Status check with pre-filled number | Public |
| `/admin/login` | Admin login | Public (redirects if already authed) |
| `/admin` | Admin dashboard | Private (admin only) |
| `/admin/pendaftar/:id` | Registrant detail + payment review | Private (admin only) |

### 5.2 React Router Configuration

- Use React Router v6+ (`createBrowserRouter` or `<BrowserRouter>`).
- Admin routes must be wrapped in an `<AdminAuthGuard>` component that checks Supabase session and `admin` role before rendering.
- Unauthenticated access to `/admin/*` redirects to `/admin/login`.

---

## 6. Layout Components

### 6.1 `PublicLayout`

Wraps all public-facing pages (landing page + PPDB registration/status pages).

```tsx
// src/layouts/PublicLayout.tsx
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer /> {/* optional */}
    </>
  );
}
```

- `Navbar` shows the school name/logo and a link to `/status`.
- Applied to: `/`, `/daftar`, `/daftar/pembayaran`, `/daftar/formulir`, `/daftar/berhasil`, `/status`, `/status/:registrationNumber`.

### 6.2 `AdminLayout`

Wraps all admin pages.

```tsx
// src/layouts/AdminLayout.tsx
export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

- Applied to: `/admin`, `/admin/pendaftar/:id`.
- `AdminSidebar` contains navigation links: Dashboard, Pendaftaran, Log Aktivitas.
- `AdminHeader` shows logged-in admin name and a logout button.

> **Note:** These are layout compositions built from shadcn primitives and custom structure — they are not replacements for any shadcn UI library component.

---

## 7. Form Conventions

### 7.1 Stack

All forms in the PPDB application must use:
- **React Hook Form** (`react-hook-form`) for form state management
- **Zod** (`zod`) for schema validation
- **shadcn `<Form>` component** (which wraps RHF's `<FormProvider>`) for consistent field layout and error display

### 7.2 File Structure

Zod schemas live alongside the feature they validate:

```
src/
  features/
    registration/
      schemas/
        initial-registration.schema.ts
        full-form.schema.ts
    payment/
      schemas/
        payment-proof.schema.ts
    status/
      schemas/
        status-check.schema.ts
    admin/
      schemas/
        payment-review.schema.ts
```

### 7.3 Usage Pattern

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({
  childName: z.string().min(2, "Nama anak wajib diisi (minimal 2 karakter)"),
})

type FormValues = z.infer<typeof schema>

export function InitialRegistrationForm() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  function onSubmit(values: FormValues) { /* call Edge Function */ }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="childName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Anak</FormLabel>
              <FormControl>
                <Input placeholder="Nama lengkap anak" {...field} />
              </FormControl>
              <FormMessage /> {/* displays Zod error in Indonesian */}
            </FormItem>
          )}
        />
        <Button type="submit">Daftar</Button>
      </form>
    </Form>
  )
}
```

### 7.4 Error Message Language

All Zod validation error messages must be written in **Indonesian (Bahasa Indonesia)**.

```ts
// ✅ Correct
z.string().min(1, "Nomor WhatsApp wajib diisi")
z.string().regex(/^08/, "Nomor WhatsApp harus diawali dengan 08")

// ❌ Wrong
z.string().min(1, "Phone number is required")
```
