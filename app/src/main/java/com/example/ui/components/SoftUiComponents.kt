package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.PastelBluePrimaryDark
import com.example.ui.theme.SoftGreen
import com.example.ui.theme.SoftGreenBg
import com.example.ui.theme.SoftGreenBorder
import com.example.ui.theme.SpatialCobaltContainer
import com.example.ui.theme.SpatialCobaltPrimary
import com.example.ui.theme.SpatialCobaltSecondary
import com.example.ui.theme.SpatialEtherealBgBottom
import com.example.ui.theme.SpatialEtherealBgTop
import com.example.ui.theme.SpatialGlassSurface
import com.example.ui.theme.SpatialGlassSurfaceSubtle
import com.example.ui.theme.SpatialGlowLight
import com.example.ui.theme.SpatialGlowSapphire
import com.example.ui.theme.SpatialSapphireBorder
import com.example.ui.theme.SpatialSapphireBorderSoft
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import java.text.NumberFormat
import java.util.Locale

// Currency and Percentage formatters in pt-BR
fun formatCurrency(amount: Double): String {
    val format = NumberFormat.getCurrencyInstance(Locale("pt", "BR"))
    return format.format(amount)
}

fun formatPercent(percent: Double): String {
    return String.format(Locale("pt", "BR"), "%.2f%%", percent)
}

fun formatNumber(number: Int): String {
    return NumberFormat.getIntegerInstance(Locale("pt", "BR")).format(number)
}

/**
 * Modifier that applies the ethereal spatial background:
 * A subtle celestial sky-blue gradient with specular radial glows in the upper corners.
 */
fun Modifier.spatialEtherealBackground(): Modifier = this.drawBehind {
    // 1. Base vertical ethereal gradient
    val verticalBrush = Brush.verticalGradient(
        colors = listOf(SpatialEtherealBgTop, SpatialEtherealBgBottom),
        startY = 0f,
        endY = size.height
    )
    drawRect(brush = verticalBrush)

    // 2. Subtle top-left cyan specular glow
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(SpatialGlowLight, Color.Transparent),
            center = Offset(size.width * 0.15f, size.height * 0.08f),
            radius = size.width * 0.55f
        ),
        radius = size.width * 0.55f,
        center = Offset(size.width * 0.15f, size.height * 0.08f)
    )

    // 3. Subtle top-right sapphire ambient orb
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(SpatialGlowSapphire, Color.Transparent),
            center = Offset(size.width * 0.88f, size.height * 0.15f),
            radius = size.width * 0.45f
        ),
        radius = size.width * 0.45f,
        center = Offset(size.width * 0.88f, size.height * 0.15f)
    )
}

/**
 * Premium Spatial UI Glassmorphic Card:
 * Features a medium-opacity translucent glass surface, rounded organic corners,
 * high-contrast sapphire borders, and soft ambient depth.
 */
@Composable
fun SpatialGlassCard(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 20.dp,
    backgroundColor: Color = SpatialGlassSurface,
    borderColor: Color = SpatialSapphireBorder,
    borderWidth: Dp = 1.2.dp,
    elevation: Dp = 4.dp,
    content: @Composable ColumnScope.() -> Unit
) {
    Surface(
        modifier = modifier
            .shadow(
                elevation = elevation,
                shape = RoundedCornerShape(cornerRadius),
                ambientColor = Color(0x1F1D4ED8),
                spotColor = Color(0x281D4ED8)
            )
            .border(
                border = BorderStroke(borderWidth, borderColor),
                shape = RoundedCornerShape(cornerRadius)
            ),
        shape = RoundedCornerShape(cornerRadius),
        color = backgroundColor
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            content = content
        )
    }
}

// Backward-compatible alias for SoftUiCard with Spatial UI default values
@Composable
fun SoftUiCard(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 20.dp,
    backgroundColor: Color = SpatialGlassSurface,
    borderColor: Color = SpatialSapphireBorder,
    elevation: Dp = 4.dp,
    content: @Composable ColumnScope.() -> Unit
) {
    SpatialGlassCard(
        modifier = modifier,
        cornerRadius = cornerRadius,
        backgroundColor = backgroundColor,
        borderColor = borderColor,
        borderWidth = 1.2.dp,
        elevation = elevation,
        content = content
    )
}

