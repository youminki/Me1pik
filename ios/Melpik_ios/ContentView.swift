//
//  ContentView.swift
//  Melpik_ios
//
//  Created by 유민기 on 6/30/25.
//

import SwiftUI
import WebKit

// MARK: - Constants
private enum Constants {
    static let headerHeight: CGFloat = 1 // 노치 영역까지 포함하도록 높이 증가
    static let loadingSpinnerScale: CGFloat = 1.2
    static let loadingTextSize: CGFloat = 16
    static let initialURL = "https://me1pik.com"
}

// MARK: - ContentView
struct ContentView: View {
    @StateObject private var loginManager = LoginManager.shared
    
    var body: some View {
        TypingLoadingView()
            .onAppear {
                // 앱 시작 시 로그인 상태 점검
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    let canMaintainLogin = loginManager.checkLoginPersistence()
                    print("📱 앱 시작 시 로그인 상태 점검 결과: \(canMaintainLogin ? "✅ 유지 가능" : "❌ 유지 불가")")
                }
            }
    }
}

// MARK: - Error View
struct ErrorView: View {
    let error: String
    let retryAction: () -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 50))
                .foregroundColor(.orange)
            
            Text("연결 오류")
                .font(.custom("NanumSquareB", size: 20))
                .foregroundColor(.primary)
            
            Text(error)
                .font(.custom("NanumSquareR", size: 16))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 20)
            
            Button(action: retryAction) {
                Text("다시 시도")
                    .font(.custom("NanumSquareB", size: 16))
                    .foregroundColor(.white)
                    .padding(.horizontal, 30)
                    .padding(.vertical, 12)
                    .background(Color(hex: "#F6AE24"))
                    .cornerRadius(8)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.white)
    }
}



struct TypingLoadingView: View {
    let slogan1 = "이젠 "
    let slogan2 = "멜픽"
    let slogan3 = "을 통해"
    let slogan4 = "브랜드를 골라보세요"
    let sloganSub = "사고, 팔고, 빌리는 것을 한번에!"

    @State private var displayed1 = ""
    @State private var displayed2 = ""
    @State private var displayed3 = ""
    @State private var displayed4 = ""
    @State private var displayedSub = ""
    @State private var showWebView = false
    @State private var webViewOpacity: Double = 0
    @State private var loadingOpacity: Double = 1

    // 웹뷰를 미리 생성해두기
    @State private var webViewContainer = MainWebViewContainer()

    var body: some View {
        ZStack {
            // 웹뷰는 항상 존재, opacity로만 제어
            webViewContainer
                .opacity(webViewOpacity)
                .animation(.easeInOut(duration: 0.7), value: webViewOpacity)

            // 로딩뷰도 opacity로만 제어
            loadingBody
                .opacity(loadingOpacity)
                .animation(.easeInOut(duration: 0.7), value: loadingOpacity)
        }
        .onAppear {
            startTyping()
        }
    }

    var loadingBody: some View {
        VStack {
            // 웹의 NaverLoginBox margin-top: 64px와 동일
            Spacer().frame(height: 100)
            
            // 웹의 NaverLoginBox와 동일한 구조
            VStack(alignment: .center, spacing: 0) {
                // 로고 - 웹의 LogoWrap margin-bottom: 24px와 동일
                Image("LoadingMelPick")
                    .resizable()
                    .frame(width: 184, height: 83)
                    .padding(.bottom, 32)
                
                // 슬로건 - 웹의 Slogan과 동일한 구조
                VStack(spacing: 0) {
                    // 첫 번째 줄: "이젠 멜픽을 통해"
                    HStack(spacing: 0) {
                        Text(displayed1)
                            .font(.custom("NanumSquareEB", size: 18))
                            .foregroundColor(Color(hex: "#222"))
                        Text(displayed2)
                            .font(.custom("NanumSquareEB", size: 18))
                            .foregroundColor(Color(hex: "#F6AE24"))
                        Text(displayed3)
                            .font(.custom("NanumSquareEB", size: 18))
                            .foregroundColor(Color(hex: "#222"))
                    }
                    .frame(maxWidth: .infinity)
                    .multilineTextAlignment(.center)
                    
                    // 두 번째 줄: "브랜드를 골라보세요"
                    Text(displayed4)
                        .font(.custom("NanumSquareEB", size: 18))
                        .foregroundColor(Color(hex: "#222"))
                        .frame(maxWidth: .infinity)
                        .multilineTextAlignment(.center)
                        .lineSpacing(1.5) // 웹의 line-height: 1.5와 동일
                        .padding(.bottom, 10) // 웹의 Slogan margin-bottom: 18px와 동일
                    
                    // 서브슬로건: "사고, 팔고, 빌리는 것을 한번에!"
                    if !displayedSub.isEmpty {
                        Text(displayedSub)
                            .font(.custom("NanumSquareB", size: 15))
                            .foregroundColor(Color(hex: "#888"))
                            .frame(maxWidth: .infinity)
                            .multilineTextAlignment(.center)
                            .padding(.top, 2) // 웹의 SloganSub margin-top: 4px와 동일
                    }
                }
            }
            .padding(.horizontal, 32) // 웹의 NaverLoginBox padding: 2rem과 동일
            .frame(maxWidth: 400) // 웹의 max-width: 400px와 동일
            
            Spacer()
        }
        .background(Color.white.ignoresSafeArea())
    }

