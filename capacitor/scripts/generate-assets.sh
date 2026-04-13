#!/usr/bin/env bash
#
# Generate all app icons, adaptive icons, and splash screens for
# both Android and iOS from a single source SVG.
#
# Requirements: ImageMagick (convert/magick) — install via: brew install imagemagick
#
# Usage:
#   cd capacitor
#   ./scripts/generate-assets.sh [path/to/icon.svg]
#
# Defaults to ../src/renderer/assets/icons/icon.svg if no argument given.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_SVG="${1:-$PROJECT_DIR/../src/renderer/assets/icons/icon.svg}"

if [ ! -f "$SOURCE_SVG" ]; then
  echo "Error: Source SVG not found at $SOURCE_SVG"
  exit 1
fi

# Check for ImageMagick
if command -v magick &>/dev/null; then
  CONVERT="magick"
elif command -v convert &>/dev/null; then
  CONVERT="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

echo "Using source: $SOURCE_SVG"
echo "Using ImageMagick: $CONVERT"

ANDROID_RES="$PROJECT_DIR/android/app/src/main/res"
IOS_ASSETS="$PROJECT_DIR/ios/App/App/Assets.xcassets"

# Create temp directory
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# ============================================================
# Clean Capacitor default assets that would cause duplicates
# ============================================================
echo ""
echo "=== Cleaning Capacitor default assets ==="

# Remove default vector foreground (conflicts with our PNG foregrounds)
rm -f "$ANDROID_RES/drawable-v24/ic_launcher_foreground.xml"
rmdir "$ANDROID_RES/drawable-v24" 2>/dev/null || true

# Remove default splash screens (Capacitor uses drawable-port-hdpi etc without -v4)
for d in "$ANDROID_RES"/drawable-port-*/ "$ANDROID_RES"/drawable-land-*/; do
  if [ -d "$d" ]; then
    rm -rf "$d"
  fi
done

echo "  Removed default vector foreground and splash duplicates"

# ============================================================
# Generate a high-res master PNG from SVG
# ============================================================
echo ""
echo "=== Generating master PNG from SVG ==="
$CONVERT -background none -density 384 "$SOURCE_SVG" -resize 1024x1024 "$TMPDIR/icon-1024.png"
echo "  Created 1024x1024 master"

# ============================================================
# Helper: generate mipmap icon at given density/size
# ============================================================
generate_mipmap() {
  local density=$1 size=$2
  local dir="$ANDROID_RES/mipmap-$density"
  mkdir -p "$dir"

  # ic_launcher.png
  $CONVERT "$TMPDIR/icon-1024.png" -resize "${size}x${size}" "$dir/ic_launcher.png"

  # ic_launcher_round.png — circular mask
  $CONVERT "$TMPDIR/icon-1024.png" -resize "${size}x${size}" \
    \( +clone -alpha extract \
       -fill black -draw "color 0,0 reset" \
       -fill white -draw "circle $((size/2)),$((size/2)) $((size/2)),0" \
    \) -alpha off -compose CopyOpacity -composite \
    "$dir/ic_launcher_round.png"

  echo "  mipmap-$density: ${size}x${size}"
}

# ============================================================
# Helper: generate adaptive icon foreground
# ============================================================
generate_adaptive_foreground() {
  local density=$1 full=$2
  local icon_size=$(( full * 66 / 100 ))
  local dir="$ANDROID_RES/mipmap-$density"
  mkdir -p "$dir"

  $CONVERT "$TMPDIR/icon-1024.png" -resize "${icon_size}x${icon_size}" \
    -gravity center -background none -extent "${full}x${full}" \
    "$dir/ic_launcher_foreground.png"

  echo "  mipmap-$density foreground: ${full}x${full} (icon ${icon_size})"
}

# ============================================================
# Helper: generate splash screen
# ============================================================
generate_splash() {
  local dir_name=$1 w=$2 h=$3
  local dir="$ANDROID_RES/$dir_name"
  mkdir -p "$dir"

  $CONVERT -size "${w}x${h}" "xc:#F5F5F5" \
    \( "$TMPDIR/icon-1024.png" -resize "192x192" \) \
    -gravity center -composite \
    "$dir/splash.png"

  echo "  $dir_name: ${w}x${h}"
}

# ============================================================
# ANDROID: App Icons
# ============================================================
echo ""
echo "=== Android: App Icons ==="
generate_mipmap mdpi    48
generate_mipmap hdpi    72
generate_mipmap xhdpi   96
generate_mipmap xxhdpi  144
generate_mipmap xxxhdpi 192

# ============================================================
# ANDROID: Adaptive Icon Foreground
# ============================================================
echo ""
echo "=== Android: Adaptive Icon Foreground ==="
generate_adaptive_foreground mdpi    108
generate_adaptive_foreground hdpi    162
generate_adaptive_foreground xhdpi   216
generate_adaptive_foreground xxhdpi  324
generate_adaptive_foreground xxxhdpi 432

