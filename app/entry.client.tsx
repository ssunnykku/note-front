import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
    {
      onRecoverableError(error) {
        // SPA 모드: pre-render된 HydrateFallback HTML과 실제 앱의 hydration mismatch는 예상된 동작
        if (error instanceof Error && error.message.includes("#418")) return;
        console.error(error);
      },
    },
  );
});
