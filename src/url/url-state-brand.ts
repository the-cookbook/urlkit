const URL_STATE_BRAND: unique symbol = Symbol('urlkit.url-state');

export interface BrandedUrlState {
  readonly [URL_STATE_BRAND]: true;
}

export function markUrlState<State extends object>(state: State): State & BrandedUrlState {
  Object.defineProperty(state, URL_STATE_BRAND, {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  return state as State & BrandedUrlState;
}

export function isUrlState(input: unknown): input is BrandedUrlState {
  return (
    typeof input === 'object' &&
    input !== null &&
    (input as Partial<BrandedUrlState>)[URL_STATE_BRAND] === true
  );
}
