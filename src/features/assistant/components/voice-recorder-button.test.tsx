import { act, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ActionResult } from "@/lib/action-result";
import { deferred } from "@/test/deferred";
import { FakeMediaRecorder, removeMicrophone, stubMicrophone } from "@/test/microphone";
import { renderWithUser } from "@/test/render";
import { transcribeRecording } from "../actions";
import { formatElapsed, MAX_RECORDING_SECONDS, VoiceRecorderButton } from "./voice-recorder-button";

vi.mock("../actions", () => ({ transcribeRecording: vi.fn() }));

function Box({ initial = "", disabled = false }: { initial?: string; disabled?: boolean }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <output aria-label="Message">{value}</output>
      <VoiceRecorderButton value={value} onChange={setValue} disabled={disabled} />
    </>
  );
}

afterEach(() => {
  removeMicrophone();
  vi.useRealTimers();
});

describe("VoiceRecorderButton", () => {
  it("records until stopped, then adds the transcript to the message", async () => {
    const { track, getUserMedia } = stubMicrophone();
    const transcript = deferred<ActionResult<{ text: string }>>();
    vi.mocked(transcribeRecording).mockReturnValue(transcript.promise);
    const { user } = renderWithUser(<Box initial="Note:" />);

    await user.click(screen.getByRole("button", { name: "Record voice message" }));
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    const stopButton = screen.getByRole("button", { name: "Stop recording" });
    expect(stopButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("timer", { name: "Recording time" })).toHaveTextContent("0:00");
    expect(FakeMediaRecorder.instances[0].mimeType).toBe("audio/webm;codecs=opus");

    await user.click(stopButton);
    expect(track.stop).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Transcribing…" })).toBeDisabled();
    const sent = vi.mocked(transcribeRecording).mock.calls[0][0].get("audio") as File;
    expect(sent.name).toBe("voice.webm");
    expect(sent.type).toBe("audio/webm;codecs=opus");

    await act(async () => transcript.resolve({ ok: true, data: { text: " call Jane tomorrow " } }));
    expect(screen.getByLabelText("Message")).toHaveTextContent("Note: call Jane tomorrow");
    expect(screen.getByRole("button", { name: "Record voice message" })).toBeEnabled();
  });

  it("stops by itself after two minutes", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    stubMicrophone();
    vi.mocked(transcribeRecording).mockResolvedValue({ ok: true, data: { text: "Hello" } });
    const { user } = renderWithUser(<Box />);

    await user.click(screen.getByRole("button", { name: "Record voice message" }));
    act(() => vi.advanceTimersByTime(65_000));
    expect(screen.getByRole("timer")).toHaveTextContent("1:05");
    act(() => vi.advanceTimersByTime((MAX_RECORDING_SECONDS - 65) * 1000));

    await waitFor(() => expect(screen.getByLabelText("Message")).toHaveTextContent("Hello"));
    expect(transcribeRecording).toHaveBeenCalledTimes(1);
  });

  it("asks for microphone access when it is refused", async () => {
    stubMicrophone(async () => {
      throw new DOMException("denied", "NotAllowedError");
    });
    const { user } = renderWithUser(<Box />);

    await user.click(screen.getByRole("button", { name: "Record voice message" }));

    expect(toast.error).toHaveBeenCalledWith("Allow microphone access to record");
    expect(screen.getByRole("button", { name: "Record voice message" })).toBeEnabled();
    expect(FakeMediaRecorder.instances).toHaveLength(0);
  });

  it("tells you when no speech was recognized or the API failed", async () => {
    stubMicrophone();
    vi.mocked(transcribeRecording)
      .mockResolvedValueOnce({ ok: true, data: { text: "  " } })
      .mockResolvedValueOnce({ ok: false, error: "The recording could not be read", status: 400 });
    const { user } = renderWithUser(<Box initial="Keep" />);

    for (let i = 0; i < 2; i++) {
      await user.click(screen.getByRole("button", { name: "Record voice message" }));
      await user.click(screen.getByRole("button", { name: "Stop recording" }));
      await screen.findByRole("button", { name: "Record voice message" });
    }

    expect(toast.info).toHaveBeenCalledWith("No speech was recognized");
    expect(toast.error).toHaveBeenCalledWith("The recording could not be read");
    expect(screen.getByLabelText("Message")).toHaveTextContent(/^Keep$/);
  });

  it("drops the recording when the message is sent", async () => {
    const { track } = stubMicrophone();
    const { user, rerender } = renderWithUser(<Box />);

    await user.click(screen.getByRole("button", { name: "Record voice message" }));
    rerender(<Box disabled />);

    expect(track.stop).toHaveBeenCalled();
    expect(FakeMediaRecorder.instances[0].state).toBe("inactive");
    expect(transcribeRecording).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Record voice message" })).toBeDisabled();
  });

  it("stops recording when it unmounts", async () => {
    const { track } = stubMicrophone();
    const { user, unmount } = renderWithUser(<Box />);

    await user.click(screen.getByRole("button", { name: "Record voice message" }));
    unmount();

    expect(track.stop).toHaveBeenCalled();
    expect(transcribeRecording).not.toHaveBeenCalled();
  });

  it("is hidden when the browser cannot record", () => {
    renderWithUser(<Box />);
    expect(screen.queryByRole("button", { name: "Record voice message" })).not.toBeInTheDocument();
  });

  it("formats the elapsed time", () => {
    expect(formatElapsed(0)).toBe("0:00");
    expect(formatElapsed(119)).toBe("1:59");
  });
});