    func startTyping() {
        displayed1 = ""; displayed2 = ""; displayed3 = ""; displayed4 = ""; displayedSub = ""
        typeLine(slogan1, into: $displayed1) {
            typeLine(slogan2, into: $displayed2) {
                typeLine(slogan3, into: $displayed3) {
                    typeLine(slogan4, into: $displayed4) {
                        typeLine(sloganSub, into: $displayedSub) {
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                                // opacity만 부드럽게 전환
                                withAnimation {
                                    loadingOpacity = 0
                                    webViewOpacity = 1
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    func typeLine(_ text: String, into binding: Binding<String>, completion: @escaping () -> Void) {
        binding.wrappedValue = ""
        var idx = 0
        Timer.scheduledTimer(withTimeInterval: 0.06, repeats: true) { timer in
            if idx < text.count {
                let i = text.index(text.startIndex, offsetBy: idx+1)
                binding.wrappedValue = String(text[..<i])
                idx += 1
            } else {
                timer.invalidate()
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1, execute: completion)
            }
        }
    }
}



struct MainWebViewContainer: View {
    @StateObject private var loginManager = LoginManager.shared
    
    var body: some View {
        ContentViewMain()
            .onAppear {
                // 웹뷰 컨테이너 시작 시 로그인 상태 점검
                DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                    let canMaintainLogin = loginManager.checkLoginPersistence()
                    print("🌐 웹뷰 컨테이너 시작 시 로그인 상태 점검 결과: \(canMaintainLogin ? "✅ 유지 가능" : "❌ 유지 불가")")
                }
            }
    }
}

// MARK: - WebView
struct WebView: UIViewRepresentable {
    let webView: WKWebView
    @Binding var isLoading: Bool
    @Binding var canGoBack: Bool
    @Binding var canGoForward: Bool
    
    let appState: AppStateManager
    let locationManager: LocationManager
    let networkMonitor: NetworkMonitor
    let loginManager: LoginManager
    let onImagePicker: () -> Void
    let onCamera: () -> Void
    let onShare: (URL) -> Void
    let onSafari: (URL) -> Void
    let onError: (String) -> Void
    let onOffline: () -> Void
    
    // 앱 생명주기 이벤트 처리
    @Environment(\.scenePhase) private var scenePhase
    
    func makeUIView(context: Context) -> WKWebView {
        // 웹뷰 설정
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        
        // 웹뷰 상단 여백 제거
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.contentInset = .zero
        webView.scrollView.scrollIndicatorInsets = .zero
        
        // JavaScript 인터페이스 추가
        setupJavaScriptInterface(context: context)
        
        // 초기 URL 로드
        guard let url = URL(string: Constants.initialURL) else { return webView }
        webView.load(URLRequest(url: url))
        
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        // UI 업데이트가 필요한 경우에만 구현
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    // MARK: - Private Methods
    private func setupJavaScriptInterface(context: Context) {
        let contentController = webView.configuration.userContentController
        
        // 네이티브 기능들을 JavaScript에 노출
        contentController.add(context.coordinator, name: "nativeBridge")
        print("✅ nativeBridge 메시지 핸들러 등록됨")
        
        // ✅ saveLoginInfo 브릿지도 추가 등록
        contentController.add(context.coordinator, name: "saveLoginInfo")
        print("✅ saveLoginInfo 메시지 핸들러 등록됨")
        
        // 웹뷰 로딩 완료 알림
        contentController.add(context.coordinator, name: "webViewDidFinishLoading")
        print("✅ webViewDidFinishLoading 메시지 핸들러 등록됨")
        
        // 상태바 높이 요청 핸들러
        contentController.add(context.coordinator, name: "REQUEST_STATUS_BAR_HEIGHT")
        print("✅ REQUEST_STATUS_BAR_HEIGHT 메시지 핸들러 등록됨")
        
        // JavaScript 함수들 추가 (인스타그램 방식)
        let script = """
        // 페이지 로드 시 로그인 상태 확인
        window.addEventListener('load', function() {
            if (window.nativeApp && window.nativeApp.checkLoginStatus) {
                setTimeout(function() {
                    window.nativeApp.checkLoginStatus();
                }, 1000);
            }
            
            // 웹뷰 로딩 완료 알림
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.webViewDidFinishLoading) {
                window.webkit.messageHandlers.webViewDidFinishLoading.postMessage({});
            }
        });
        
        // 페이지 이동 시 로그인 상태 유지
        window.addEventListener('beforeunload', function() {
            // 로그인 정보를 sessionStorage에 백업
            if (localStorage.getItem('accessToken')) {
                sessionStorage.setItem('accessToken', localStorage.getItem('accessToken'));
                sessionStorage.setItem('userId', localStorage.getItem('userId'));
                sessionStorage.setItem('userEmail', localStorage.getItem('userEmail'));
                sessionStorage.setItem('userName', localStorage.getItem('userName'));
                sessionStorage.setItem('isLoggedIn', 'true');
            }
        });
        
        // 인스타그램 방식: 앱에서 로그인 정보 수신
        window.addEventListener('loginInfoReceived', function(e) {
            console.log('=== loginInfoReceived event received ===');
            console.log('Event detail:', e.detail);
            
            if (e.detail && e.detail.isLoggedIn && e.detail.userInfo) {
                const { userInfo } = e.detail;
                
                // localStorage에 저장
                localStorage.setItem('accessToken', userInfo.token);
                localStorage.setItem('userId', userInfo.id);
                localStorage.setItem('userEmail', userInfo.email);
                localStorage.setItem('userName', userInfo.name);
                if (userInfo.refreshToken) {
                    localStorage.setItem('refreshToken', userInfo.refreshToken);
                }
                if (userInfo.expiresAt) {
                    localStorage.setItem('tokenExpiresAt', userInfo.expiresAt);
                }
                localStorage.setItem('isLoggedIn', 'true');
                
                // sessionStorage에도 저장
                sessionStorage.setItem('accessToken', userInfo.token);
                sessionStorage.setItem('userId', userInfo.id);
                sessionStorage.setItem('userEmail', userInfo.email);
                sessionStorage.setItem('userName', userInfo.name);
                sessionStorage.setItem('isLoggedIn', 'true');
                
                // 쿠키에도 저장
                document.cookie = 'accessToken=' + userInfo.token + '; path=/; max-age=86400';
                document.cookie = 'userId=' + userInfo.id + '; path=/; max-age=86400';
                document.cookie = 'userEmail=' + userInfo.email + '; path=/; max-age=86400';
                document.cookie = 'isLoggedIn=true; path=/; max-age=86400';
                
                // 전역 변수 설정
                window.accessToken = userInfo.token;
                window.userId = userInfo.id;
                window.userEmail = userInfo.email;
                window.userName = userInfo.name;
                window.isLoggedIn = true;
                
                // iOS 앱에 로그인 정보 전달 (refreshToken 포함)
                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.saveLoginInfo) {
                    const loginData = {
                        id: userInfo.id,
                        email: userInfo.email,
                        name: userInfo.name,
                        token: userInfo.token,
                        refreshToken: userInfo.refreshToken || localStorage.getItem('refreshToken') || '',
                        expiresAt: userInfo.expiresAt,
                        keepLogin: true
                    };
                    
                    console.log('iOS 앱에 전달할 로그인 데이터:', loginData);
                    window.webkit.messageHandlers.saveLoginInfo.postMessage({
                        loginData: loginData
                    });
                }
                
                console.log('✅ Login info saved to all storages');
                
                // 페이지 새로고침 없이 로그인 상태 업데이트
                if (window.location.pathname === '/login') {
                    window.location.href = '/';
                }
            }
        });
        
        // 인스타그램 방식: 토큰 갱신 이벤트 수신
        window.addEventListener('tokenRefreshed', function(e) {
            console.log('=== tokenRefreshed event received ===');
            console.log('Event detail:', e.detail);
            
            if (e.detail && e.detail.tokenData) {
                const { tokenData } = e.detail;
                
                // 새로운 토큰으로 업데이트
                localStorage.setItem('accessToken', tokenData.token);
                if (tokenData.refreshToken) {
                    localStorage.setItem('refreshToken', tokenData.refreshToken);
                }
                if (tokenData.expiresAt) {
                    localStorage.setItem('tokenExpiresAt', tokenData.expiresAt);
                }
                
                sessionStorage.setItem('accessToken', tokenData.token);
                if (tokenData.refreshToken) {
                    sessionStorage.setItem('refreshToken', tokenData.refreshToken);
                }
                
                document.cookie = 'accessToken=' + tokenData.token + '; path=/; max-age=86400';
                
                window.accessToken = tokenData.token;
                
                console.log('✅ Token refreshed in all storages');
            }
        });
        
        // 인스타그램 방식: 토큰 갱신 실패 이벤트 수신
        window.addEventListener('tokenRefreshFailed', function(e) {
            console.log('=== tokenRefreshFailed event received ===');
            
            // 토큰 갱신 실패 시 사용자에게 알림
            if (typeof window.showTokenRefreshError === 'function') {
                window.showTokenRefreshError();
            } else {
                console.log('⚠️ Token refresh failed - manual login may be required');
            }
        });
        
        // 인스타그램 방식: 토큰 상태 주기적 확인
        setInterval(function() {
            const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
            
            if (!accessToken && !refreshToken) {
                console.log('⚠️ No tokens found in web storage');
                // 네이티브 앱에 토큰 상태 확인 요청
                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge) {
                    window.webkit.messageHandlers.nativeBridge.postMessage({
                        action: 'checkTokenStatus'
                    });
                }
            } else if (accessToken) {
                // 토큰이 있으면 만료 시간 확인
                try {
                    const payload = JSON.parse(atob(accessToken.split('.')[1]));
                    const currentTime = Date.now() / 1000;
                    
                    if (payload.exp && payload.exp < currentTime) {
                        console.log('⚠️ Token expired in web storage');
                        // 네이티브 앱에 토큰 갱신 요청
                        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge) {
                            window.webkit.messageHandlers.nativeBridge.postMessage({
                                action: 'refreshToken'
                            });
                        }
                    }
                } catch (e) {
                    console.log('⚠️ Failed to parse token in web storage');
                }
            }
        }, 60000); // 1분마다 확인
        
        // 인스타그램 방식: 로그아웃 이벤트 수신
        window.addEventListener('logoutSuccess', function(e) {
            console.log('=== logoutSuccess event received ===');
            
            // 모든 로그인 관련 데이터 제거
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tokenExpiresAt');
            localStorage.removeItem('isLoggedIn');
            
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('userEmail');
            sessionStorage.removeItem('userName');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('tokenExpiresAt');
            sessionStorage.removeItem('isLoggedIn');
            
            // 쿠키에서도 삭제
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            
            // 전역 변수 제거
            delete window.accessToken;
            delete window.userId;
            delete window.userEmail;
            delete window.userName;
            delete window.isLoggedIn;
            
            console.log('✅ Logout completed - all data removed');
        });
        
        window.nativeApp = {
            // 푸시 알림
            requestPushPermission: function() {
                window.webkit.messageHandlers.nativeBridge.postMessage({
                    action: 'requestPushPermission'
                });
            },
            
            // 위치 서비스
            getLocation: function() {
                window.webkit.messageHandlers.nativeBridge.postMessage({
                    action: 'getLocation'
                });
            },
            
            // 생체 인증 (비활성화)
            authenticateWithBiometrics: function() {
                console.log('Biometric authentication disabled');
                window.webkit.messageHandlers.nativeBridge.postMessage({
                    action: 'authenticateWithBiometrics'
                });
            },
            
            // 인스타그램 방식: 로그인 상태 유지 설정 저장
            saveKeepLoginSetting: function(keepLogin) {
                console.log('=== saveKeepLoginSetting called with keepLogin:', keepLogin);
                localStorage.setItem('keepLoginSetting', keepLogin.toString());
                sessionStorage.setItem('keepLoginSetting', keepLogin.toString());
                document.cookie = 'keepLoginSetting=' + keepLogin + '; path=/; max-age=86400';
                console.log('Keep login setting saved:', keepLogin);
            },
            
            // 인스타그램 방식: 로그인 상태 유지 설정 가져오기
            getKeepLoginSetting: function() {
                const setting = localStorage.getItem('keepLoginSetting');
                const result = setting === 'true';
                console.log('Keep login setting retrieved:', result);
                return result;
            },
            
            // 인스타그램 방식: 로그인 상태 유지 토큰 저장
            saveTokensWithKeepLogin: function(accessToken, refreshToken, keepLogin) {
                console.log('=== saveTokensWithKeepLogin called ===');
                console.log('keepLogin:', keepLogin);
                
                // 로그인 상태 유지 설정 저장
                this.saveKeepLoginSetting(keepLogin);
                
                if (keepLogin) {
                    // 로그인 상태 유지: localStorage에 저장 (영구 보관)
                    localStorage.setItem('accessToken', accessToken);
                    if (refreshToken) {
                        localStorage.setItem('refreshToken', refreshToken);
                    }
                    console.log('localStorage에 토큰 저장됨 (로그인 상태 유지)');
                } else {
                    // 세션 유지: sessionStorage에 저장 (브라우저 닫으면 삭제)
                    sessionStorage.setItem('accessToken', accessToken);
                    if (refreshToken) {
                        sessionStorage.setItem('refreshToken', refreshToken);
                    }
                    console.log('sessionStorage에 토큰 저장됨 (세션 유지)');
                }
                
                // 쿠키에도 저장 (웹뷰 호환성)
                document.cookie = 'accessToken=' + accessToken + '; path=/; secure; samesite=strict';
                if (refreshToken) {
                    document.cookie = 'refreshToken=' + refreshToken + '; path=/; secure; samesite=strict';
                }
                
                console.log('인스타그램 방식 토큰 저장 완료');
            },
            
            // 인스타그램 방식: 로그인 상태 유지 확인
            checkInstagramLoginStatus: function() {
                console.log('=== checkInstagramLoginStatus called ===');
                
                // localStorage와 sessionStorage 모두 확인
                const localToken = localStorage.getItem('accessToken');
                const sessionToken = sessionStorage.getItem('accessToken');
                const cookieToken = this.getCookie('accessToken');
                
                const token = localToken || sessionToken || cookieToken;
                
                if (!token) {
                    console.log('토큰이 없음');
                    return false;
                }
                
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const currentTime = Date.now() / 1000;
                    
                    // 토큰이 만료되었는지 확인
                    if (payload.exp && payload.exp < currentTime) {
                        console.log('토큰이 만료되어 로그인 상태 유지 불가');
                        this.handleWebLogout();
                        return false;
                    }
                    
                    console.log('인스타그램 방식 로그인 상태 유지 가능');
                    return true;
                } catch (error) {
                    console.log('토큰 파싱 오류로 로그인 상태 유지 불가:', error);
                    this.handleWebLogout();
                    return false;
                }
            },
            
            // 쿠키 가져오기 헬퍼 함수
            getCookie: function(name) {
                const value = '; ' + document.cookie;
                const parts = value.split('; ' + name + '=');
                if (parts.length === 2) return parts.pop().split(';').shift();
                return null;
            },
            
            // 웹 로그아웃 처리
            handleWebLogout: function() {
                console.log('=== handleWebLogout called ===');
                
                // 모든 저장소에서 토큰 삭제
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                localStorage.removeItem('keepLoginSetting');
                
                sessionStorage.removeItem('accessToken');
                sessionStorage.removeItem('refreshToken');
                sessionStorage.removeItem('userEmail');
                sessionStorage.removeItem('userId');
                sessionStorage.removeItem('userName');
                sessionStorage.removeItem('keepLoginSetting');
                
                // 쿠키에서도 삭제
                document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                document.cookie = 'keepLoginSetting=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                
                console.log('인스타그램 방식 로그아웃 처리 완료');
            },
            
            // 로그인 상태 확인
            checkLoginStatus: function() {
                console.log('=== checkLoginStatus called ===');
                
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || 
                                  sessionStorage.getItem('isLoggedIn') === 'true';
                const accessToken = localStorage.getItem('accessToken') || 
                                   sessionStorage.getItem('accessToken');
                
                console.log('Current login status:');
                console.log('- isLoggedIn:', isLoggedIn);
                console.log('- accessToken:', accessToken ? 'exists' : 'nil');
                
                if (isLoggedIn && accessToken) {
                    console.log('✅ User is logged in');
                    return true;
                } else {
                    console.log('❌ User is not logged in');
                    return false;
                }
            },
            
            // 로그인 정보 강제 전송
            forceLoginInfo: function() {
                window.webkit.messageHandlers.nativeBridge.postMessage({
                    action: 'forceLoginInfo'
                });
            },
            
            // 로그인 정보 요청 함수
            requestLoginInfo: function() {
                console.log('=== 웹에서 로그인 정보 요청 ===');
                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge) {
                    window.webkit.messageHandlers.nativeBridge.postMessage({
                        action: 'requestLoginInfo'
                    });
                } else {
                    console.log('Native bridge not available');
                }
            }
        };
        """
        
        let userScript = WKUserScript(source: script, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
        contentController.addUserScript(userScript)
        
        // 로그인 페이지에서 자동으로 로그인 정보 요청
        let autoLoginScript = """
        (function() {
            // 페이지 로드 시 로그인 페이지인지 확인
            if (window.location.pathname === '/login' || window.location.pathname.includes('/login')) {
                console.log('로그인 페이지 감지 - 로그인 정보 요청');
                // 약간의 지연 후 로그인 정보 요청
                setTimeout(function() {
                    if (window.nativeBridge && window.nativeBridge.requestLoginInfo) {
                        window.nativeBridge.requestLoginInfo();
                    }
                }, 1000);
            }
        })();
        """
        
        let autoLoginUserScript = WKUserScript(source: autoLoginScript, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
        contentController.addUserScript(autoLoginUserScript)
    }
    
    // MARK: - Coordinator
    class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        private var parent: WebView
        
        init(_ parent: WebView) {
            self.parent = parent
            super.init()
            print("LoginManager init")
            parent.loginManager.loadLoginState()
        }
        
        // MARK: - WKNavigationDelegate
        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            parent.isLoading = true
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            parent.isLoading = false
            parent.canGoBack = webView.canGoBack
            parent.canGoForward = webView.canGoForward
            
            print("=== WebView didFinish loading ===")
            let currentURL = webView.url?.absoluteString ?? "nil"
            print("Current URL: \(currentURL)")

            // 로그인 정보 자동 전달 제거 - 무한 렌더링 방지
            // 웹에서 필요할 때만 요청하도록 변경
            print("WebView loaded - login info transmission disabled to prevent infinite rendering")
            
            // 상태바 높이 전달
            // parent.sendStatusBarHeightToWeb()
        }
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            parent.isLoading = false
            handleNavigationError(error)
        }
        
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            parent.isLoading = false
            handleNavigationError(error)
        }
        
        private func handleNavigationError(_ error: Error) {
            let nsError = error as NSError
            
            // Check if it's a network error
            if nsError.domain == NSURLErrorDomain {
                switch nsError.code {
                case NSURLErrorNotConnectedToInternet,
                     NSURLErrorNetworkConnectionLost,
                     NSURLErrorCannotConnectToHost:
                    // 오프라인 상태로 처리
                    parent.onOffline()
                default:
                    parent.onError("네트워크 연결에 실패했습니다. 다시 시도해주세요.")
                }
            } else {
                parent.onError("페이지를 불러오는데 실패했습니다. 다시 시도해주세요.")
            }
        }
        
        // MARK: - WKScriptMessageHandler
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            print("=== [COORDINATOR] 메시지 수신됨 ===")
            print("메시지 이름:", message.name)
            print("메시지 body:", message.body)
            
            let body = message.body as? [String: Any] ?? [:]
            
            switch message.name {
            case "nativeBridge":
                handleNativeBridgeMessage(body)
                
            case "saveLoginInfo":
                print("=== [COORDINATOR] saveLoginInfo 메시지 처리 시작 ===")
                print("전체 body:", body)
                if let loginData = body["loginData"] as? [String: Any] {
                    print("=== [COORDINATOR] 전달받은 loginData ===")
                    print("id:", loginData["id"] ?? "nil")
                    print("email:", loginData["email"] ?? "nil")
                    print("name:", loginData["name"] ?? "nil")
                    print("token:", loginData["token"] ?? "nil")
                    print("refreshToken:", loginData["refreshToken"] ?? "nil")
                    print("expiresAt:", loginData["expiresAt"] ?? "nil")
                    print("keepLogin:", loginData["keepLogin"] ?? "nil")
                    
                    parent.loginManager.saveLoginInfo(loginData)
                    print("=== [COORDINATOR] saveLoginInfo → saveLoginState 호출 완료 ===")
                } else {
                    print("=== [COORDINATOR] loginData 파싱 실패 ===")
                    print("body 타입:", type(of: body))
                    print("body 내용:", body)
                }
                
            case "webViewDidFinishLoading":
                // 웹뷰 로딩 완료 알림
                NotificationCenter.default.post(name: NSNotification.Name("WebViewDidFinishLoading"), object: nil)
                print("WebView 로딩 완료 알림 전송")
                
            case "REQUEST_STATUS_BAR_HEIGHT":
                // 상태바 높이 요청 처리
                // parent.handleStatusBarHeightRequest()
                print("상태바 높이 요청 처리")
                
            default:
                print("=== [COORDINATOR] 알 수 없는 메시지:", message.name)
                break
            }
        }
        
        private func handleNativeBridgeMessage(_ body: [String: Any]) {
            guard let action = body["action"] as? String else { return }
            
            switch action {
            case "requestPushPermission":
                parent.appState.requestPushNotificationPermission()
                
            case "getLocation":
                parent.locationManager.requestLocation { [weak self] location in
                    guard let self = self else { return }
                    if let location = location {
                        let script = "window.dispatchEvent(new CustomEvent('locationReceived', { detail: { latitude: \(location.coordinate.latitude), longitude: \(location.coordinate.longitude) } }));"
                        self.parent.webView.evaluateJavaScript(script)
                    }
                }
                
            case "authenticateWithBiometrics":
                // 생체 인증 비활성화 - 항상 실패 반환
                let script = "window.dispatchEvent(new CustomEvent('biometricAuthResult', { detail: { success: false } }));"
                parent.webView.evaluateJavaScript(script)
                
            case "openImagePicker":
                parent.onImagePicker()
                
            case "openCamera":
                parent.onCamera()
                
            case "share":
                if let urlString = body["url"] as? String,
                   let url = URL(string: urlString) {
                    parent.onShare(url)
                }
                
            case "openInSafari":
                if let urlString = body["url"] as? String,
                   let url = URL(string: urlString) {
                    parent.onSafari(url)
                }
                
            case "getNetworkStatus":
                let isConnected = parent.networkMonitor.isConnected
                let script = "window.dispatchEvent(new CustomEvent('networkStatusReceived', { detail: { isConnected: \(isConnected) } }));"
                parent.webView.evaluateJavaScript(script)
                
            case "getAppInfo":
                let appInfo: [String: Any] = [
                    "version": parent.appState.appVersion,
                    "buildNumber": parent.appState.buildNumber,
                    "launchCount": parent.appState.appLaunchCount
                ]
                if let jsonData = try? JSONSerialization.data(withJSONObject: appInfo),
                   let jsonString = String(data: jsonData, encoding: .utf8) {
                    let script = "window.dispatchEvent(new CustomEvent('appInfoReceived', { detail: \(jsonString) }));"
                    parent.webView.evaluateJavaScript(script)
                }
                
            case "logout":
                parent.loginManager.logout()
                
            case "setAutoLogin":
                // 자동 로그인 비활성화 - 설정 무시
                parent.loginManager.setAutoLogin(enabled: false)
                
            case "goBack":
                if parent.webView.canGoBack {
                    parent.webView.goBack()
                }
                
            case "reload":
                parent.webView.reload()
                
            case "addCard":
                parent.loginManager.handleCardAddRequest(webView: parent.webView) { [weak self] success, errorMessage in
                    guard let self = self else { return }
                    
                    DispatchQueue.main.async {
                        if success {
                            // 카드 추가 성공 시 웹뷰에 알림
                            self.parent.loginManager.notifyCardAddComplete(webView: self.parent.webView, success: true)
                            
                            // 카드 목록 새로고침 이벤트 발생
                            let script = "window.dispatchEvent(new CustomEvent('cardListRefresh'));"
                            self.parent.webView.evaluateJavaScript(script)
                        } else {
                            // 카드 추가 실패 시 웹뷰에 에러 알림
                            self.parent.loginManager.notifyCardAddComplete(webView: self.parent.webView, success: false, errorMessage: errorMessage)
                        }
                    }
                }
                
            case "refreshCardList":
                // 카드 목록 새로고침 이벤트 발생
                let script = "window.dispatchEvent(new CustomEvent('cardListRefresh'));"
                parent.webView.evaluateJavaScript(script)
                
            case "debugLoginState":
                // 로그인 상태 디버깅
                DebugHelper.shared.debugLoginState(loginManager: parent.loginManager, webView: parent.webView)
                
            case "checkTokenStatus":
                // 토큰 상태 확인
                parent.loginManager.checkTokenStatus()
                parent.loginManager.syncTokenWithWebView(webView: parent.webView)
                
            case "refreshToken":
                // 토큰 갱신 요청
                parent.loginManager.refreshAccessToken()
                
            case "forceSendLoginInfo":
                // 강제 로그인 정보 전송
                DebugHelper.shared.forceSendLoginInfo(loginManager: parent.loginManager, webView: parent.webView)
                
            case "checkLoginStatus":
                // 로그인 상태 확인
                parent.loginManager.checkLoginStatus(webView: parent.webView)
                
            case "setKeepLogin":
                if let enabled = body["enabled"] as? Bool {
                    parent.loginManager.setKeepLogin(enabled: enabled)
                }
                
            case "getKeepLoginSetting":
                let keepLogin = parent.loginManager.getKeepLoginSetting()
                let script = "window.dispatchEvent(new CustomEvent('keepLoginSettingReceived', { detail: { keepLogin: \(keepLogin) } }));"
                parent.webView.evaluateJavaScript(script)
                
            case "saveKeepLoginSetting":
                if let keepLogin = body["keepLogin"] as? Bool {
                    parent.loginManager.saveKeepLoginSetting(keepLogin)
                    print("Keep login setting saved: \(keepLogin)")
                }
                
            case "saveTokensWithKeepLogin":
                if let accessToken = body["accessToken"] as? String,
                   let keepLogin = body["keepLogin"] as? Bool {
                    let refreshToken = body["refreshToken"] as? String
                    parent.loginManager.saveTokensWithKeepLogin(accessToken: accessToken, refreshToken: refreshToken, keepLogin: keepLogin)
                    print("Tokens saved with keep login: \(keepLogin)")
                }
                
            case "checkInstagramLoginStatus":
                let isLoggedIn = parent.loginManager.checkInstagramLoginStatus()
                let script = "window.dispatchEvent(new CustomEvent('instagramLoginStatusReceived', { detail: { isLoggedIn: \(isLoggedIn) } }));"
                parent.webView.evaluateJavaScript(script)
                print("Instagram login status checked: \(isLoggedIn)")
                
            case "initializeInstagramLoginStatus":
                Task {
                    await parent.loginManager.initializeInstagramLoginStatus()
                    print("Instagram login status initialized")
                }
                
            case "forceLoginInfo":
                // 로그인 정보 강제 전송
                if parent.loginManager.isLoggedIn {
                    parent.loginManager.sendLoginInfoToWeb(webView: parent.webView)
                }
                
            case "requestLoginInfo":
                // 웹에서 로그인 정보 요청
                parent.loginManager.requestLoginInfoFromWeb(webView: parent.webView)
                print("Requesting login info from web")
                
            default:
                break
            }
        }
    }
}

// MARK: - WebViewStore
@MainActor
class WebViewStore: ObservableObject {
    let webView: WKWebView
    
    init() {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        // 성능 최적화 설정
        configuration.websiteDataStore = WKWebsiteDataStore.default()
        configuration.processPool = WKProcessPool()
        
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.scrollView.bounces = false
        
        // 추가 성능 최적화
        webView.scrollView.showsVerticalScrollIndicator = false
        webView.scrollView.showsHorizontalScrollIndicator = false
    }
    
    deinit {
        // 메모리 정리 (Swift 6에서는 self 캡처 불가, 별도 정리 불필요)
        // webView.stopLoading()
        // webView.loadHTMLString("", baseURL: nil)
    }
}

// MARK: - Preview
#Preview {
    ContentView()
}

// 아래에 기존 ContentView의 웹뷰 관련 전체 코드를 ContentViewMain으로 옮깁니다.

struct ContentViewMain: View {
    @StateObject private var webViewStore = WebViewStore()
    @StateObject private var appState = AppStateManager()
    @StateObject private var locationManager = LocationManager()
    @StateObject private var networkMonitor = NetworkMonitor()
    @StateObject private var loginManager = LoginManager.shared
    @StateObject private var privacyManager = PrivacyManager()
    @StateObject private var cacheManager = CacheManager.shared
    @StateObject private var performanceMonitor = PerformanceMonitor.shared
    
    // 앱 생명주기 이벤트 처리
    @Environment(\.scenePhase) private var scenePhase
    
    @State private var isLoading = true
    @State private var canGoBack = false
    @State private var canGoForward = false
    @State private var showingImagePicker = false
    @State private var showingCamera = false
    @State private var showingShareSheet = false
    @State private var showingSafari = false
    @State private var selectedImage: UIImage?
    @State private var shareURL: URL?
    @State private var showingAlert = false
    @State private var showingCardAddView = false
    @State private var cardAddCompletion: ((Bool, String?) -> Void)?
    
    // Error handling states
    @State private var hasError = false
    @State private var errorMessage = ""
    @State private var isOffline = false
    @State private var retryCount = 0
    
    // Performance monitoring states

    
    var body: some View {
        ZStack {
            // 전체 배경색 설정
            Color(.systemBackground)
                .ignoresSafeArea(.all, edges: .all)
            
            // Error or Offline View
            if hasError {
                ErrorView(error: errorMessage) {
                    retryLoading()
                }
            } else if isOffline {
                OfflineView {
                    retryLoading()
                }
            } else {
                // 웹뷰 (상단 헤더 제거, 하단 safe area 무시)
                WebView(
                    webView: webViewStore.webView,
                    isLoading: $isLoading,
                    canGoBack: $canGoBack,
                    canGoForward: $canGoForward,
                    appState: appState,
                    locationManager: locationManager,
                    networkMonitor: networkMonitor,
                    loginManager: loginManager,
                    onImagePicker: { showingImagePicker = true },
                    onCamera: { showingCamera = true },
                    onShare: { url in
                        shareURL = url
                        showingShareSheet = true
                    },
                    onSafari: { url in
                        shareURL = url
                        showingSafari = true
                    },
                    onError: { error in
                        handleError(error)
                    },
                    onOffline: {
                        handleOffline()
                    }
                )
                .ignoresSafeArea(.all, edges: .bottom)
                .onAppear {
                    // 웹뷰 시작 시 로그인 상태 점검
                    DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                        let canMaintainLogin = loginManager.checkLoginPersistence()
                        print("🔍 웹뷰 시작 시 로그인 상태 점검 결과: \(canMaintainLogin ? "✅ 유지 가능" : "❌ 유지 불가")")
                        
                        // 로그인 상태가 유지되지 않으면 강제 복구 시도
                        if !canMaintainLogin {
                            print("⚠️ 로그인 상태 유지 불가 - 강제 복구 시도")
                            loginManager.forceRestoreLoginState()
                        }
                    }
                }
            }
        }
        .statusBarHidden(false)
        .navigationBarHidden(true)
        .preferredColorScheme(.light)
        .onAppear {
            setupApp()
            // 앱 시작 시 로그인 상태 확인 (지연 시간 증가)
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                loginManager.checkLoginStatus(webView: webViewStore.webView)
            }
            // 카드 추가 화면 표시 알림 수신
            NotificationCenter.default.addObserver(
                forName: NSNotification.Name("ShowCardAddView"),
                object: nil,
                queue: .main
            ) { notification in
                if let completion = notification.userInfo?["completion"] as? (Bool, String?) -> Void {
                    self.cardAddCompletion = completion
                    self.showingCardAddView = true
                }
            }
            // 디버깅 도구 실행 (개발 중에만 사용)
            #if DEBUG
            DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
                DebugHelper.shared.runFullDebug(loginManager: loginManager, webView: webViewStore.webView)
            }
            #endif
        }
        .sheet(isPresented: $showingImagePicker) {
            ImagePicker(selectedImage: $selectedImage, sourceType: .photoLibrary)
        }
        .sheet(isPresented: $showingCamera) {
            ImagePicker(selectedImage: $selectedImage, sourceType: .camera)
        }
        .sheet(isPresented: $showingShareSheet) {
            if let url = shareURL {
                ShareSheet(activityItems: [url])
            }
        }
        .sheet(isPresented: $showingSafari) {
            if let url = shareURL {
                SafariView(url: url)
            }
        }
        .sheet(isPresented: $showingCardAddView) {
            if let completion = cardAddCompletion {
                CardAddView { success, error in
                    completion(success, error)
                    showingCardAddView = false
                }
            }
        }

