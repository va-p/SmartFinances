import ExpoModulesCore
import WidgetKit

// Shared container with the main app (App Group entitlement
// `group.com.vap.smartfinances.widgets`, injected by the config plugin).
// The extension never hits the network: it only reads this snapshot.
private let appGroupID = "group.com.vap.smartfinances.widgets"
private let snapshotKey = "widgetSnapshot"

public class WidgetBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    Function("setSnapshot") { (json: String) in
      UserDefaults(suiteName: appGroupID)?.set(json, forKey: snapshotKey)
    }

    Function("clearSnapshot") { () in
      UserDefaults(suiteName: appGroupID)?.removeObject(forKey: snapshotKey)
    }

    Function("reloadTimelines") { () in
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }
}
