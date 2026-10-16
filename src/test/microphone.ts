import { vi } from "vitest";

/** A stand-in for the browser's MediaRecorder: stopping emits one chunk of fake audio. */
export class FakeMediaRecorder {
  static instances: FakeMediaRecorder[] = [];
  static isTypeSupported = (type: string) => type === "audio/webm;codecs=opus";

  state: RecordingState = "inactive";
  mimeType: string;
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  constructor(
    public stream: MediaStream,
    options?: MediaRecorderOptions,
  ) {
    this.mimeType = options?.mimeType ?? "";
    FakeMediaRecorder.instances.push(this);
  }

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["audio"], { type: this.mimeType }) });
    this.onstop?.();
  }
}

/**
 * Pretend the browser can record. Pass a `getUserMedia` mock to simulate a refused
 * permission. Undo with `removeMicrophone()`.
 */
export function stubMicrophone(getUserMedia?: () => Promise<MediaStream>) {
  FakeMediaRecorder.instances = [];
  const track = { stop: vi.fn() };
  const stream = { getTracks: () => [track] } as unknown as MediaStream;
  const request = vi.fn(getUserMedia ?? (async () => stream));
  vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
  Object.defineProperty(navigator, "mediaDevices", {
    value: { getUserMedia: request },
    configurable: true,
  });
  return { track, getUserMedia: request };
}

export function removeMicrophone() {
  Reflect.deleteProperty(navigator, "mediaDevices");
}
