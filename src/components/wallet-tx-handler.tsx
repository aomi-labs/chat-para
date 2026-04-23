"use client";

import { useEffect, useRef } from "react";
import {
  useAomiRuntime,
  toViemSignTypedDataArgs,
  type WalletRequest,
  type WalletEip712Payload,
  type WalletTxPayload,
} from "@aomi-labs/react";
import {
  useSendTransaction,
  useAccount,
  useSwitchChain,
  useSignTypedData,
} from "wagmi";

function parseChainId(value: number | string | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (trimmed.startsWith("0x")) {
    const parsedHex = Number.parseInt(trimmed.slice(2), 16);
    return Number.isFinite(parsedHex) ? parsedHex : undefined;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Bridge component that consumes wallet requests queued by Aomi runtime
 * and executes them through wagmi.
 */
export function WalletTxHandler() {
  const {
    pendingWalletRequests,
    startWalletRequest,
    resolveWalletRequest,
    rejectWalletRequest,
  } = useAomiRuntime();
  const { sendTransactionAsync } = useSendTransaction();
  const { signTypedDataAsync } = useSignTypedData();
  const { chainId: currentChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const processingRef = useRef(false);

  useEffect(() => {
    if (!pendingWalletRequests?.length) return;

    const [next] = pendingWalletRequests;
    if (!next || processingRef.current) return;

    processingRef.current = true;
    startWalletRequest(next.id);

    processRequest(next).finally(() => {
      processingRef.current = false;
    });

    async function processRequest(request: WalletRequest) {
      try {
        if (request.kind === "transaction") {
          const payload = request.payload as WalletTxPayload;

          const value = payload.value ? BigInt(payload.value) : undefined;

          if (payload.chainId && currentChainId && payload.chainId !== currentChainId) {
            await switchChainAsync({ chainId: payload.chainId });
          }

          const txHash = await sendTransactionAsync({
            chainId: payload.chainId,
            to: payload.to as `0x${string}`,
            value,
            data:
              payload.data && payload.data !== "0x"
                ? (payload.data as `0x${string}`)
                : undefined,
          });

          resolveWalletRequest(request.id, {
            txHash,
            amount: payload.value,
          });
          return;
        }
        const payload = request.payload as WalletEip712Payload;
        const typedData = toViemSignTypedDataArgs(payload);

        if (!typedData) {
          rejectWalletRequest(request.id, "Missing typed_data payload");
          return;
        }

        const requestChainId = parseChainId(payload.typed_data?.domain?.chainId);
        if (
          requestChainId &&
          currentChainId &&
          requestChainId !== currentChainId
        ) {
          await switchChainAsync({ chainId: requestChainId });
        }

        const signature = await signTypedDataAsync(typedData as never);
        resolveWalletRequest(request.id, { signature });
      } catch (error) {
        console.error("[WalletTxHandler] Request failed:", error);
        rejectWalletRequest(
          request.id,
          error instanceof Error ? error.message : "Request failed",
        );
      }
    }
  }, [
    pendingWalletRequests,
    currentChainId,
    switchChainAsync,
    sendTransactionAsync,
    signTypedDataAsync,
    startWalletRequest,
    resolveWalletRequest,
    rejectWalletRequest,
  ]);

  return null;
}
