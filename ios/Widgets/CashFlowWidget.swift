import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct MiniCashFlowChart: View {
  var bars: [WidgetCashFlowBar]

  private var maxValue: Double {
    max(bars.map { max($0.income, $0.expense) }.max() ?? 1, 1)
  }

  var body: some View {
    HStack(alignment: .bottom, spacing: 4) {
      ForEach(Array(bars.prefix(8).enumerated()), id: \.offset) { _, bar in
        HStack(alignment: .bottom, spacing: 2) {
          RoundedRectangle(cornerRadius: 2)
            .fill(WidgetTheme.incomeGreen)
            .frame(width: 5, height: max(2, 40 * bar.income / maxValue))
          RoundedRectangle(cornerRadius: 2)
            .fill(WidgetTheme.overrunRed)
            .frame(width: 5, height: max(2, 40 * bar.expense / maxValue))
        }
      }
    }
  }
}

// iOS Medium diverging chart: income grows up, expenses grow down.
@available(iOS 17.0, *)
struct DivergingCashFlowChart: View {
  var bars: [WidgetCashFlowBar]

  private var maxValue: Double {
    max(bars.map { max($0.income, $0.expense) }.max() ?? 1, 1)
  }

  var body: some View {
    VStack(spacing: 2) {
      HStack(alignment: .bottom, spacing: 3) {
        ForEach(Array(bars.prefix(16).enumerated()), id: \.offset) { _, bar in
          RoundedRectangle(cornerRadius: 2)
            .fill(WidgetTheme.incomeGreen)
            .frame(width: 6, height: max(2, 44 * bar.income / maxValue))
        }
      }
      Rectangle()
        .fill(Color(white: 0.35))
        .frame(height: 1)
      HStack(alignment: .top, spacing: 3) {
        ForEach(Array(bars.prefix(16).enumerated()), id: \.offset) { _, bar in
          RoundedRectangle(cornerRadius: 2)
            .fill(WidgetTheme.overrunRed)
            .frame(width: 6, height: max(2, 30 * bar.expense / maxValue))
        }
      }
    }
  }
}

@available(iOS 17.0, *)
struct CashFlowWidgetView: View {
  @Environment(\.widgetFamily) private var family
  var entry: SnapshotEntry

  var body: some View {
    let cashFlow = entry.snapshot?.cashFlow
    HStack(alignment: .bottom) {
      VStack(alignment: .leading, spacing: 2) {
        HStack(alignment: .firstTextBaseline, spacing: 6) {
          Text(cashFlow?.monthLabel ?? "—")
            .font(.headline)
            .foregroundStyle(WidgetTheme.primaryText)
          Text("Fluxo de Caixa")
            .font(.caption)
            .foregroundStyle(WidgetTheme.secondaryText)
        }
        Text("Receitas")
          .font(.caption)
          .foregroundStyle(WidgetTheme.secondaryText)
        Text(cashFlow?.income ?? "—")
          .font(.title3)
          .fontWeight(.bold)
          .foregroundStyle(WidgetTheme.incomeGreen)
        Text("Despesas")
          .font(.caption)
          .foregroundStyle(WidgetTheme.secondaryText)
        Text(cashFlow?.expenses ?? "—")
          .font(.title3)
          .fontWeight(.bold)
          .foregroundStyle(WidgetTheme.overrunRed)
        Spacer(minLength: 0)
        if family == .systemSmall {
          MiniCashFlowChart(bars: cashFlow?.bars ?? [])
        }
      }
      Spacer()
      VStack {
        Spacer()
        if family == .systemMedium {
          DivergingCashFlowChart(bars: cashFlow?.bars ?? [])
        }
        WidgetViews.addButton(
          destination: URL(string: WidgetLinks.addTransaction)!,
          diameter: family == .systemSmall ? 44 : 56
        )
      }
    }
    .containerBackground(for: .widget) {
      WidgetTheme.cardBackground
    }
  }
}

@available(iOS 17.0, *)
struct CashFlowWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "CashFlowWidget", provider: SnapshotTimelineProvider()) { entry in
      if let snapshot = entry.snapshot, snapshot.signedIn {
        CashFlowWidgetView(entry: entry)
      } else {
        LockedWidgetView()
      }
    }
    .configurationDisplayName("Fluxo de Caixa")
    .description("Receitas e despesas do mês atual.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
