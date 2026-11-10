import SwiftUI

// Dark-card palette matching the layout mocks.
enum WidgetTheme {
  static let cardBackground = Color(red: 0.13, green: 0.13, blue: 0.15)
  static let innerCardBackground = Color(red: 0.18, green: 0.18, blue: 0.20)
  static let primaryText = Color.white
  static let secondaryText = Color(white: 0.65)
  static let incomeGreen = Color(red: 0.18, green: 0.80, blue: 0.44)
  static let overrunRed = Color(red: 1.0, green: 0.42, blue: 0.42)
  static let accentOrange = Color(red: 0.96, green: 0.65, blue: 0.15)
  static let donutPalette: [Color] = [
    Color(red: 0.20, green: 0.40, blue: 1.0),
    incomeGreen,
    overrunRed,
    accentOrange,
    Color(red: 0.60, green: 0.40, blue: 1.0),
    Color(red: 0.20, green: 0.75, blue: 0.85),
  ]
}

enum WidgetLinks {
  static let scheme = "com.vap.smartfinances"
  static let budgets = "\(scheme)://budgets"
  static let addTransaction = "\(scheme)://?addTransaction=true"
  static let overview = "\(scheme)://overview"
  static let accounts = "\(scheme)://accounts"

  static func budgetDetail(id: String) -> URL {
    URL(string: "\(scheme)://budgets/\(id)") ?? URL(string: budgets)!
  }
}

// Small helpers shared by every widget view.
enum WidgetViews {
  static func header(title: String, systemImage: String, destination: URL) -> some View {
    HStack {
      Text(title)
        .font(.headline)
        .foregroundStyle(WidgetTheme.primaryText)
      Spacer()
      Link(destination: destination) {
        Image(systemName: systemImage)
          .foregroundStyle(WidgetTheme.accentOrange)
      }
    }
  }

  static func addButton(destination: URL, diameter: CGFloat = 44) -> some View {
    Link(destination: destination) {
      ZStack {
        Circle()
          .fill(WidgetTheme.accentOrange)
          .frame(width: diameter, height: diameter)
        Image(systemName: "plus")
          .foregroundStyle(.black)
          .fontWeight(.bold)
      }
    }
  }

  static func reportsButton(destination: URL) -> some View {
    Link(destination: destination) {
      HStack(spacing: 6) {
        Image(systemName: "chart.pie.fill")
          .foregroundStyle(WidgetTheme.accentOrange)
        Text("Resumo")
          .font(.subheadline)
          .foregroundStyle(WidgetTheme.primaryText)
      }
    }
  }
}
