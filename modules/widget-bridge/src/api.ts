// Canonical native-bridge contract. Owned by the bridge module so both the
// app-side sync hook and the native implementations share one definition.
export interface WidgetBridgeApi {
  setSnapshot: (json: string) => void;
  clearSnapshot: () => void;
  reloadTimelines: () => void;
}
