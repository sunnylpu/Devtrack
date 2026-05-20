# GitHub Username API

This file documents the username-based GitHub endpoints added to DevTrack Pro backend.

Base path: `/api/github`

Endpoints (protected — require Bearer JWT like other API routes):

- `GET /api/github/profile/:username`
  - Returns public profile summary for `:username`.
  - Example:
    ```bash
    curl -H "Authorization: Bearer YOUR_JWT" http://localhost:5000/api/github/profile/octocat
    ```

- `GET /api/github/repos/:username`
  - Returns public repositories (up to 100 per page). Query param `page` supported.
  - Example:
    ```bash
    curl -H "Authorization: Bearer YOUR_JWT" "http://localhost:5000/api/github/repos/octocat?page=1"
    ```

- `GET /api/github/recent/:username`
  - Returns recent public events (PushEvent commits) for `:username`.
  - Example:
    ```bash
    curl -H "Authorization: Bearer YOUR_JWT" http://localhost:5000/api/github/recent/octocat
    ```

Notes:
- If you want higher rate limits or private-data access, set `GITHUB_TOKEN` in the backend environment; the controllers will include it automatically.
- Endpoints are implemented in `src/controllers/githubController.js` and routed via `src/routes/github.js`.
- Frontend lookup page: `frontend/src/pages/GitHubLookupPage.jsx` (uses the protected API).

If you prefer these routes to be public (no JWT required), I can remove the `protect` middleware from the route definitions.