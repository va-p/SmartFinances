package com.vap.smartfinances.widgets

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF

// Native chart drawing for widgets. RemoteViews cannot host custom views, so
// charts render to Bitmaps via android.graphics (no new dependencies).
object WidgetCharts {
  private const val GREEN = "#2ECC71"
  private const val RED = "#FF6B6B"
  private const val ORANGE = "#F5A623"
  private const val TRACK = "#3A3A40"

  val DONUT_COLORS = listOf("#3366FF", GREEN, RED, ORANGE, "#9966FF", "#33BFD9")

  // Android Medium cash-flow: horizontal income/expense bars (spec orientation).
  fun drawHorizontalBars(bars: List<WidgetCashFlowBar>, width: Int, rowHeight: Int, gap: Int): Bitmap {
    val rows = bars.take(8)
    val height = maxOf(1, rows.size * (rowHeight * 2 + gap))
    val bitmap = Bitmap.createBitmap(maxOf(1, width), height, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    val maxValue = maxOf(1.0, rows.maxOfOrNull { maxOf(it.income, it.expense) } ?: 1.0)

    rows.forEachIndexed { index, bar ->
      val top = (index * (rowHeight * 2 + gap)).toFloat()
      canvas.drawRect(
        0f, top, (width * bar.income / maxValue).toFloat(), top + rowHeight,
        fillPaint(GREEN)
      )
      canvas.drawRect(
        0f, top + rowHeight, (width * bar.expense / maxValue).toFloat(), top + rowHeight * 2,
        fillPaint(RED)
      )
    }
    return bitmap
  }

  // Compact paired bars for the Small cash-flow widget.
  fun drawMiniBars(bars: List<WidgetCashFlowBar>, width: Int, height: Int): Bitmap {
    val rows = bars.take(8)
    val bitmap = Bitmap.createBitmap(maxOf(1, width), maxOf(1, height), Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    val maxValue = maxOf(1.0, rows.maxOfOrNull { maxOf(it.income, it.expense) } ?: 1.0)
    if (rows.isEmpty()) return bitmap

    val slotWidth = width.toFloat() / rows.size
    val barWidth = maxOf(2f, slotWidth / 3)
    rows.forEachIndexed { index, bar ->
      val centerX = slotWidth * index + slotWidth / 2
      val incomeH = (height * 0.9 * bar.income / maxValue).toFloat()
      val expenseH = (height * 0.9 * bar.expense / maxValue).toFloat()
      canvas.drawRect(centerX - barWidth, height - incomeH, centerX, height.toFloat(), fillPaint(GREEN))
      canvas.drawRect(centerX, height - expenseH, centerX + barWidth, height.toFloat(), fillPaint(RED))
    }
    return bitmap
  }

  fun drawSparkline(points: List<Double>, width: Int, height: Int): Bitmap {
    val bitmap = Bitmap.createBitmap(maxOf(1, width), maxOf(1, height), Bitmap.Config.ARGB_8888)
    if (points.size < 2) return bitmap
    val canvas = Canvas(bitmap)
    val min = points.minOrNull() ?: 0.0
    val span = maxOf((points.maxOrNull() ?: 1.0) - min, 0.0001)
    val paint = Paint().apply {
      color = Color.parseColor(ORANGE)
      strokeWidth = maxOf(2f, width / 120f)
      style = Paint.Style.STROKE
      isAntiAlias = true
    }
    val path = android.graphics.Path()
    points.forEachIndexed { index, value ->
      val x = width * index.toFloat() / (points.size - 1)
      val y = height - (height * (value - min) / span).toFloat()
      if (index == 0) path.moveTo(x, y) else path.lineTo(x, y)
    }
    canvas.drawPath(path, paint)
    return bitmap
  }

  fun drawDonut(slices: List<WidgetDonutSlice>, size: Int): Bitmap {
    val bitmap = Bitmap.createBitmap(maxOf(1, size), maxOf(1, size), Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    val total = maxOf(slices.sumOf { it.value }, 0.0001)
    val stroke = size / 7f
    val oval = RectF(stroke, stroke, size - stroke, size - stroke)
    var startAngle = -90f
    slices.take(DONUT_COLORS.size).forEachIndexed { index, slice ->
      val sweep = (slice.value / total * 360).toFloat()
      val paint = Paint().apply {
        color = Color.parseColor(DONUT_COLORS[index % DONUT_COLORS.size])
        style = Paint.Style.STROKE
        strokeWidth = stroke
        isAntiAlias = true
      }
      canvas.drawArc(oval, startAngle, sweep, false, paint)
      startAngle += sweep
    }
    // Track ring behind thin slivers keeps the donut readable.
    if (slices.isEmpty()) {
      canvas.drawArc(oval, 0f, 360f, false, Paint().apply {
        color = Color.parseColor(TRACK)
        style = Paint.Style.STROKE
        strokeWidth = stroke
      })
    }
    return bitmap
  }

  private fun fillPaint(colorHex: String) = Paint().apply {
    color = Color.parseColor(colorHex)
    style = Paint.Style.FILL
    isAntiAlias = true
  }
}
