package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentWidth
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Article
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInParent
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.PastelBlueBackground
import com.example.ui.theme.PastelBlueBorder
import com.example.ui.theme.PastelBlueContainer
import com.example.ui.theme.PastelBluePrimary
import com.example.ui.theme.PastelBluePrimaryDark
import com.example.ui.theme.PastelBlueSecondary
import com.example.ui.theme.SpatialCobaltPrimary
import com.example.ui.theme.SpatialSapphireBorderStrong
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import kotlinx.coroutines.launch
import kotlin.math.abs
import kotlin.math.roundToInt

data class DockDestination(
    val id: Int,
    val title: String,
    val icon: ImageVector,
    val badge: Int? = null
)

/**
 * High-fidelity Magnetic Dock for navigation:
 * Features fluid magnification physics on touch/drag, magnetic spring-snapping,
 * active indicator pill, and Soft UI pastel styling.
 */
@Composable
fun MagneticDock(
    selectedTab: Int,
    onTabSelected: (Int) -> Unit,
    activeCount: Int,
    modifier: Modifier = Modifier
) {
    val destinations = remember(activeCount) {
        listOf(
            DockDestination(0, "Carteira", Icons.Default.AccountBalanceWallet, activeCount),
            DockDestination(1, "Balanceamento", Icons.Default.PieChart, null),
            DockDestination(2, "Relatório", Icons.Default.Article, null)
        )
    }

    // Positions of each item center in the dock (relative to dock coordinate space)
    val itemCenters = remember { mutableStateMapOf<Int, Float>() }
    var touchX by remember { mutableStateOf<Float?>(null) }
    var isDragging by remember { mutableStateOf(false) }

    // Floating magnetic pill container
    Surface(
        modifier = modifier
            .wrapContentWidth()
            .testTag("magnetic_dock")
            .shadow(
                elevation = 16.dp,
                shape = RoundedCornerShape(36.dp),
                ambientColor = Color(0x281D4ED8),
                spotColor = Color(0x381D4ED8)
            )
            .border(
                width = 1.5.dp,
                brush = Brush.verticalGradient(
                    listOf(
                        Color.White,
                        SpatialSapphireBorderStrong.copy(alpha = 0.85f),
                        SpatialCobaltPrimary
                    )
                ),
                shape = RoundedCornerShape(36.dp)
            )
            .pointerInput(Unit) {
                detectTapGestures(
                    onPress = { offset ->
                        touchX = offset.x
                        tryAwaitRelease()
                        touchX = null
                        isDragging = false
                    },
                    onTap = { offset ->
                        // Select nearest destination on tap
                        var nearestId = selectedTab
                        var minDistance = Float.MAX_VALUE
                        itemCenters.forEach { (id, centerX) ->
                            val dist = abs(offset.x - centerX)
                            if (dist < minDistance) {
                                minDistance = dist
                                nearestId = id
                            }
                        }
                        onTabSelected(nearestId)
                    }
                )
            }
            .pointerInput(Unit) {
                detectDragGestures(
                    onDragStart = { offset ->
                        isDragging = true
                        touchX = offset.x
                    },
                    onDrag = { change, _ ->
                        change.consume()
                        touchX = change.position.x
                    },
                    onDragEnd = {
                        // Magnetic snap to nearest item on release
                        touchX?.let { currentTouchX ->
                            var nearestId = selectedTab
                            var minDistance = Float.MAX_VALUE
                            itemCenters.forEach { (id, centerX) ->
                                val dist = abs(currentTouchX - centerX)
                                if (dist < minDistance) {
                                    minDistance = dist
                                    nearestId = id
                                }
                            }
                            onTabSelected(nearestId)
                        }
                        touchX = null
                        isDragging = false
                    },
                    onDragCancel = {
                        touchX = null
                        isDragging = false
                    }
                )
            },
        shape = RoundedCornerShape(36.dp),
        color = Color.White.copy(alpha = 0.96f)
    ) {
        Row(
            modifier = Modifier
                .padding(horizontal = 8.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            destinations.forEach { dest ->
                val isSelected = selectedTab == dest.id

                // Magnetic scale calculation:
                // When dragging/hovering: Gaussian/parabolic magnification wave based on proximity to touchX.
                // When idle: active tab slightly larger (1.08f) with spring bounce.
                val itemCenterX = itemCenters[dest.id]
                val magneticTargetScale = if (touchX != null && itemCenterX != null) {
                    val distance = abs(touchX!! - itemCenterX)
                    val maxInfluenceRadius = 220f // pixels
                    val proximity = (1f - (distance / maxInfluenceRadius)).coerceIn(0f, 1f)
                    1.0f + (proximity * 0.28f) // magnifies up to 1.28x
                } else if (isSelected) {
                    1.08f
                } else {
                    1.0f
                }

                val animatedScale by animateFloatAsState(
                    targetValue = magneticTargetScale,
                    animationSpec = spring(
                        dampingRatio = Spring.DampingRatioMediumBouncy,
                        stiffness = Spring.StiffnessMediumLow
                    ),
                    label = "magnetic_scale_${dest.id}"
                )

                // Individual dock item
                MagneticDockItem(
                    destination = dest,
                    isSelected = isSelected,
                    scale = animatedScale,
                    onClick = { onTabSelected(dest.id) },
                    onPositioned = { centerX ->
                        itemCenters[dest.id] = centerX
                    }
                )
            }
        }
    }
}

@Composable
private fun MagneticDockItem(
    destination: DockDestination,
    isSelected: Boolean,
    scale: Float,
    onClick: () -> Unit,
    onPositioned: (Float) -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }

    Box(
        modifier = Modifier
            .onGloballyPositioned { coordinates ->
                val position = coordinates.positionInParent()
                val centerX = position.x + (coordinates.size.width / 2f)
                onPositioned(centerX)
            }
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
                translationY = if (scale > 1.0f) -(scale - 1.0f) * 16f else 0f
            }
            .clip(RoundedCornerShape(24.dp))
            .background(
                if (isSelected) {
                    Brush.horizontalGradient(
                        listOf(
                            PastelBluePrimary,
                            PastelBlueSecondary
                        )
                    )
                } else {
                    Brush.horizontalGradient(
                        listOf(
                            Color.Transparent,
                            Color.Transparent
                        )
                    )
                }
            )
            .border(
                width = if (isSelected) 1.dp else 0.dp,
                color = if (isSelected) PastelBluePrimary.copy(alpha = 0.5f) else Color.Transparent,
                shape = RoundedCornerShape(24.dp)
            )
            .padding(horizontal = 14.dp, vertical = 8.dp)
            .testTag("dock_item_${destination.id}"),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(contentAlignment = Alignment.Center) {
                // Icon with badge
                Icon(
                    imageVector = destination.icon,
                    contentDescription = destination.title,
                    tint = if (isSelected) Color.White else TextSecondary,
                    modifier = Modifier.size(22.dp)
                )

                // Asset counter badge
                if (destination.badge != null) {
                    Box(
                        modifier = Modifier
                            .offset(x = 12.dp, y = (-8).dp)
                            .clip(CircleShape)
                            .background(
                                if (isSelected) Color.White else PastelBluePrimary
                            )
                            .padding(horizontal = 5.dp, vertical = 1.dp)
                    ) {
                        Text(
                            text = destination.badge.toString(),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected) PastelBluePrimaryDark else Color.White
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(2.dp))

            // Text Label
            Text(
                text = destination.title,
                fontSize = 11.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = if (isSelected) Color.White else TextSecondary,
                maxLines = 1
            )

            Spacer(modifier = Modifier.height(2.dp))

            // Magnetic active dot indicator
            Box(
                modifier = Modifier
                    .size(width = 12.dp, height = 3.dp)
                    .clip(CircleShape)
                    .background(
                        if (isSelected) Color.White.copy(alpha = 0.9f) else Color.Transparent
                    )
            )
        }
    }
}
