import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";

export function MessageDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const message = useQuery({
    queryKey: ["message", id],
    queryFn: () => api.message(id),
    enabled: Boolean(id),
  });
  const respond = useMutation({
    mutationFn: (eventType: "VIEWED" | "ACCEPTED" | "DECLINED") =>
      api.respondToMessage(id, eventType, `${id}-${eventType}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["messages"] });
      void client.invalidateQueries({ queryKey: ["message", id] });
    },
    onError: (cause) =>
      setError(
        cause instanceof Error
          ? cause.message
          : "Respons belum berhasil disimpan.",
      ),
  });

  const hasViewed = useRef(false);

  useEffect(() => {
    if (
      message.data &&
      !hasViewed.current &&
      !message.data.response_state
    ) {
      hasViewed.current = true;
      respond.mutate("VIEWED");
    }
  }, [message.data, respond]);

  if (message.isLoading) return <LoadingState />;
  if (message.isError || !message.data)
    return (
      <ErrorState
        message="Pesan tidak ditemukan atau sesi tidak memiliki akses."
        onRetry={() => void message.refetch()}
      />
    );
  return (
    <div className="max-w-2xl space-y-5 pt-3">
      <button
        className="text-sm font-bold text-orange-600"
        onClick={() => navigate("/app/inbox")}
      >
        Kembali ke inbox
      </button>
      <Card className="p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
          Simulated message
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold">
          {message.data.title}
        </h1>
        <p className="mt-5 leading-7 text-slate-600">{message.data.body}</p>
        <p className="mt-5 text-xs text-slate-500">
          Status: {message.data.response_state ?? "NEW"}
        </p>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            disabled={
              respond.isPending ||
              Boolean(
                message.data.response_state &&
                ["ACCEPTED", "DECLINED"].includes(message.data.response_state),
              )
            }
            onClick={() => respond.mutate("ACCEPTED")}
          >
            Terima
          </Button>
          <Button
            variant="ghost"
            disabled={
              respond.isPending ||
              Boolean(
                message.data.response_state &&
                ["ACCEPTED", "DECLINED"].includes(message.data.response_state),
              )
            }
            onClick={() => respond.mutate("DECLINED")}
          >
            Tolak
          </Button>
        </div>
      </Card>
    </div>
  );
}
