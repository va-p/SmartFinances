import SwiftUI
import WidgetKit

@available(iOS 17.0, *)
struct WidgetsBundle: WidgetBundle {
  var body: some Widget {
    BudgetsWidget()
    CashFlowWidget()
    OverviewWidget()
    ControlPanelWidget()
    PatrimonyWidget()
  }
}
