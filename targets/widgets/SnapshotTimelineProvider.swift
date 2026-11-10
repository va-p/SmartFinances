import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct SnapshotEntry: TimelineEntry {
  var date: Date
  var snapshot: WidgetSnapshot?
}

@available(iOS 17.0, *)
struct SnapshotTimelineProvider: TimelineProvider {
  func placeholder(in context: Context) -> SnapshotEntry {
    SnapshotEntry(date: Date(), snapshot: nil)
  }

  func getSnapshot(in context: Context, completion: @escaping (SnapshotEntry) -> Void) {
    completion(SnapshotEntry(date: Date(), snapshot: WidgetStore.loadSnapshot()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<SnapshotEntry>) -> Void) {
    let entry = SnapshotEntry(date: Date(), snapshot: WidgetStore.loadSnapshot())
    // No network in the extension: re-read the shared snapshot hourly so a
    // snapshot written while the app runs appears without an app restart.
    let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date().addingTimeInterval(3600)
    completion(Timeline(entries: [entry], policy: .after(next)))
  }
}

// Locked / setup / empty placeholders shared by every widget (WDG-37/39).
@available(iOS 17.0, *)
struct LockedWidgetView: View {
  var body: some View {
    VStack(spacing: 8) {
      Image(systemName: "lock.fill")
        .foregroundStyle(WidgetTheme.accentOrange)
      Text("Abra o app para ver seus dados")
        .font(.caption)
        .foregroundStyle(WidgetTheme.secondaryText)
        .multilineTextAlignment(.center)
    }
    .containerBackground(for: .widget) {
      WidgetTheme.cardBackground
    }
  }
}
