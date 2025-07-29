# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# WebView JavaScript interface
-keepclassmembers class com.youminki.testhybrid.MainActivity {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep essential Android components
-keep class androidx.** { *; }
-keep class com.google.android.material.** { *; }

# Keep WebView related classes
-keep class android.webkit.** { *; }

# Keep JSON classes
-keep class org.json.** { *; }

# Keep SharedPreferences
-keep class android.content.SharedPreferences { *; }

# Optimize APK size
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
}

# Keep line numbers for crash reporting
-keepattributes SourceFile,LineNumberTable