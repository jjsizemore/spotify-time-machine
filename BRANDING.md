Repository branding and Spotify Design guidance
=============================================

This project uses Spotify's visual design language for color, tone, and iconography.

Primary reference
- Spotify Design Guidelines: <https://developer.spotify.com/documentation/design>

What this file enforces
- Centralized color tokens live in `src/lib/branding.ts` for programmatic use.
- CSS variables for colors are defined in `src/app/globals.css` and used across components.
- Any use of Spotify logo/brand marks must follow the trademark and logo usage rules in
  the official guidelines. Keep assets under `public/` and document license/permission.

Developer notes
- When adding or updating colors in code, prefer importing tokens from
  `src/lib/branding.ts` or using CSS variables in `src/app/globals.css`.
- Avoid hard-coded hex values for brand colors in components. If you find any, replace
  them with tokens and open a tiny PR referencing this file.
- For questions about trademark usage or permission to use Spotify marks beyond the
  scope of this project, consult Spotify's brand site or legal team.

Quick checklist for PRs touching UI/branding
- [ ] Uses color tokens from `src/lib/branding.ts` or CSS variables in `src/app/globals.css`.
- [ ] No new unapproved Spotify brand assets added to `public/` without documentation.
- [ ] Accessibility: color contrast checked for text on background per WCAG.
- [ ] Update this file with any new brand assets and usage notes.
