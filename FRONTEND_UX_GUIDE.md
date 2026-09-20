# Frontend UX Guide - TapCard

## Overview

The TapCard frontend uses the brand lock: orange `#FF5722`, charcoal `#303942`, ITC Bauhaus for the wordmark (orange period), and an orange squircle with a white scribble. Do not use gold `#C9A84C`, indigo `#1B2A6B`, or sister lao.services magenta `#D40E54`.

## Design System

### Color Palette

**Primary Colors:**
- Orange: `#FF5722`
- Charcoal: `#303942`

**Background Colors:**
- App chrome: charcoal `#303942`
- Card backgrounds: `white/5` on charcoal
- Borders: `white/10`

**Text Colors:**
- Primary: `white` on charcoal chrome
- Body on marketing: charcoal `#303942`
- Links: orange `#FF5722`

### Typography

- **Wordmark:** ITC Bauhaus (Comfortaa fallback) — TapCard with an orange period
- **UI:** Satoshi / Inter
- **Links:** brand orange

### Components

#### Buttons

**Primary Button:**
```tsx
className="rounded-lg bg-brand-orange px-6 py-3 text-sm font-medium text-white hover:bg-[#e64a19] transition-all shadow-lg shadow-brand-orange/25"
```

**Secondary Button:**
```tsx
className="rounded-lg border-2 border-white/20 bg-white/5 backdrop-blur-sm px-6 py-3 text-sm font-medium hover:border-brand-orange/50 hover:bg-brand-orange/10 transition"
```

#### Cards

**Feature Card:**
```tsx
className="rounded-2xl border border-blue-500/10 bg-gradient-to-br from-slate-800/50 to-blue-900/20 backdrop-blur-sm p-6 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
```

**Stats Card:**
```tsx
className="rounded-xl border border-blue-500/10 bg-gradient-to-br from-slate-800/50 to-blue-900/20 backdrop-blur-sm p-6 hover:border-blue-500/30 transition-all"
```

#### Input Fields

```tsx
className="w-full rounded-lg bg-slate-900/50 border border-blue-500/20 pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
```

## Pages

### 1. Landing Page (`/`)

**Features:**
- Hero section with gradient background and floating orbs
- Trust indicators (Secure, Instant Setup, Free to Start)
- 9 feature cards in 3-column grid
- "How it works" section with 3 steps
- Call-to-action section with gradient background
- Comprehensive footer with links

**Key Elements:**
- Logo with gradient icon
- Gradient text for emphasis
- Hover effects on feature cards
- Responsive design (mobile-first)

### 2. Login Page (`/login`)

**Features:**
- Centered form with backdrop blur
- Icon-enhanced input fields
- Loading state with spinner
- Demo credentials hint
- Link to registration
- Forgot password link

**UX Improvements:**
- Visual feedback on focus
- Clear error messages
- Smooth transitions
- Gradient background orbs

### 3. Register Page (`/register`)

**Features:**
- Similar design to login for consistency
- Full name, email, and password fields
- Password requirements hint
- Terms of service agreement
- Auto sign-in after registration

**UX Improvements:**
- Icon-enhanced inputs
- Validation feedback
- Loading states
- Clear call-to-action

### 4. Dashboard (`/dashboard`)

**Features:**
- Welcome message with emoji
- 3 stats cards (Total Cards, Total Views, Published)
- Empty state with call-to-action
- Cards grid with management options
- Sticky navigation bar

**UX Improvements:**
- Visual hierarchy with icons
- Hover effects on stats cards
- Empty state encourages first card creation
- Quick access to "New Card" button

### 5. Dashboard Layout

**Features:**
- Sticky top navigation
- Logo with gradient branding
- User profile display with avatar
- Quick links (Dashboard, New Card)
- Sign out button

**Navigation:**
- Dashboard
- New Card
- Analytics (placeholder)
- Settings (placeholder)

## Icons

