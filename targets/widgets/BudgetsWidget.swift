import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct BudgetRowView: View {
  var row: WidgetBudgetRow

  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text(row.name)
        .font(.subheadline)
        .foregroundStyle(WidgetTheme.primaryText)
        .lineLimit(1)
        .truncationMode(.tail)
      GeometryReader { geometry in
        ZStack(alignment: .leading) {
          RoundedRectangle(cornerRadius: 8)
            .fill(WidgetTheme.innerCardBackground)
          RoundedRectangle(cornerRadius: 8)
            .fill(row.over ? WidgetTheme.overrunRed : WidgetTheme.incomeGreen)
            .frame(width: geometry.size.width * min(max(row.percent / 100.0, 0.05), 1.0))
          HStack {
            Text(row.percentLabel)
              .font(.caption)
              .foregroundStyle(.white)
              .padding(.leading, 8)
            Spacer()
            Text(row.statusText)
              .font(.caption)
              .foregroundStyle(.white)
            Image(systemName: "chevron.right")
              .font(.caption2)
              .foregroundStyle(Color(white: 0.8))
          }
          .padding(.trailing, 8)
        }
      }
      .frame(height: 24)
    }
  }
}

@available(iOS 17.0, *)
struct BudgetsWidgetView: View {
  @Environment(\.widgetFamily) private var family
  var entry: SnapshotEntry

  private var rows: [WidgetBudgetRow] {
    let ordered = entry.snapshot?.budgets ?? []
    return Array(ordered.prefix(family == .systemLarge ? 6 : 3))
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      WidgetViews.header(
        title: "Orçamentos",
        systemImage: "target",
        destination: URL(string: WidgetLinks.budgets)!
      )
      if rows.isEmpty {
        Text("Nenhum orçamento criado. Crie orçamentos no app.")
          .font(.caption)
          .foregroundStyle(WidgetTheme.secondaryText)
      } else {
        ForEach(rows, id: \.id) { row in
          Link(destination: WidgetLinks.budgetDetail(id: row.id)) {
            BudgetRowView(row: row)
          }
        }
        Spacer(minLength: 0)
      }
    }
    .containerBackground(for: .widget) {
      WidgetTheme.cardBackground
    }
  }
}

@available(iOS 17.0, *)
struct BudgetsWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "BudgetsWidget", provider: SnapshotTimelineProvider()) { entry in
      if let snapshot = entry.snapshot, snapshot.signedIn {
        BudgetsWidgetView(entry: entry)
      } else {
        LockedWidgetView()
      }
    }
    .configurationDisplayName("Orçamentos")
    .description("Acompanhe o consumo dos seus orçamentos.")
    .supportedFamilies([.systemMedium, .systemLarge])
  }
}
