/**
 * A promise you resolve by hand, for testing pending states:
 *
 *   const save = deferred<ActionResult>();
 *   vi.mocked(saveThing).mockReturnValue(save.promise);
 *   // …assert the spinner / disabled button…
 *   await act(async () => save.resolve({ ok: true, data: undefined }));
 *
 * Always resolve it before the test ends. React keeps every later transition
 * pending while an earlier async action is unfinished, which breaks other tests.
 */
export function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