@Composable
fun SoftUiPillTab(
    text: String,
    isSelected: Boolean,
    icon: ImageVector? = null,
    badgeCount: Int? = null,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val shape = RoundedCornerShape(16.dp)

    Box(
        modifier = Modifier
            .clip(shape)
            .clickable(
                interactionSource = interactionSource,
                indication = ripple(color = SpatialCobaltPrimary),
                onClick = onClick
            )
            .background(
                if (isSelected) {
                    Brush.horizontalGradient(
                        listOf(SpatialCobaltPrimary, SpatialCobaltSecondary)
                    )
                } else {
                    Brush.horizontalGradient(
                        listOf(SpatialGlassSurface, SpatialGlassSurface)
                    )
                }
            )
            .border(
                width = 1.dp,
                color = if (isSelected) SpatialCobaltSecondary else SpatialSapphireBorderSoft,
                shape = shape
            )
            .padding(horizontal = 14.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (icon != null) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = if (isSelected) Color.White else TextSecondary,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
            }
            Text(
                text = text,
                fontSize = 13.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = if (isSelected) Color.White else TextSecondary
            )
            if (badgeCount != null) {
                Spacer(modifier = Modifier.width(6.dp))
                Box(
                    modifier = Modifier
                        .background(
                            color = if (isSelected) Color.White.copy(alpha = 0.25f) else SpatialCobaltContainer,
                            shape = CircleShape
                        )
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                    Text(
                        text = badgeCount.toString(),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isSelected) Color.White else PastelBluePrimaryDark
                    )
                }
            }
        }
    }
}

@Composable
fun SoftUiMetricBadge(
    title: String,
    value: String,
    subtitle: String? = null,
    icon: ImageVector? = null,
    isHighlight: Boolean = false,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .border(
                1.dp,
                if (isHighlight) SoftGreenBorder else SpatialSapphireBorderSoft,
                RoundedCornerShape(16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        color = if (isHighlight) SoftGreenBg else SpatialGlassSurfaceSubtle
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (icon != null) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = if (isHighlight) SoftGreen else TextMuted,
                        modifier = Modifier.size(13.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                }
                Text(
                    text = title.uppercase(),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = if (isHighlight) SoftGreen else TextMuted,
                    letterSpacing = 0.5.sp
                )
            }
            Spacer(modifier = Modifier.height(3.dp))
            Text(
                text = value,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = if (isHighlight) SoftGreen else TextPrimary
            )
            if (subtitle != null) {
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = subtitle,
                    fontSize = 11.sp,
                    color = TextSecondary
                )
            }
        }
    }
}

@Composable
fun CategoryChip(
    category: String,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor, borderColor) = when {
        category.contains("CRA", ignoreCase = true) || category.contains("Fiagro", ignoreCase = true) ->
            Triple(Color(0xE6E8F5E9), Color(0xFF1B5E20), Color(0x664CAF50))
        category.contains("CRI", ignoreCase = true) || category.contains("Papel", ignoreCase = true) ->
            Triple(Color(0xE6E3F2FD), Color(0xFF0D47A1), Color(0x662196F3))
        category.contains("Logística", ignoreCase = true) ->
            Triple(Color(0xE6FFF3E0), Color(0xFFBF360C), Color(0x66FF9800))
        category.contains("Terras", ignoreCase = true) ->
            Triple(Color(0xE6FBE9E7), Color(0xFF870000), Color(0x66FF5722))
        category.contains("Shopping", ignoreCase = true) ->
            Triple(Color(0xE6F3E5F5), Color(0xFF4A148C), Color(0x669C27B0))
        category.contains("ETF Mundial", ignoreCase = true) ->
            Triple(Color(0xE6EDE7F6), Color(0xFF311B92), Color(0x66673AB7))
        category.contains("Energia", ignoreCase = true) ->
            Triple(Color(0xE6FFFDE7), Color(0xFFE65100), Color(0x66FFEB3B))
        else ->
            Triple(Color(0xE6ECEFF1), Color(0xFF263238), Color(0x6690A4AE))
    }

    Box(
        modifier = modifier
            .background(bgColor, RoundedCornerShape(8.dp))
            .border(0.8.dp, borderColor, RoundedCornerShape(8.dp))
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Text(
            text = category,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = textColor
        )
    }
}
