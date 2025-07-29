package com.youminki.testhybrid

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.net.http.SslCertificate
import android.net.http.SslError
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.WindowManager
import android.webkit.CookieManager
import android.webkit.PermissionRequest
import android.webkit.SslErrorHandler
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import org.json.JSONObject
import java.security.cert.CertificateExpiredException
import java.security.cert.CertificateNotYetValidException
import java.security.cert.X509Certificate

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var sharedPreferences: SharedPreferences
    private val url = "https://me1pik.com"
    private val permissions = arrayOf(
        Manifest.permission.CAMERA,
        Manifest.permission.READ_EXTERNAL_STORAGE,
        Manifest.permission.WRITE_EXTERNAL_STORAGE
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // iOS 스타일 전체화면 설정
        setupFullscreenMode()

        // SharedPreferences 초기화
        sharedPreferences = getSharedPreferences("MelpikPrefs", Context.MODE_PRIVATE)

        // FrameLayout으로 WebView와 ProgressBar(스플래시) 겹치기
        val frameLayout = FrameLayout(this)
        webView = WebView(this)
        progressBar = ProgressBar(this)
        progressBar.isIndeterminate = true
        
        // 웹뷰에 상단 패딩 추가 (상태바 높이만큼)
        val statusBarHeight = getStatusBarHeight()
        val webViewParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ).apply {
            topMargin = statusBarHeight // 상태바 높이만큼 상단 여백 추가
        }
        
        val progressParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        )
        
        frameLayout.addView(webView, webViewParams)
        frameLayout.addView(progressBar, progressParams)
        setContentView(frameLayout)

        // 네트워크 체크
        if (!isNetworkAvailable(this)) {
            Toast.makeText(this, "네트워크 연결이 필요합니다.", Toast.LENGTH_LONG).show()
            progressBar.visibility = FrameLayout.GONE
            return
        }

        // WebView 설정 강화 (최적화된 터치 및 성능)
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.mediaPlaybackRequiresUserGesture = false
        
        // 성능 최적화 설정
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        
        // 추가 성능 최적화
        settings.databaseEnabled = true
        settings.setGeolocationEnabled(false)
        settings.cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK
        
        // 스크롤 최적화
        webView.isVerticalScrollBarEnabled = false
        webView.isHorizontalScrollBarEnabled = false
        webView.overScrollMode = View.OVER_SCROLL_NEVER
        
        // 터치 반응성 향상
        webView.isFocusable = true
        webView.isFocusableInTouchMode = true
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.safeBrowsingEnabled = true
        }
        CookieManager.getInstance().setAcceptCookie(true)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)
        }

        // WebViewClient 설정 (SSL, 외부 URL, 로딩 표시, 성능 최적화)
        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedSslError(
                view: WebView?,
                handler: SslErrorHandler?,
                error: SslError?
            ) {
                handler?.cancel() // SSL 오류 발생 시 무조건 연결 차단
            }
            
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url.toString()
                return handleExternalUrl(url)
            }
            
            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                progressBar.visibility = FrameLayout.VISIBLE
            }
            
            override fun onPageFinished(view: WebView?, url: String?) {
                progressBar.visibility = FrameLayout.GONE
                // 페이지 로딩 완료 시 로그인 상태 확인 및 전달
                checkLoginStatus()
                
                // 상태바 높이 전달 (웹뷰에 상단 패딩 정보 포함)
                sendStatusBarHeightToWebView()
                
                // 성능 최적화: 불필요한 리소스 정리
                System.gc()
            }
            
            override fun onLoadResource(view: WebView?, url: String?) {
                // 리소스 로딩 중 추가 최적화
            }
            
            override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): android.webkit.WebResourceResponse? {
                // 요청 인터셉트로 성능 최적화
                return super.shouldInterceptRequest(view, request)
            }
        }

        // WebChromeClient (권한 요청 등)
        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
                runOnUiThread {
                    request?.grant(request.resources)
                }
            }
        }

        // 뒤로가기 처리 설정
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (this@MainActivity::webView.isInitialized && webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
        
        // URL 로드
        webView.loadUrl(url)
        
        // 권한 요청
        requestPermissionsIfNeeded()

        // JavaScript 인터페이스 추가 (웹뷰에서 네이티브 앱으로 메시지 전달)
        webView.addJavascriptInterface(object {
            @android.webkit.JavascriptInterface
            fun postMessage(message: String) {
                try {
                    val jsonMessage = JSONObject(message)
                    when (jsonMessage.optString("type")) {
                        "saveLoginInfo" -> {
                            val loginData = jsonMessage.optJSONObject("detail")
                            if (loginData != null) {
                                saveLoginInfo(loginData)
                            }
                        }
                        "clearLoginInfo" -> {
                            clearLoginInfo()
                        }
                        "REQUEST_STATUS_BAR_HEIGHT" -> {
                            handleStatusBarHeightRequest()
                        }
                        "GET_STATUS_BAR_HEIGHT" -> {
                            handleStatusBarHeightRequest()
                        }
                    }
                } catch (e: Exception) {
                    println("메시지 처리 실패: $e")
                }
            }
        }, "Android")

        // 권한 요청
        requestPermissionsIfNeeded()

        // 웹사이트 로드
        webView.loadUrl(url)
        
        // 웹뷰 로드 후 상태바 높이 즉시 전달
        Handler(Looper.getMainLooper()).postDelayed({
            sendStatusBarHeightToWebView()
        }, 500) // 웹뷰가 완전히 로드된 후 전달
    }

    // 로그인 정보 저장 (AsyncStorage 대신 SharedPreferences 사용)
    private fun saveLoginInfo(loginData: JSONObject) {
        try {
            val editor = sharedPreferences.edit()
            editor.putString("accessToken", loginData.optString("token"))
            editor.putString("refreshToken", loginData.optString("refreshToken"))
            editor.putString("userEmail", loginData.optString("email"))
            editor.apply()

            // 웹뷰에 로그인 정보 전달
            sendLoginInfoToWebView(true, loginData)
        } catch (error: Exception) {
            println("로그인 정보 저장 실패: $error")
        }
    }

    // 앱 시작 시 토큰 확인
    private fun checkLoginStatus() {
        try {
            val token = sharedPreferences.getString("accessToken", null)
            if (token != null) {
                val loginData = JSONObject().apply {
                    put("token", token)
                    put("refreshToken", sharedPreferences.getString("refreshToken", ""))
                    put("email", sharedPreferences.getString("userEmail", ""))
                }
                
                // 웹뷰에 로그인 상태 전달
                sendLoginInfoToWebView(true, loginData)
            }
        } catch (error: Exception) {
            println("로그인 상태 확인 실패: $error")
        }
    }

    // 웹뷰에 로그인 정보 전달
    private fun sendLoginInfoToWebView(isLoggedIn: Boolean, userInfo: JSONObject) {
        val message = JSONObject().apply {
            put("type", "loginInfoReceived")
            put("detail", JSONObject().apply {
                put("isLoggedIn", isLoggedIn)
                put("userInfo", userInfo)
            })
        }

        runOnUiThread {
            webView.evaluateJavascript(
                "window.postMessage(${message}, '*');",
                null
            )
        }
    }

    // 로그인 정보 삭제 (로그아웃 시)
    private fun clearLoginInfo() {
        val editor = sharedPreferences.edit()
        editor.remove("accessToken")
        editor.remove("refreshToken")
        editor.remove("userEmail")
        editor.apply()

        // 웹뷰에 로그아웃 상태 전달
        sendLoginInfoToWebView(false, JSONObject())
    }

    // 외부 URL 처리 (전화, 이메일, 외부 링크 등)
    private fun handleExternalUrl(url: String): Boolean {
        return if (url.startsWith("http://") || url.startsWith("https://")) {
            false // WebView에서 처리
        } else {
            try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                startActivity(intent)
            } catch (e: Exception) {
                Toast.makeText(this, "외부 앱을 실행할 수 없습니다.", Toast.LENGTH_SHORT).show()
            }
            true
        }
    }



    // 네트워크 연결 체크
    @Suppress("DEPRECATION")
    private fun isNetworkAvailable(context: Context): Boolean {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connectivityManager.activeNetwork ?: return false
            val activeNetwork = connectivityManager.getNetworkCapabilities(network) ?: return false
            return activeNetwork.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
                   activeNetwork.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
        } else {
            val networkInfo = connectivityManager.activeNetworkInfo
            return networkInfo?.isConnected == true
        }
    }

    // 상태바 영역만큼 웹뷰 띄우기 설정
    private fun setupFullscreenMode() {
        // 상태바 색상을 정확한 흰색으로 설정 (#FFFFFF)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor = resources.getColor(com.youminki.testhybrid.R.color.status_bar_white, theme)
        }
        
        // 테마에서 이미 투명 상태바로 설정되어 있으므로 추가 설정만
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+ (API 30+)
            window.setDecorFitsSystemWindows(false)
            WindowCompat.setDecorFitsSystemWindows(window, false)
            
            // 상태바 아이콘을 어두운 색으로 설정
            WindowCompat.getInsetsController(window, window.decorView).apply {
                isAppearanceLightStatusBars = true
            }
        } else {
            // Android 10 이하
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR // 상태바 아이콘을 어두운 색으로
            )
        }
        
        // 상태바 영역만큼 레이아웃 확장
        window.setFlags(
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        )
        
        // 상태바 높이를 즉시 웹뷰에 전달
        Handler(Looper.getMainLooper()).postDelayed({
            sendStatusBarHeightToWebView()
        }, 100) // 약간의 지연을 두어 레이아웃이 완전히 설정된 후 전달
    }

    // 권한 요청
    private fun requestPermissionsIfNeeded() {
        val toRequest = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (toRequest.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, toRequest.toTypedArray(), 100)
        }
    }

    // 상태바 높이 가져오기
    private fun getStatusBarHeight(): Int {
        val resourceId = resources.getIdentifier("status_bar_height", "dimen", "android")
        return if (resourceId > 0) {
            resources.getDimensionPixelSize(resourceId)
        } else {
            0
        }
    }

    // 웹뷰에 상태바 높이 전달
    private fun sendStatusBarHeightToWebView() {
        // 안드로이드 앱에서 이미 웹뷰에 상단 패딩을 추가했으므로 웹에서는 0으로 처리
        val statusBarHeight = 0
        
        // CSS 변수와 JavaScript 이벤트를 모두 설정
        val javascriptCode = """
            (function() {
                // CSS 변수 설정 (웹에서는 0으로 처리)
                document.documentElement.style.setProperty('--status-bar-height', '${statusBarHeight}px');
                document.documentElement.style.setProperty('--safe-area-top', '${statusBarHeight}px');
                
                // body에 패딩 추가 (웹에서는 0으로 처리)
                document.body.style.paddingTop = '${statusBarHeight}px';
                
                // 커스텀 이벤트 발생
                window.dispatchEvent(new CustomEvent('statusBarHeightChanged', { 
                    detail: { height: ${statusBarHeight} } 
                }));
                
                // 네이티브 앱 객체에 상태바 높이 설정
                if (window.nativeApp) {
                    window.nativeApp.getStatusBarHeight = function() { return ${statusBarHeight}; };
                }
                
                console.log('Status bar height set to: ${statusBarHeight}px (Android app handles padding)');
            })();
        """.trimIndent()

        runOnUiThread {
            webView.evaluateJavascript(javascriptCode, null)
        }
    }

    // JavaScript 인터페이스에서 상태바 높이 요청 처리
    private fun handleStatusBarHeightRequest() {
        sendStatusBarHeightToWebView()
    }

}