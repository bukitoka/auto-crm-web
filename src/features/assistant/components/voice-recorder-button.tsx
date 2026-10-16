"use client";

import { Mic, Square } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toastResult } from "@/lib/toast-result";
import { transcribeRecording } from "../actions";

export const MAX_RECORDING_SECONDS = 120;
const MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
// Speech stays clear at 32 kbps and two minutes fit well under the upload limit.
const BITS_PER_SECOND = 32_000;

type Phase = "idle" | "recording" | "transcribing";

type Session = {
  recorder?: MediaRecorder;
  stream?: MediaStream;
  /** Set when the recording should be thrown away (unmount, message sent). */
  discarded: boolean;
};

function canRecord() {
  return typeof MediaRecorder !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
}

const noSubscribe = () => () => {};

export function formatElapsed(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function microphoneError(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Allow microphone access to record";
  }
  if (name === "NotFoundError") return "No microphone was found";
  return "The microphone could not be started";
}

function stopRecorder(session: Session | null) {
  const recorder = session?.recorder;
  if (recorder && recorder.state !== "inactive") recorder.stop();
}

/** Throw the recording away and turn the microphone off. */
function release(session: Session) {
  session.discarded = true;
  stopRecorder(session);
  for (const track of session.stream?.getTracks() ?? []) track.stop();
}

type VoiceRecorderButtonProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

/**
 * Click to start recording, click again to stop. The audio is transcribed by the API
 * (locally, with Whisper) and the text is added to the message. Hidden when the browser
 * cannot record.
 */
export function VoiceRecorderButton({ value, onChange, disabled }: VoiceRecorderButtonProps) {
  const supported = useSyncExternalStore(noSubscribe, canRecord, () => false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const sessionRef = useRef<Session | null>(null);
  // Transcription finishes later; append to what the box holds then, not at stop time.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const sessions = sessionRef;
    return () => {
      if (sessions.current) release(sessions.current);
    };
  }, []);
  // Sending disables the box: drop the recording so its text doesn't refill it.
  useEffect(() => {
    if (disabled && sessionRef.current) {
      release(sessionRef.current);
      sessionRef.current = null;
      setPhase("idle");
    }
  }, [disabled]);

  useEffect(() => {
    if (phase !== "recording") return;
    const startedAt = Date.now();
    setElapsed(0);
    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - startedAt) / 1000);
      setElapsed(Math.min(seconds, MAX_RECORDING_SECONDS));
      if (seconds >= MAX_RECORDING_SECONDS) stopRecorder(sessionRef.current);
    }, 250);
    return () => clearInterval(timer);
  }, [phase]);

  if (!supported) return null;

  async function transcribe(session: Session, audio: Blob) {
    setPhase("transcribing");
    const extension = audio.type.includes("mp4") ? "m4a" : "webm";
    const formData = new FormData();
    formData.set("audio", audio, `voice.${extension}`);
    const result = await transcribeRecording(formData);
    if (session.discarded) return;
    sessionRef.current = null;
    setPhase("idle");
    if (!toastResult(result)) return;
    const text = result.data.text.trim();
    if (!text) {
      toast.info("No speech was recognized");
      return;
    }
    const before = valueRef.current.trimEnd();
    onChange(before ? `${before} ${text}` : text);
  }

  async function start() {
    if (sessionRef.current) return; // still waiting for the permission prompt
    const session: Session = { discarded: false };
    sessionRef.current = session;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      sessionRef.current = null;
      toast.error(microphoneError(error));
      return;
    }
    if (session.discarded) {
      for (const track of stream.getTracks()) track.stop();
      return;
    }
    const mimeType = MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
    const recorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
      audioBitsPerSecond: BITS_PER_SECOND,
    });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      for (const track of stream.getTracks()) track.stop();
      if (session.discarded) return;
      const audio = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
      void transcribe(session, audio);
    };
    session.stream = stream;
    session.recorder = recorder;
    recorder.start();
    setPhase("recording");
  }

  const recording = phase === "recording";
  const transcribing = phase === "transcribing";
  const label = recording
    ? "Stop recording"
    : transcribing
      ? "Transcribing…"
      : "Record voice message";

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {recording ? (
        <span className="flex items-center gap-1.5 pl-1 text-muted-foreground text-xs tabular-nums">
          <span aria-hidden className="size-2 animate-pulse rounded-full bg-destructive" />
          <span role="timer" aria-label="Recording time">
            {formatElapsed(elapsed)}
          </span>
        </span>
      ) : null}
      <Button
        type="button"
        size="icon"
        variant={recording ? "destructive" : "ghost"}
        aria-label={label}
        title={label}
        aria-pressed={recording}
        disabled={disabled || transcribing}
        onClick={() => (recording ? stopRecorder(sessionRef.current) : void start())}
        className="rounded-full"
      >
        {recording ? <Square className="fill-current" /> : transcribing ? <Spinner /> : <Mic />}
      </Button>
    </div>
  );
}
