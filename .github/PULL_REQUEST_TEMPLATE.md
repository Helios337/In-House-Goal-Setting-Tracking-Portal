<!--
Thanks for contributing! Please fill out the sections below.
Delete sections that don't apply.
-->

## Summary

What does this PR do, and why? Keep it short — 1–3 sentences.

## Type of change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would change existing API/UX)
- [ ] Refactor / chore (no functional change)
- [ ] Documentation only
- [ ] Infrastructure / CI

## Related issue

Closes #...

## How was this tested?

- [ ] Backend: `cd backend && pytest -q` — **xx/xx passing**
- [ ] Frontend: `cd frontend && npm run lint && npm run build`
- [ ] Manually tested in browser (describe the flow)
- [ ] Smoke test: `python scripts/smoke_test.py`
- [ ] Other: ...

## Screenshots / recordings

(For UI changes — drag and drop here.)

## Checklist

- [ ] Code follows the existing style (no new lint warnings)
- [ ] New code has tests where reasonable
- [ ] Documentation updated (`Readme.md` / `docs/`) for user-facing changes
- [ ] No secrets, real env vars, or local config files committed
- [ ] Migrations are backwards-compatible (or breaking change is called out above)
- [ ] CORS / auth implications considered if endpoints changed
- [ ] Real-time event types updated in `docs/architecture.md` §4 if events were added

## Deployment notes

Anything ops needs to do at release time (env var changes, migrations, feature flags, cache invalidation)?