        .onReceive(networkMonitor.$isConnected) { isConnected in
            if !isConnected && !isLoading {
                handleOffline()
            } else if isConnected && isOffline {
                retryLoading()
            }
        }


        .alert("제목", isPresented: $showingAlert) {
            Button("확인", role: .cancel) { }
        } message: {
            Text("메시지")
        }
        .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("PushTokenReceived"))) { notification in
            if let token = notification.userInfo?["token"] as? String {
                sendPushTokenToWeb(token: token)
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("LoginInfoReceived"))) { _ in
            sendLoginInfoToWeb()
        }
        .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("TokenRefreshReceived"))) { notification in
            if let tokenData = notification.userInfo?["tokenData"] as? [String: Any] {
                sendTokenRefreshToWeb(tokenData: tokenData)
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("TokenRefreshFailed"))) { _ in
            sendTokenRefreshFailedToWeb()
        }
        .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("LogoutRequested"))) { _ in
            sendLogoutToWeb()
        }
        .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("ForceSendLoginInfo"))) { _ in
            if loginManager.isLoggedIn {
                loginManager.sendLoginInfoToWeb(webView: webViewStore.webView)
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("KeepLoginSettingChanged"))) { notification in
            if let keepLogin = notification.userInfo?["keepLogin"] as? Bool {
                sendKeepLoginSettingToWeb(keepLogin: keepLogin)
            }
        }
        .onChange(of: scenePhase) { _, _ in
            handleAppLifecycleChange()
        }
        .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("WebViewDidFinishLoading"))) { _ in
            print("=== WebView 로딩 완료 - 로그인 상태 확인 및 refreshToken 동기화 ===")
            
            // 로그인 상태 확인
            loginManager.checkLoginStatus(webView: webViewStore.webView)
            
            // refreshToken 동기화
            loginManager.syncRefreshTokenFromWebView(webView: webViewStore.webView)
        }
    }
    
    private func setupApp() {
        // 개인정보 처리방침은 me1pik.com에서 처리하므로 앱에서는 확인하지 않음
        
        
        // 성능 모니터링 시작
        performanceMonitor.startMonitoring()
        
        // 캐시 상태 확인
        let cacheHealth = cacheManager.performCacheHealthCheck()
        if !cacheHealth.isHealthy {
            print("Cache health issues detected: \(cacheHealth.issues)")
        }
        
        // 푸시 알림 권한 요청 (개인정보 동의 후)
        if privacyManager.canSendPushNotifications() {
            appState.requestPushNotificationPermission()
        }
        
        // 위치 서비스 권한 요청 (개인정보 동의 후)
        if privacyManager.canUseLocationServices() {
            locationManager.requestLocationPermission()
        }
        
        // 생체 인증 설정
        appState.setupBiometricAuth()
        
        // 네트워크 모니터링 시작
        networkMonitor.startMonitoring()
        
        // 앱 성능 분석 시작
        appState.startPerformanceMonitoring()
    }
    

    
    private func sendPushTokenToWeb(token: String) {
        let script = "window.dispatchEvent(new CustomEvent('pushTokenReceived', { detail: '\(token)' }));"
        webViewStore.webView.evaluateJavaScript(script)
    }
    
    private func sendLoginInfoToWeb() {
        print("sendLoginInfoToWeb called")
        loginManager.sendLoginInfoToWeb(webView: webViewStore.webView)
    }
    
    private func sendTokenRefreshToWeb(tokenData: [String: Any]) {
        print("sendTokenRefreshToWeb called")
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: tokenData),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            
            let script = """
            window.dispatchEvent(new CustomEvent('tokenRefreshed', {
                detail: {
                    tokenData: \(jsonString)
                }
            }));
            """
            
            webViewStore.webView.evaluateJavaScript(script) { result, error in
                if let error = error {
                    print("Error sending token refresh to web: \(error)")
                } else {
                    print("✅ Token refresh sent to web successfully")
                }
            }
        }
    }
    
    private func sendTokenRefreshFailedToWeb() {
        print("sendTokenRefreshFailedToWeb called")
        
        let script = """
        window.dispatchEvent(new CustomEvent('tokenRefreshFailed'));
        """
        
        webViewStore.webView.evaluateJavaScript(script) { result, error in
            if let error = error {
                print("Error sending token refresh failed to web: \(error)")
            } else {
                print("✅ Token refresh failed sent to web successfully")
            }
        }
    }
    
    private func sendLogoutToWeb() {
        print("sendLogoutToWeb called")
        
        let script = """
        window.dispatchEvent(new CustomEvent('logoutSuccess'));
        """
        
        webViewStore.webView.evaluateJavaScript(script) { result, error in
            if let error = error {
                print("Error sending logout to web: \(error)")
            } else {
                print("✅ Logout sent to web successfully")
            }
        }
    }
    
    private func sendKeepLoginSettingToWeb(keepLogin: Bool) {
        print("sendKeepLoginSettingToWeb called with keepLogin: \(keepLogin)")
        
        let script = """
        window.dispatchEvent(new CustomEvent('keepLoginSettingChanged', {
            detail: {
                keepLogin: \(keepLogin)
            }
        }));
        """
        
        webViewStore.webView.evaluateJavaScript(script) { result, error in
            if let error = error {
                print("Error sending keep login setting to web: \(error)")
            } else {
                print("✅ Keep login setting sent to web successfully")
            }
        }
    }
    
    // MARK: - Error Handling Methods
    private func handleError(_ error: String) {
        DispatchQueue.main.async {
            self.hasError = true
            self.errorMessage = error
            self.isOffline = false
            
            // 에러 추적
            self.appState.trackError(NSError(domain: "WebView", code: -1, userInfo: [NSLocalizedDescriptionKey: error]), context: "WebView")
        }
    }
    
    private func handleOffline() {
        DispatchQueue.main.async {
            self.isOffline = true
            self.hasError = false
            
            // 오프라인 상태 추적
            self.appState.trackUserAction("app_offline", properties: [
                "connection_type": self.networkMonitor.connectionType.rawValue,
                "connection_quality": self.networkMonitor.connectionQuality.rawValue
            ])
        }
    }
    
    private func retryLoading() {
        DispatchQueue.main.async {
            self.hasError = false
            self.isOffline = false
            self.retryCount += 1
            
            // 재시도 추적
            self.appState.trackUserAction("app_retry", properties: [
                "retry_count": self.retryCount,
                "connection_type": self.networkMonitor.connectionType.rawValue
            ])
            
            // Reset webview and reload
            guard let url = URL(string: Constants.initialURL) else { return }
            let request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData)
            self.webViewStore.webView.load(request)
        }
    }
    
    // MARK: - 앱 생명주기 이벤트 처리
    private func handleAppLifecycleChange() {
        switch scenePhase {
        case .active:
            print("🔄 App became active - checking token persistence")
            // 앱이 활성화될 때 토큰 저장 상태 확인
            loginManager.verifyTokenStorage()
            
            // 토큰 상태 상세 확인
            loginManager.checkTokenStatus()
            
            // 웹뷰와 토큰 동기화
            loginManager.syncTokenWithWebView(webView: webViewStore.webView)
            
            // 토큰 유효성 확인 및 갱신
            if let userInfo = loginManager.userInfo, let expiresAt = userInfo.expiresAt {
                let timeUntilExpiry = expiresAt.timeIntervalSinceNow
                print("Token expires in: \(timeUntilExpiry) seconds")
                
                if timeUntilExpiry < 300 { // 5분 이내 만료
                    print("⚠️ Token expires soon, refreshing...")
                    loginManager.refreshAccessToken()
                } else if timeUntilExpiry < 0 { // 이미 만료됨
                    print("❌ Token already expired, attempting refresh...")
                    loginManager.refreshAccessToken()
                }
            } else {
                // expiresAt이 없으면 토큰 갱신 시도
                print("⚠️ No expiresAt found, attempting token refresh...")
                loginManager.refreshAccessToken()
            }
            
        case .inactive:
            print("🔄 App became inactive - ensuring token persistence")
            // 앱이 비활성화될 때 토큰 저장 보장
            loginManager.ensureTokenPersistence()
            
        case .background:
            print("🔄 App entered background - final token persistence check")
            // 앱이 백그라운드로 갈 때 최종 토큰 저장 확인
            loginManager.ensureTokenPersistence()
            
            // 백그라운드 작업 요청 (최대 30초)
            var backgroundTaskID: UIBackgroundTaskIdentifier = .invalid
            backgroundTaskID = UIApplication.shared.beginBackgroundTask(withName: "ContentViewTokenPersistence") {
                UIApplication.shared.endBackgroundTask(backgroundTaskID)
                backgroundTaskID = .invalid
            }
            
            // 토큰 저장 완료 후 백그라운드 작업 종료
            DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                if backgroundTaskID != .invalid {
                    UIApplication.shared.endBackgroundTask(backgroundTaskID)
                    backgroundTaskID = .invalid
                }
            }
            
        @unknown default:
            break
        }
    }
    
    // MARK: - 상태바 높이 처리
    private func getStatusBarHeight() -> CGFloat {
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first(where: { $0.isKeyWindow }) {
            return window.windowScene?.statusBarManager?.statusBarFrame.height ?? 0
        }
        return 0
    }
    
    private func sendStatusBarHeightToWeb() {
        let statusBarHeight = getStatusBarHeight()
        
        let script = """
        window.dispatchEvent(new CustomEvent('statusBarHeightChanged', {
            detail: {
                height: \(statusBarHeight)
            }
        }));
        """
        
        webViewStore.webView.evaluateJavaScript(script) { result, error in
            if let error = error {
                print("Error sending status bar height to web: \(error)")
            } else {
                print("✅ Status bar height sent to web successfully: \(statusBarHeight)")
            }
        }
    }
    
    private func handleStatusBarHeightRequest() {
        sendStatusBarHeightToWeb()
    }
} 
