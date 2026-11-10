import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct InstitutionRowView: View {
  var row: WidgetInstitutionRow

  // Balance wins: the name column is capped at 40% of the row width and
  // truncates, while the balance keeps every point it needs (WDG-48).
  var body: some View {
    GeometryReader { geometry in
      HStack(spacing: 2) {
        Image(systemName: "building.columns")
          .font(.caption)
          .foregroundStyle(WidgetTheme.accentOrange)
        VStack(alignment: .leading, spacing: 0) {
          Text(row.name)
            .font(.caption)
            .foregroundStyle(WidgetTheme.primaryText)
            .lineLimit(1)
            .truncationMode(.tail)
          Text("\(row.accountCount) contas")
            .font(.caption2)
            .foregroundStyle(WidgetTheme.secondaryText)
            .lineLimit(1)
        }
        .frame(width: geometry.size.width * 0.4, alignment: .leading)
        Spacer(minLength: 2)
        Text(row.balance)
          .font(.caption)
          .foregroundStyle(WidgetTheme.primaryText)
          .lineLimit(1)
          .minimumScaleFactor(0.7)
      }
    }
    .frame(height: 42)
    .padding(4)
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
            .font(family == .systemSmall ? .headline : .title2)
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
