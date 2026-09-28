package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = PastelBluePrimary,
    onPrimary = Color.White,
    primaryContainer = PastelBlueContainer,
    onPrimaryContainer = PastelBluePrimaryDark,
    secondary = PastelBlueSecondary,
    onSecondary = Color.White,
    secondaryContainer = PastelBlueContainerHigh,
    onSecondaryContainer = TextPrimary,
    tertiary = PastelBlueTertiary,
    onTertiary = Color.White,
    background = PastelBlueBackground,
    onBackground = TextPrimary,
    surface = PastelBlueSurface,
    onSurface = TextPrimary,
    surfaceVariant = PastelBlueSurfaceVariant,
    onSurfaceVariant = TextSecondary,
    outline = PastelBlueBorder,
    outlineVariant = PastelBlueBorderSoft
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF90C2EC),
    onPrimary = Color(0xFF0F3254),
    primaryContainer = Color(0xFF1E466E),
    onPrimaryContainer = Color(0xFFD6E8FA),
    secondary = Color(0xFFADC9E6),
    onSecondary = Color(0xFF193754),
    background = Color(0xFF0F1A24),
    onBackground = Color(0xFFE4EDF5),
    surface = Color(0xFF142433),
    onSurface = Color(0xFFE4EDF5),
    surfaceVariant = Color(0xFF1B2F44),
    onSurfaceVariant = Color(0xFF9CB7CE),
    outline = Color(0xFF2E4863),
    outlineVariant = Color(0xFF21384E)
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // enforce pastel blue theme
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}