# ============================================================
# ANDROID: Splash Screens
# ============================================================
echo ""
echo "=== Android: Splash Screens ==="

# Default
generate_splash drawable                480  800

# Portrait
generate_splash drawable-port-mdpi      320  480
generate_splash drawable-port-hdpi      480  800
generate_splash drawable-port-xhdpi     720  1280
generate_splash drawable-port-xxhdpi    960  1600
generate_splash drawable-port-xxxhdpi   1280 1920

# Landscape
generate_splash drawable-land-mdpi      480  320
generate_splash drawable-land-hdpi      800  480
generate_splash drawable-land-xhdpi     1280 720
generate_splash drawable-land-xxhdpi    1600 960
generate_splash drawable-land-xxxhdpi   1920 1280

# ============================================================
# iOS: App Icon (single 1024x1024 for Xcode 15+)
# ============================================================
echo ""
echo "=== iOS: App Icon ==="

IOS_ICON_DIR="$IOS_ASSETS/AppIcon.appiconset"
mkdir -p "$IOS_ICON_DIR"

$CONVERT "$TMPDIR/icon-1024.png" -resize 1024x1024 "$IOS_ICON_DIR/AppIcon-512@2x.png"
echo "  AppIcon-512@2x.png: 1024x1024"

cat > "$IOS_ICON_DIR/Contents.json" << 'ICONJSON'
{
  "images" : [
    {
      "filename" : "AppIcon-512@2x.png",
      "idiom" : "universal",
      "platform" : "ios",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
ICONJSON

# ============================================================
# iOS: Splash Screen (2732x2732 universal)
# ============================================================
echo ""
echo "=== iOS: Splash Screen ==="

IOS_SPLASH_DIR="$IOS_ASSETS/Splash.imageset"
mkdir -p "$IOS_SPLASH_DIR"

$CONVERT -size "2732x2732" "xc:#F5F5F5" \
  \( "$TMPDIR/icon-1024.png" -resize "384x384" \) \
  -gravity center -composite \
  "$IOS_SPLASH_DIR/splash-2732x2732.png"

cp "$IOS_SPLASH_DIR/splash-2732x2732.png" "$IOS_SPLASH_DIR/splash-2732x2732-1.png"
cp "$IOS_SPLASH_DIR/splash-2732x2732.png" "$IOS_SPLASH_DIR/splash-2732x2732-2.png"

echo "  splash-2732x2732.png (@1x, @2x, @3x)"

cat > "$IOS_SPLASH_DIR/Contents.json" << 'SPLASHJSON'
{
  "images" : [
    {
      "filename" : "splash-2732x2732.png",
      "idiom" : "universal",
      "scale" : "1x"
    },
    {
      "filename" : "splash-2732x2732-1.png",
      "idiom" : "universal",
      "scale" : "2x"
    },
    {
      "filename" : "splash-2732x2732-2.png",
      "idiom" : "universal",
      "scale" : "3x"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
SPLASHJSON

# ============================================================
# Cordova: Update icons too (if directory exists)
# ============================================================
echo ""
echo "=== Cordova: Icons ==="

CORDOVA_ANDROID="$PROJECT_DIR/../cordova/res/icon/android"
CORDOVA_IOS="$PROJECT_DIR/../cordova/res/icon/ios"

if [ -d "$CORDOVA_ANDROID" ]; then
  for density_size in mdpi:48 hdpi:72 xhdpi:96 xxhdpi:144 xxxhdpi:192; do
    density="${density_size%%:*}"
    size="${density_size##*:}"
    mkdir -p "$CORDOVA_ANDROID/mipmap-$density"
    $CONVERT "$TMPDIR/icon-1024.png" -resize "${size}x${size}" "$CORDOVA_ANDROID/mipmap-$density/ic_launcher.png"
  done
  echo "  Updated Cordova Android icons"
else
  echo "  Skipped (cordova/res not found)"
fi

if [ -d "$CORDOVA_IOS" ]; then
  $CONVERT "$TMPDIR/icon-1024.png" -resize 57x57   "$CORDOVA_IOS/icon-57.png"
  $CONVERT "$TMPDIR/icon-1024.png" -resize 114x114  "$CORDOVA_IOS/icon-57-2x.png"
  $CONVERT "$TMPDIR/icon-1024.png" -resize 72x72    "$CORDOVA_IOS/icon-72.png"
  $CONVERT "$TMPDIR/icon-1024.png" -resize 144x144  "$CORDOVA_IOS/icon-72-2x.png"
  echo "  Updated Cordova iOS icons"
else
  echo "  Skipped (cordova/res not found)"
fi

# ============================================================
echo ""
echo "=== Done! ==="
echo ""
echo "Generated from: $SOURCE_SVG"
echo "  Android: mipmap icons (5 densities), adaptive foreground, splash (9 variants)"
echo "  iOS: 1024x1024 app icon, 2732x2732 splash (3 scales)"
echo ""
echo "Next: cd capacitor && npx cap sync"
