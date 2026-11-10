import AppIntents
import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
enum OverviewVariant: String, AppEnum {
  case card
  case plainBar

  static var typeDisplayRepresentation: TypeDisplayRepresentation {
    TypeDisplayRepresentation(name: LocalizedStringResource("Visualização"))
  }

  static var caseDisplayRepresentations: [OverviewVariant: DisplayRepresentation] {
    [
      .card: DisplayRepresentation(title: "Cartão de alerta"),
      .plainBar: DisplayRepresentation(title: "Barra simples"),
    ]
  }
}

@available(iOS 17.0, *)
struct OverviewVariantIntent: WidgetConfigurationIntent {
  static var title: LocalizedStringResource = "Opções de Visualização"

  @Parameter(title: "Visualização", default: .card)
  var variant: OverviewVariant
}

@available(iOS 17.0, *)
struct OverviewAlertCard: View {
  var name: String
  var percent: String

  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text("\(name)")
        .font(.subheadline)
        .foregroundStyle(.white)
        .lineLimit(1)
      HStack {
        Text(percent)
          .font(.caption)
          .foregroundStyle(.white)
        Capsule()
          .stroke(.white, lineWidth: 1)
          .frame(height: 8)
          .overlay(
            GeometryReader { geometry in
              Capsule()
                .fill(.white)
                .frame(width: geometry.size.width)
            }
          )
      }
    }
    .padding(10)
    .background(WidgetTheme.overrunRed)
    .clipShape(RoundedRectangle(cornerRadius: 12))
  }
}

@available(iOS 17.0, *)
struct OverviewAlertPlainBar: View {
  var name: String
  var percent: String
  var over: Bool

  var body: some View {
    VStack(alignment: .leading, spacing: 4) {
      Text("\(name)")
        .font(.subheadline)
        .foregroundStyle(WidgetTheme.primaryText)
        .lineLimit(1)
      GeometryReader { geometry in
        RoundedRectangle(cornerRadius: 4)
          .fill(WidgetTheme.overrunRed)
          .frame(width: geometry.size.width, height: 6)
      }
      .frame(height: 6)
      Text(percent)
        .font(.caption)
        .foregroundStyle(WidgetTheme.secondaryText)
    }
  }
}

@available(iOS 17.0, *)
struct OverviewSmallView: View {
  var snapshot: WidgetSnapshot
  var variant: OverviewVariant

  var body: some View {
    let overview = snapshot.overview
    VStack(alignment: .leading, spacing: 6) {
      WidgetViews.header(
        title: "Overview",
        systemImage: "eye",
        destination: URL(string: WidgetLinks.hideData)!
      )
      Text("Patrimônio Total")
        .font(.caption)
        .foregroundStyle(WidgetTheme.secondaryText)
      Text(overview.total)
        .font(.headline)
        .fontWeight(.bold)
        .foregroundStyle(WidgetTheme.primaryText)
      Spacer(minLength: 0)
      if let name = overview.alertName, let percent = overview.alertPercent {
        if variant == .card {
          OverviewAlertCard(name: name, percent: percent)
        } else {
          OverviewAlertPlainBar(name: name, percent: percent, over: overview.alertOver)
        }
      }
    }
    .containerBackground(for: .widget) {
      WidgetTheme.cardBackground
    }
  }
}

@available(iOS 17.0, *)
struct OverviewEntry: TimelineEntry {
  var date: Date
  var snapshot: WidgetSnapshot?
  var variant: OverviewVariant
}

@available(iOS 17.0, *)
struct OverviewProvider: AppIntentTimelineProvider {
  func placeholder(in context: Context) -> OverviewEntry {
    OverviewEntry(date: Date(), snapshot: nil, variant: .card)
  }

  func snapshot(for configuration: OverviewVariantIntent, in context: Context) async -> OverviewEntry {
    OverviewEntry(date: Date(), snapshot: WidgetStore.loadSnapshot(), variant: configuration.variant)
  }

  func timeline(for configuration: OverviewVariantIntent, in context: Context) async -> Timeline<OverviewEntry> {
    let entry = OverviewEntry(date: Date(), snapshot: WidgetStore.loadSnapshot(), variant: configuration.variant)
    let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date().addingTimeInterval(3600)
    return Timeline(entries: [entry], policy: .after(next))
  }
}

@available(iOS 17.0, *)
struct OverviewGroupView: View {
  @Environment(\.widgetFamily) private var family
  var entry: OverviewEntry

  var body: some View {
    // The Variant A/B intent only affects Small; Medium/Large ignore it.
    switch family {
    case .systemLarge:
      if let snapshot = entry.snapshot {
        ControlPanelLargeView(entry: SnapshotEntry(date: entry.date, snapshot: snapshot))
      }
    case .systemMedium:
      if let snapshot = entry.snapshot {
        ControlPanelMediumView(entry: SnapshotEntry(date: entry.date, snapshot: snapshot))
      }
    default:
      if let snapshot = entry.snapshot {
        OverviewSmallView(snapshot: snapshot, variant: entry.variant)
      }
    }
  }
}

@available(iOS 17.0, *)
struct OverviewWidget: Widget {
  var body: some WidgetConfiguration {
    AppIntentConfiguration(
      kind: "OverviewWidget",
      intent: OverviewVariantIntent.self,
      provider: OverviewProvider()
    ) { entry in
      if let snapshot = entry.snapshot, snapshot.signedIn {
        OverviewGroupView(entry: entry)
      } else {
        LockedWidgetView()
      }
    }
    .configurationDisplayName("Overview")
    .description("Patrimônio, orçamento crítico e atalhos em três tamanhos.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}
