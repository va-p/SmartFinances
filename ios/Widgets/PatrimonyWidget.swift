import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct InstitutionRowView: View {
  var row: WidgetInstitutionRow

  // Compact columns: name and balance share the narrow Small width via
  // minimum scale instead of one side collapsing to stubs (WDG-46).
  var body: some View {
    HStack(spacing: 6) {
      Image(systemName: "building.columns")
        .font(.caption)
        .foregroundStyle(WidgetTheme.accentOrange)
      VStack(alignment: .leading, spacing: 0) {
        Text(row.name)
          .font(.caption)
          .foregroundStyle(WidgetTheme.primaryText)
          .lineLimit(1)
          .minimumScaleFactor(0.8)
        Text("\(row.accountCount) contas")
          .font(.caption2)
          .foregroundStyle(WidgetTheme.secondaryText)
          .lineLimit(1)
      }
      Spacer(minLength: 2)
      Text(row.balance)
        .font(.caption)
        .foregroundStyle(WidgetTheme.primaryText)
        .lineLimit(1)
        .minimumScaleFactor(0.8)
    }
    .padding(6)
    .background(WidgetTheme.innerCardBackground)
    .clipShape(RoundedRectangle(cornerRadius: 10))
  }
}

@available(iOS 17.0, *)
struct PatrimonyWidgetView: View {
  @Environment(\.widgetFamily) private var family
  var entry: SnapshotEntry

  var body: some View {
    VStack(alignment: .leading, spacing: 3) {
      HStack(alignment: .center) {
        VStack(alignment: .leading, spacing: 2) {
          Text("Patrimônio Total")
            .font(.caption)
            .foregroundStyle(WidgetTheme.secondaryText)
            .lineLimit(1)
          Text(entry.snapshot?.netWorth.total ?? "—")
            .font(.title2)
            .fontWeight(.bold)
            .foregroundStyle(WidgetTheme.primaryText)
            .lineLimit(1)
            .minimumScaleFactor(0.75)
        }
        Spacer(minLength: 4)
        if family == .systemMedium {
          SparklineView(points: entry.snapshot?.netWorth.spark ?? [])
            .frame(width: 140, height: 64)
            .clipped()
            .padding(.vertical, 4)
        } else {
          Link(destination: URL(string: WidgetLinks.accounts)!) {
            Image(systemName: "eye")
              .foregroundStyle(WidgetTheme.accentOrange)
          }
        }
      }
      if let institutions = entry.snapshot?.institutions, !institutions.isEmpty {
        ForEach(institutions.prefix(2), id: \.id) { row in
          InstitutionRowView(row: row)
        }
      } else {
        Text("Nenhuma conta criada ainda.")
          .font(.caption)
          .foregroundStyle(WidgetTheme.secondaryText)
      }
      Spacer(minLength: 0)
    }
    .containerBackground(for: .widget) {
      WidgetTheme.cardBackground
    }
  }
}

@available(iOS 17.0, *)
struct PatrimonyWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "PatrimonyWidget", provider: SnapshotTimelineProvider()) { entry in
      if let snapshot = entry.snapshot, snapshot.signedIn {
        PatrimonyWidgetView(entry: entry)
      } else {
        LockedWidgetView()
      }
    }
    .configurationDisplayName("Patrimônio")
    .description("Patrimônio total e saldos por instituição.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
