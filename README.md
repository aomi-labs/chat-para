# Para Chat Frontend

Para-branded Next.js frontend fork for two guided chat surfaces:

- `Consumer` -> `para-consumer` namespace for connected-wallet token movement
- `Dev` -> `para` namespace for wallet creation, wallet lookup, and raw-data signing

## Development

1. Install dependencies:
   ```bash
   pnpm install --frozen-lockfile
   ```

2. Start the Para frontend:
   ```bash
   pnpm dev
   ```

3. Open `http://localhost:3000/consumer`.

## Required env

- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_AOMI_PARA_DEV_API_KEY`
- `NEXT_PUBLIC_AOMI_PARA_MAIN_API_KEY`
- `NEXT_PUBLIC_PARA_API_KEY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` or `NEXT_PUBLIC_PROJECT_ID`
- optional `NEXT_PUBLIC_PARA_ENVIRONMENT`

## Notes

- The developer API key entered in the Dev route is kept in memory for the current tab and is actively cleared from the shared `aomi_api_key` localStorage slot used by the base runtime.
- The fork intentionally hides the generic Aomi multi-app/settings surface and only exposes the Consumer and Dev routes.
