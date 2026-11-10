import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct MiniCashFlowChart: View {
  var bars: [WidgetCashFlowBar]

  private var maxValue: Double {
    max(bars.map { max($0.income, $0.expense) }.max() ?? 1, 1)
  }

  var body: some View {
    HStack(alignment: .bottom, spacing: 2) {
      ForEach(Array(bars.prefix(8).enumerated()), id: \.offset) { _, bar in
        HStack(alignment: .bottom, spacing: 2) {
          RoundedRectangle(cornerRadius: 2)
            .fill(WidgetTheme.incomeGreen)
            .frame(width: 4, height: max(2, 30 * bar.income / maxValue))
          RoundedRectangle(cornerRadius: 2)
            .fill(WidgetTheme.overrunRed)
            .frame(width: 4, height: max(2, 30 * bar.expense / maxValue))
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
            .frame(width: 6, height: max(2, 40 * bar.income / maxValue))
        }
      }
      Rectangle()
        .fill(Color(white: 0.35))
        .frame(height: 1)
      HStack(alignment: .top, spacing: 3) {
        ForEach(Array(bars.prefix(16).enumerated()), id: \.offset) { _, bar in
          RoundedRectangle(cornerRadius: 2)
            .fill(WidgetTheme.overrunRed)
            .frame(width: 6, height: max(2, 26 * bar.expense / maxValue))
        }
      }
    }
  }
}

@available(iOS 17.0, *)
struct CashFlowHeaderView: View {
  var monthLabel: String

  var body: some View {
    HStack(alignment: .firstTextBaseline, spacing: 6) {
      Text(monthLabel)
        .font(.headline)
        .foregroundStyle(WidgetTheme.primaryText)
        .lineLimit(1)
        .minimumScaleFactor(0.7)
      Text("Fluxo de Caixa")
        .font(.caption)
        .foregroundStyle(WidgetTheme.secondaryText)
        .lineLimit(1)
    }
  }
}

@available(iOS 17.0, *)
struct CashFlowSmallView: View {
  var cashFlow: WidgetCashFlow?

  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      CashFlowHeaderView(monthLabel: cashFlow?.monthLabel ?? "—")
      Text("Receitas")
        .font(.caption)
        .foregroundStyle(WidgetTheme.secondaryText)
      Text(cashFlow?.income ?? "—")
        .font(.title3)
        .fontWeight(.bold)
        .foregroundStyle(WidgetTheme.incomeGreen)
        .lineLimit(1)
        .minimumScaleFactor(0.85)
      Text("Despesas")
        .font(.caption)
        .foregroundStyle(WidgetTheme.secondaryText)
      Text(cashFlow?.expenses ?? "—")
        .font(.title3)
        .fontWeight(.bold)
        .foregroundStyle(WidgetTheme.overrunRed)
        .lineLimit(1)
        .minimumScaleFactor(0.85)
      Spacer(minLength: 0)
      HStack(alignment: .bottom, spacing: 8) {
        MiniCashFlowChart(bars: cashFlow?.bars ?? [])
          .frame(maxHeight: 34)
        Spacer(minLength: 0)
        WidgetViews.addButton(
          destination: URL(string: WidgetLinks.addTransaction)!,
          diameter: 40
        )
      }
      .frame(height: 40)
    }
    .containerBackground(for: .widget) {
      WidgetTheme.cardBackground
    }
  }
}

@available(iOS 17.0, *)
struct CashFlowMediumView: View {
  var cashFlow: WidgetCashFlow?

  var body: some View {
    VStack(alignment: .leading, spacing: 4) {
      CashFlowHeaderView(monthLabel: cashFlow?.monthLabel ?? "—")
      Rectangle()
        .fill(Color(white: 0.25))
        .frame(height: 1)
      HStack(alignment: .center, spacing: 12) {
        VStack(alignment: .leading, spacing: 2) {
          Spacer(minLength: 0)
          Text("Receitas")
            .font(.caption)
            .foregroundStyle(WidgetTheme.secondaryText)
          Text(cashFlow?.income ?? "—")
            .font(.title2)
            .fontWeight(.bold)
            .foregroundStyle(WidgetTheme.incomeGreen)
            .lineLimit(1)
            .minimumScaleFactor(0.8)
          Text("Despesas")
            .font(.caption)
            .foregroundStyle(WidgetTheme.secondaryText)
            .padding(.top, 4)
          Text(cashFlow?.expenses ?? "—")
            .font(.title2)
            .fontWeight(.bold)
            .foregroundStyle(WidgetTheme.overrunRed)
            .lineLimit(1)
            .minimumScaleFactor(0.8)
          Spacer(minLength: 0)
        }
        ZStack(alignment: .bottomTrailing) {
          DivergingCashFlowChart(bars: cashFlow?.bars ?? [])
            .frame(maxWidth: .infinity, maxHeight: .infinity)
          WidgetViews.addButton(
            destination: URL(string: WidgetLinks.addTransaction)!,
            diameter: 56
          )
        }
      }
    }
    .containerBackground(for: .widget) {
      WidgetTheme.cardBackground
    }
  }
}

@available(iOS 17.0, *)
struct CashFlowWidgetView: View {
  @Environment(\.widgetFamily) private var family
  var entry: SnapshotEntry

  var body: some View {
    if family == .systemSmall {
      CashFlowSmallView(cashFlow: entry.snapshot?.cashFlow)
    } else {
      CashFlowMediumView(cashFlow: entry.snapshot?.cashFlow)
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
