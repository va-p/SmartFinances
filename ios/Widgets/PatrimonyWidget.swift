import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct InstitutionRowView: View {
  var row: WidgetInstitutionRow

  var body: some View {
    HStack(spacing: 10) {
      Image(systemName: "building.columns")
        .foregroundStyle(WidgetTheme.accentOrange)
      VStack(alignment: .leading, spacing: 0) {
        Text(row.name)
          .font(.subheadline)
          .foregroundStyle(WidgetTheme.primaryText)
          .lineLimit(1)
        Text("\(row.accountCount) contas")
          .font(.caption)
          .foregroundStyle(WidgetTheme.secondaryText)
      }
      Spacer()
      Text(row.balance)
        .font(.subheadline)
        .foregroundStyle(WidgetTheme.primaryText)
    }
    .padding(8)
    .background(WidgetTheme.innerCardBackground)
    .clipShape(RoundedRectangle(cornerRadius: 10))
  }
}

@available(iOS 17.0, *)
struct PatrimonyWidgetView: View {
  @Environment(\.widgetFamily) private var family
  var entry: SnapshotEntry

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: 2) {
          Text("Patrimônio Total")
            .font(.caption)
            .foregroundStyle(WidgetTheme.secondaryText)
          Text(entry.snapshot?.netWorth.total ?? "—")
            .font(.title2)
            .fontWeight(.bold)
            .foregroundStyle(WidgetTheme.primaryText)
        }
        Spacer()
        if family == .systemMedium {
          SparklineView(points: entry.snapshot?.netWorth.spark ?? [])
            .frame(width: 110, height: 52)
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
