package com.example.ui.theme

import androidx.compose.ui.graphics.Color

// ==========================================
// Spatial UI - Ethereal Blue Gradient Palette
// ==========================================
val SpatialEtherealBgTop = Color(0xFFE8F2FC)        // Soft ethereal sky blue
val SpatialEtherealBgBottom = Color(0xFFF6FAFF)     // Luminous crystalline ice blue
val SpatialGlowLight = Color(0x3360A5FA)            // Subtle specular cyan/blue glow
val SpatialGlowSapphire = Color(0x241D4ED8)         // Subtle ambient sapphire glow

// ==========================================
// Glassmorphism - Medium Glass Surfaces
// ==========================================
val SpatialGlassSurface = Color(0xDFFFFFFF)         // ~88% opacity white frosted glass
val SpatialGlassSurfaceVariant = Color(0xC8EFF6FF)  // Translucent ice-blue glass
val SpatialGlassSurfaceRaised = Color(0xF2FFFFFF)   // 95% opacity for floating sheets & dialogs
val SpatialGlassSurfaceSubtle = Color(0x99F0F7FF)   // 60% translucent soft layer

// ==========================================
// Borders - Sapphire High Contrast
// ==========================================
val SpatialSapphireBorder = Color(0x991D4ED8)       // High-contrast sapphire border (60% alpha)
val SpatialSapphireBorderStrong = Color(0xFF1D4ED8) // Solid sapphire border for active elements
val SpatialSapphireBorderSoft = Color(0x4D3B82F6)   // Subtle glass perimeter highlight

// ==========================================
// Accents - Vibrant Space Cobalt
// ==========================================
val SpatialCobaltPrimary = Color(0xFF1D4ED8)        // Vibrant royal cobalt
val SpatialCobaltSecondary = Color(0xFF2563EB)      // Electric celestial cobalt
val SpatialCobaltLight = Color(0xFF3B82F6)          // Bright sky cobalt
val SpatialCobaltContainer = Color(0xFFDBEAFE)      // Luminous cobalt tinted container
val SpatialCobaltContainerHigh = Color(0xFFBFDBFE)  // High-tint cobalt container

// ==========================================
// Text Colors - Maximum Readability & Contrast
// ==========================================
val TextPrimary = Color(0xFF0F172A)                 // Slate 900 / Deep night blue
val TextSecondary = Color(0xFF334155)               // Slate 700 / High readability secondary
val TextMuted = Color(0xFF64748B)                   // Slate 500 / Secondary details

// ==========================================
// Compatible Bindings (Mapped to Spatial Blue)
// ==========================================
val PastelBlueBackground = SpatialEtherealBgTop
val PastelBlueSurface = SpatialGlassSurface
val PastelBlueSurfaceVariant = SpatialGlassSurfaceVariant
val PastelBlueContainer = SpatialCobaltContainer
val PastelBlueContainerHigh = SpatialCobaltContainerHigh

val PastelBluePrimary = SpatialCobaltPrimary
val PastelBluePrimaryDark = Color(0xFF1E3A8A)       // Deep sapphire navy
val PastelBlueSecondary = SpatialCobaltSecondary
val PastelBlueTertiary = Color(0xFF0284C7)

val PastelBlueBorder = SpatialSapphireBorder
val PastelBlueBorderSoft = SpatialSapphireBorderSoft
val PastelBlueShadow = Color(0x261D4ED8)

// ==========================================
// Semantic Accents (High Contrast Glass)
// ==========================================
val SoftGreen = Color(0xFF059669)                   // Emerald green for yields
val SoftGreenBg = Color(0xDCEDFDF5)                 // Translucent emerald glass
val SoftGreenBorder = Color(0x8010B981)             // High contrast emerald border

val SoftAmber = Color(0xFFD97706)
val SoftAmberBg = Color(0xDCFFFBEB)
val SoftAmberBorder = Color(0x80F59E0B)

val SoftPurple = Color(0xFF7C3AED)
val SoftPurpleBg = Color(0xDCF5F3FF)
val SoftPurpleBorder = Color(0x808B5CF6)

val SoftRed = Color(0xFFDC2626)
val SoftRedBg = Color(0xDCFEF2F2)
val SoftRedBorder = Color(0x80EF4444)
