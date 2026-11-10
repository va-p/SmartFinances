import SwiftUI
import WidgetKit

@main
@available(iOS 17.0, *)
struct WidgetsBundle: WidgetBundle {
  var body: some Widget {
    BudgetsWidget()
    CashFlowWidget()
    OverviewWidget()
    PatrimonyWidget()
  }
}
