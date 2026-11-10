import Foundation

// Mirrors `src/widgets/widgetSnapshotTypes.ts`. Native widgets only render
// these pre-formatted strings; all money math stays in TypeScript.
struct WidgetBudgetRow: Decodable {
  var id: String
  var name: String
  var percent: Double
  var percentLabel: String
  var statusText: String
  var over: Bool
}

struct WidgetCashFlow: Decodable {
  var monthLabel: String
  var income: String
  var expenses: String
  var bars: [WidgetCashFlowBar]
}

struct WidgetCashFlowBar: Decodable {
  var income: Double
  var expense: Double
}

struct WidgetOverview: Decodable {
  var total: String
  var alertName: String?
  var alertPercent: String?
  var alertOver: Bool
  var criticalName: String?
  var criticalPercent: String?
}

struct WidgetDonutSlice: Decodable {
  var categoryId: String
  var value: Double
  var label: String
}

struct WidgetNetWorth: Decodable {
  var total: String
  var spark: [Double]
  var donut: [WidgetDonutSlice]
}

struct WidgetInstitutionRow: Decodable {
  var id: String
  var name: String
  var accountCount: Int
  var balance: String
}

struct WidgetSnapshot: Decodable {
  var version: Int
  var generatedAt: String
  var signedIn: Bool
  var hidden: Bool
  var baseCurrencyCode: String
  var budgets: [WidgetBudgetRow]
  var cashFlow: WidgetCashFlow
  var overview: WidgetOverview
  var netWorth: WidgetNetWorth
  var institutions: [WidgetInstitutionRow]
}

enum WidgetStore {
  static let appGroupID = "group.com.vap.smartfinances.widgets"
  static let snapshotKey = "widgetSnapshot"

  static func loadSnapshot() -> WidgetSnapshot? {
    guard
      let data = UserDefaults(suiteName: appGroupID)?.string(forKey: snapshotKey)?.data(using: .utf8)
    else {
      return nil
    }
    return try? JSONDecoder().decode(WidgetSnapshot.self, from: data)
  }
}
