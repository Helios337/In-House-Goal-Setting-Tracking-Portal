---
name: Bug report
about: Report a defect, regression, or unexpected behavior
title: "[bug] "
labels: ["bug", "needs-triage"]
assignees: []
---

## Summary

A clear, concise description of the bug.

## Steps to reproduce

1. Sign in as `…@demo.example.com` (role: …)
2. Navigate to `/…`
3. Click `…`
4. Observe `…`

## Expected behavior

What you expected to happen.

## Actual behavior

What actually happened. Include error messages verbatim.

## Screenshots / logs

<details>
<summary>Backend log</summary>

```
paste relevant backend output here
```

</details>

<details>
<summary>Browser console / network tab</summary>

```
paste relevant frontend output here
```

</details>

## Environment

| Field | Value |
|-------|-------|
| Affected area | backend / frontend / infra / docs |
| Deployment mode | native dev / docker compose / kubernetes |
| Browser | (e.g., Chrome 122 on macOS) |
| Commit / version | `git rev-parse --short HEAD` |
| `docker compose ps` snapshot | (paste if relevant) |

## Additional context

Anything else that might help reproduce or diagnose.