Using **Lucide React** icons throughout:
- `CreditCard` - Logo and card-related features
- `QrCode` - QR code functionality
- `Share2` - Sharing features
- `Palette` - Customization
- `BarChart3` - Analytics
- `Download` - Export features
- `Zap` - Speed/instant features
- `Shield` - Security
- `Smartphone` - Mobile optimization
- `Eye` - Views/visibility
- `TrendingUp` - Growth/published
- `Plus` - Create new
- `User` - User profile
- `Mail` - Email
- `Lock` - Password/security
- `ArrowRight` - Navigation

## Responsive Design

### Breakpoints
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

### Grid Layouts
- Features: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Stats: `grid-cols-1 sm:grid-cols-3`

## Animations & Transitions

### Hover Effects
- Scale: `group-hover:scale-110`
- Shadow: `hover:shadow-xl hover:shadow-blue-500/10`
- Border: `hover:border-blue-500/30`
- Colors: `hover:from-blue-700 hover:to-cyan-600`

### Loading States
- Spinner: `animate-spin` with gradient border
- Pulse: `animate-pulse` for loading indicators

### Page Transitions
- All transitions: `transition-all duration-300`
- Color transitions: `transition-colors`

## Accessibility

### Best Practices
- Semantic HTML elements
- Proper heading hierarchy (h1, h2, h3)
- Alt text for images (when added)
- Focus states on interactive elements
- Keyboard navigation support
- ARIA labels where needed

### Color Contrast
- White text on dark backgrounds (WCAG AAA)
- Gray-400 text on dark backgrounds (WCAG AA)
- Blue-400 links on dark backgrounds (WCAG AA)

## Performance

### Optimizations
- Backdrop blur for glassmorphism effect
- CSS gradients instead of images
- SVG icons (Lucide React)
- Lazy loading for images
- Optimized Tailwind CSS bundle

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

### Planned Features
1. **Dark/Light Mode Toggle** - User preference
2. **Animations** - Framer Motion for page transitions
3. **Micro-interactions** - Button clicks, card flips
4. **Toast Notifications** - Success/error feedback
5. **Loading Skeletons** - Better loading states
6. **Progressive Web App** - Offline support
7. **Analytics Dashboard** - Charts and graphs
8. **Settings Page** - User preferences
9. **Profile Customization** - Avatar upload
10. **Card Templates** - Pre-designed card layouts

### Component Library
Consider creating reusable components:
- `Button` - Primary, secondary, ghost variants
- `Input` - With icon support
- `Card` - Feature, stats, content variants
- `Badge` - Status indicators
- `Modal` - Dialogs and confirmations
- `Toast` - Notifications
- `Dropdown` - Menus and selects
- `Tabs` - Navigation within pages

## Development Guidelines

### File Structure
```
src/
├── app/                    # Next.js pages
│   ├── page.tsx           # Landing page
│   ├── login/             # Auth pages
│   ├── register/
│   └── dashboard/         # Protected pages
├── components/            # Reusable components
├── lib/                   # Utilities
├── styles/               # Global styles
└── types/                # TypeScript types
```

### Naming Conventions
- Components: PascalCase (`BusinessCard.tsx`)
- Files: kebab-case for routes
- CSS classes: Tailwind utility classes
- Variables: camelCase

### Code Style
- Use TypeScript for type safety
- Functional components with hooks
- Client components marked with `'use client'`
- Proper error handling
- Loading states for async operations

## Testing Checklist

- [ ] All pages render correctly
- [ ] Forms validate input
- [ ] Error messages display properly
- [ ] Loading states work
- [ ] Navigation functions correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Hover effects work
- [ ] Focus states visible
- [ ] Keyboard navigation works
- [ ] Links go to correct destinations

## Deployment

The frontend is ready to deploy to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Custom server** with Docker

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

**Last Updated:** Feb 19, 2026
**Version:** 1.0.0
**Maintained by:** TapCard Team
