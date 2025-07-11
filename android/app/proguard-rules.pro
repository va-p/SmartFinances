# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:
# Manter classes do React Native e bibliotecas essenciais
-keep class com.facebook.react.** { *; }

# Expo Unimodules / Expo Modules
-keep class expo.modules.** { *; }
-keep public class * extends expo.modules.core.BasePackage { *; }

# React Native Gesture Handler (essencial para navegação e interações)
-keep class com.swmansion.gesturehandler.** { *; }

# Firebase (Regra geral, cobre a maioria dos produtos)
-keep class com.google.firebase.** { *; }
-keepnames class com.google.android.gms.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# OneSignal
-keep class com.onesignal.** { *; }
-keep public class com.google.android.gms.common.api.GoogleApiClient*
-keep public class com.google.android.gms.common.api.Result*
-keep public class com.google.android.gms.auth.api.signin.** {*;}
-keep public class com.google.android.gms.location.** {*;}

# OkHttp (usado por muitas bibliotecas para networking)
-keepattributes Signature
-keepattributes *Annotation*
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-keep class okio.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**
