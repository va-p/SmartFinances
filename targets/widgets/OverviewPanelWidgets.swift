import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct SparklineView: View {
  var points: [Double]

  private var normalized: [CGPoint] {
    guard points.count > 1 else { return [] }
    let minValue = points.min() ?? 0
    let maxValue = points.max() ?? 1
    let span = max(maxValue - minValue, 0.0001)
    return points.enumerated().map { index, value in
      CGPoint(
        x: CGFloat(index) / CGFloat(points.count - 1),
        y: 1 - CGFloat((value - minValue) / span)
      )
    }
  }

  var body: some View {
    GeometryReader { geometry in
      let dots = normalized
      if dots.count > 1 {
        Path { path in
          path.move(to: CGPoint(x: dots[0].x * geometry.size.width, y: dots[0].y * geometry.size.height))
          dots.dropFirst().forEach { dot in
            path.addLine(to: CGPoint(x: dot.x * geometry.size.width, y: dot.y * geometry.size.height))
          }
        }
        .stroke(WidgetTheme.accentOrange, lineWidth: 2)
      }
    }
  }
}

@available(iOS 17.0, *)
struct DonutChartView: View {
  var slices: [WidgetDonutSlice]

  private var total: Double {
    max(slices.reduce(0) { $0 + $1.value }, 0.0001)
  }

  private func range(upTo index: Int) -> (Double, Double) {
    let before = slices.prefix(index).reduce(0) { $0 + $1.value } / total
    let current = slices[index].value / total
    return (before, before + current)
  }

  var body: some View {
    ZStack {
      ForEach(Array(slices.enumerated()), id: \.offset) { index, _ in
        let (start, end) = range(upTo: index)
        Circle()
          .trim(from: start, to: min(end, 1.0))
          .stroke(WidgetTheme.donutPalette[index % WidgetTheme.donutPalette.count], lineWidth: 14)
          .rotationEffect(.degrees(-90))
      }
    }
  }
}

@available(iOS 17.0, *)
struct CriticalBudgetCard: View {
  var name: String
  var percent: String

  var body: some View {
    VStack(alignment: .leading, spacing: 4) {
      Text("Orçamento Crítico:")
        .font(.caption)
        .foregroundStyle(WidgetTheme.secondaryText)
      Text(name)
        .font(.subheadline)
        .foregroundStyle(WidgetTheme.primaryText)
        .lineLimit(2)
      GeometryReader { geometry in
        RoundedRectangle(cornerRadius: 4)
          .fill(WidgetTheme.overrunRed)
          .frame(width: geometry.size.width, height: 6)
      }
      .frame(height: 6)
      Text("\(percent) utilizado")
        .font(.caption)
        .foregroundStyle(WidgetTheme.secondaryText)
    }
    .padding(10)
    .background(WidgetTheme.innerCardBackground)
    .clipShape(RoundedRectangle(cornerRadius: 12))
  }
}


@available(iOS 17.0, *)
struct ControlPanelMediumView: View {
  var entry: SnapshotEntry

  var body: some View {
    let overview = entry.snapshot?.overview
    VStack(spacing: 8) {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: 2) {
          Text("Overview")
            .font(.headline)
            .foregroundStyle(WidgetTheme.primaryText)
          Text("Patrimônio Total")
            .font(.caption)
            .foregroundStyle(WidgetTheme.secondaryText)
          Text(overview?.total ?? "—")
            .font(.headline)
            .fontWeight(.bold)
            .foregroundStyle(WidgetTheme.primaryText)
        }
        Spacer()
        if let name = overview?.criticalName, let percent = overview?.criticalPercent {
          CriticalBudgetCard(name: name, percent: percent)
            .frame(maxWidth: 170)
        }
      }
      Spacer(minLength: 0)
      HStack {
        WidgetViews.addButton(destination: URL(string: WidgetLinks.addTransaction)!)
        Spacer()
        WidgetViews.reportsButton(destination: URL(string: WidgetLinks.overview)!)
      }
    }
    .containerBackground(for: .widget) {
      WidgetTheme.cardBackground
    }
  }
}

@available(iOS 17.0, *)
struct ControlPanelLargeView: View {
  var entry: SnapshotEntry

  var body: some View {
    let overview = entry.snapshot?.overview
    let netWorth = entry.snapshot?.netWorth
    VStack(alignment: .leading, spacing: 10) {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: 2) {
          Text("Overview")
            .font(.headline)
            .foregroundStyle(WidgetTheme.primaryText)
          Text("Patrimônio Total")
            .font(.caption)
            .foregroundStyle(WidgetTheme.secondaryText)
          Text(overview?.total ?? "—")
            .font(.title3)
            .fontWeight(.bold)
            .foregroundStyle(WidgetTheme.primaryText)
        }
        Spacer()
        SparklineView(points: netWorth?.spark ?? [])
          .frame(width: 120, height: 56)
      }
      HStack(spacing: 12) {
        VStack(spacing: 8) {
          let topTwo = Array((overview?.topCritical ?? []).prefix(2))
          if topTwo.isEmpty, let name = overview?.criticalName, let percent = overview?.criticalPercent {
            CriticalBudgetCard(name: name, percent: percent)
          } else {
            ForEach(topTwo, id: \.name) { budget in
              CriticalBudgetCard(name: budget.name, percent: budget.percent)
            }
          }
          Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity)
        DonutChartView(slices: netWorth?.donut ?? [])
          .frame(width: 110, height: 110)
      }
      Spacer(minLength: 0)
      HStack {
        Link(destination: URL(string: WidgetLinks.addTransaction)!) {
          HStack(spacing: 6) {
            Image(systemName: "plus.circle.fill")
              .foregroundStyle(WidgetTheme.accentOrange)
            Text("Adicionar Transação")
              .font(.subheadline)
              .foregroundStyle(WidgetTheme.primaryText)
          }
        }
        Spacer()
        WidgetViews.reportsButton(destination: URL(string: WidgetLinks.overview)!)
      }
    }
    .containerBackground(for: .widget) {
      WidgetTheme.cardBackground
    }
  }
}


