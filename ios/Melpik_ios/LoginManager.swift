//
//  LoginManager.swift
//  Melpik_ios
//
//  Created by 유민기 on 6/30/25.
//

import SwiftUI
import Security
import LocalAuthentication
import WebKit
import Foundation

// MARK: - String 확장
extension String {
    var isNilOrEmpty: Bool {
        return self.isEmpty
    }
}

extension Optional where Wrapped == String {
    var isNilOrEmpty: Bool {
        return self?.isEmpty ?? true
    }
}

@MainActor
class LoginManager: ObservableObject {
    static let shared = LoginManager()
    @Published var isLoggedIn = false
    @Published var isLoading = true
    @Published var userInfo: UserInfo?
    
    private let keychainService = "me1pik.com"
    private let userDefaults = UserDefaults.standard
    private var isInitializing = false
    private var tokenRefreshTimer: Timer?
    private var appLifecycleObserver: NSObjectProtocol?
    
    init() {
        print("=== LoginManager 초기화 시작 ===")
        setupAppLifecycleObserver()
        
        // 초기화 중 플래그 설정
        isInitializing = true
        
        // 로그인 상태 로드 (동기적으로 처리)
        loadLoginState()
        
        // 인스타그램 방식 로그인 상태 확인
        initializeInstagramLoginStatus()
        
        // 초기화 완료
        isInitializing = false
        
        print("=== LoginManager 초기화 완료 ===")
    }
    
    deinit {
        print("LoginManager deinit")
        tokenRefreshTimer?.invalidate()
        tokenRefreshTimer = nil
        
        // 모든 앱 생명주기 관찰자 제거
        NotificationCenter.default.removeObserver(self)
    }
    
    // MARK: - 앱 생명주기 관찰자 설정
    private func setupAppLifecycleObserver() {
        // 기존 관찰자 제거
        NotificationCenter.default.removeObserver(self)
        
        // 앱이 비활성화될 때
        let willResignObserver = NotificationCenter.default.addObserver(
            forName: UIApplication.willResignActiveNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                self?.handleAppWillResignActive()
            }
        }
        
        // 앱이 백그라운드로 갈 때
        _ = NotificationCenter.default.addObserver(
            forName: UIApplication.didEnterBackgroundNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                self?.handleAppDidEnterBackground()
            }
        }
        
        // 앱이 종료될 때
        _ = NotificationCenter.default.addObserver(
            forName: UIApplication.willTerminateNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                self?.handleAppWillTerminate()
            }
        }
        
        // 앱이 활성화될 때
        _ = NotificationCenter.default.addObserver(
            forName: UIApplication.didBecomeActiveNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                self?.handleAppDidBecomeActive()
            }
        }
        
        // 관찰자들을 저장
        appLifecycleObserver = willResignObserver
    }
    
    // MARK: - 앱이 비활성화될 때 처리
    private func handleAppWillResignActive() {
        print("🔄 App will resign active - ensuring token persistence")
        ensureTokenPersistence()
        
        // UserDefaults 강제 동기화
        userDefaults.synchronize()
    }
    
    // MARK: - 앱이 백그라운드로 갈 때 처리
    private func handleAppDidEnterBackground() {
        print("🔄 App did enter background - final token persistence check")
        ensureTokenPersistence()
        
        // UserDefaults 강제 동기화
        userDefaults.synchronize()
        
        // 백그라운드 작업 요청 (최대 30초)
        var backgroundTaskID: UIBackgroundTaskIdentifier = .invalid
        backgroundTaskID = UIApplication.shared.beginBackgroundTask(withName: "TokenPersistence") {
            UIApplication.shared.endBackgroundTask(backgroundTaskID)
            backgroundTaskID = .invalid
        }
        
        // 토큰 저장 완료 후 백그라운드 작업 종료
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            if backgroundTaskID != .invalid {
                UIApplication.shared.endBackgroundTask(backgroundTaskID)
                backgroundTaskID = .invalid
            }
        }
    }
    
    // MARK: - 앱이 종료될 때 처리
    private func handleAppWillTerminate() {
        print("🔄 App will terminate - emergency token persistence")
        emergencyTokenPersistence()
        
        // UserDefaults 강제 동기화
        userDefaults.synchronize()
    }
    
    // MARK: - 앱이 활성화될 때 처리
    private func handleAppDidBecomeActive() {
        print("🔄 App did become active - verifying token persistence")
        verifyTokenStorage()
        
        // 토큰 유효성 확인 및 갱신
        if let userInfo = userInfo, let expiresAt = userInfo.expiresAt {
            let timeUntilExpiry = expiresAt.timeIntervalSinceNow
            print("Token expires in: \(timeUntilExpiry) seconds")
            
            if timeUntilExpiry < 300 { // 5분 이내 만료
                print("⚠️ Token expires soon, refreshing...")
                refreshAccessToken()
            } else if timeUntilExpiry < 0 { // 이미 만료됨
                print("❌ Token already expired, attempting refresh...")
                refreshAccessToken()
            }
        } else {
            // expiresAt이 없으면 토큰 갱신 시도
            print("⚠️ No expiresAt found, attempting token refresh...")
            refreshAccessToken()
        }
        
        // 로그인 상태 재확인
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.loadLoginState()
        }
    }
    
    // MARK: - 토큰 저장 안정성 보장
    func ensureTokenPersistence() {
        guard let userInfo = userInfo else { return }
        
        // MainActor에서 직접 처리
        Task { @MainActor in
            // UserDefaults 강제 동기화
            userDefaults.synchronize()
            
            // Keychain에 토큰 재저장 (이중 보장)
            saveToKeychain(key: "accessToken", value: userInfo.token)
            if let refreshToken = userInfo.refreshToken {
                saveToKeychain(key: "refreshToken", value: refreshToken)
            }
            
            print("✅ Token persistence ensured before app backgrounding")
        }
    }
    
    // MARK: - 긴급 토큰 저장 (앱 종료 시)
    private func emergencyTokenPersistence() {
        guard let userInfo = userInfo else { return }
        
        print("🚨 Emergency token persistence - app terminating")
        
        // MainActor에서 직접 처리
        Task { @MainActor in
            // UserDefaults 즉시 동기화
            userDefaults.set(true, forKey: "isLoggedIn")
            userDefaults.set(userInfo.id, forKey: "userId")
            userDefaults.set(userInfo.email, forKey: "userEmail")
            userDefaults.set(userInfo.name, forKey: "userName")
            userDefaults.set(userInfo.token, forKey: "accessToken")
            if let refreshToken = userInfo.refreshToken {
                userDefaults.set(refreshToken, forKey: "refreshToken")
            }
            if let expiresAt = userInfo.expiresAt {
                userDefaults.set(expiresAt, forKey: "tokenExpiresAt")
            }
            
            // UserDefaults 강제 동기화
            userDefaults.synchronize()
            
            // Keychain에 토큰 저장 (동기 방식으로 즉시 저장)
            saveToKeychainSync(key: "accessToken", value: userInfo.token)
            if let refreshToken = userInfo.refreshToken {
                saveToKeychainSync(key: "refreshToken", value: refreshToken)
            }
            
            print("✅ Emergency token persistence completed")
        }
    }
    
    // MARK: - 토큰 자동 갱신 관리
    @MainActor
    private func setupTokenRefreshTimer() {
        // 기존 타이머 정리
        tokenRefreshTimer?.invalidate()
        tokenRefreshTimer = nil
        
        guard let userInfo = userInfo,
              let expiresAt = userInfo.expiresAt else { return }
        
        // 토큰 만료 5분 전에 갱신
        let refreshTime = expiresAt.addingTimeInterval(-300)
        let timeUntilRefresh = refreshTime.timeIntervalSinceNow
        
        if timeUntilRefresh > 0 {
            tokenRefreshTimer = Timer.scheduledTimer(withTimeInterval: timeUntilRefresh, repeats: false) { [weak self] _ in
                Task { @MainActor in
                    self?.refreshAccessToken()
                }
            }
            print("Token refresh scheduled for: \(refreshTime)")
        } else {
            // 이미 만료되었거나 곧 만료될 예정이면 즉시 갱신
            Task { @MainActor in
                refreshAccessTokenInternal()
            }
        }
    }
    
    @MainActor
    private func refreshAccessTokenInternal() {
        print("🔄 Refreshing access token with real API call...")
        
        // 실제 서버 API 호출
        guard let url = URL(string: "https://api.stylewh.com/auth/refresh") else {
            print("❌ Invalid refresh URL")
            logout()
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        let requestBody: [String: Any] = [
            "refreshToken": userDefaults.string(forKey: "refreshToken") ?? "",
            "autoLogin": true
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
        } catch {
            print("❌ Failed to serialize request body: \(error)")
            logout()
            return
        }
        
        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    print("❌ Token refresh network error: \(error)")
                    self?.handleTokenRefreshFailure()
                    return
                }
                
                guard let data = data else {
                    print("❌ No data received from token refresh")
                    self?.handleTokenRefreshFailure()
                    return
                }
                
                do {
                    let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                    print("✅ Token refresh response received")
                    
                    if let accessToken = json?["accessToken"] as? String,
                       let newRefreshToken = json?["refreshToken"] as? String,
                       let expiresAtString = json?["expiresAt"] as? String {
                        
                        // ISO8601 날짜 파싱
                        let formatter = ISO8601DateFormatter()
                        let expiresAt = formatter.date(from: expiresAtString)
                        
                        // 토큰 업데이트
                        self?.userDefaults.set(accessToken, forKey: "accessToken")
                        self?.userDefaults.set(newRefreshToken, forKey: "refreshToken")
                        if let expiresAt = expiresAt {
                            self?.userDefaults.set(expiresAt, forKey: "tokenExpiresAt")
                        }
                        
                        // UserInfo 업데이트
                        if let userInfo = self?.userInfo {
                            let updatedUserInfo = UserInfo(
                                id: userInfo.id,
                                email: userInfo.email,
                                name: userInfo.name,
                                token: accessToken,
                                refreshToken: newRefreshToken,
                                expiresAt: expiresAt
                            )
                            self?.userInfo = updatedUserInfo
                        }
                        
                        // Keychain에도 저장
                        self?.saveToKeychain(key: "accessToken", value: accessToken)
                        self?.saveToKeychain(key: "refreshToken", value: newRefreshToken)
                        
                        // UserDefaults 강제 동기화
                        self?.userDefaults.synchronize()
                        
                        // 웹뷰에 새로운 토큰 전달
                        NotificationCenter.default.post(
                            name: NSNotification.Name("TokenRefreshed"),
                            object: nil,
                            userInfo: ["tokenData": json!]
                        )
                        
                        // 다음 갱신 타이머 설정
                        self?.setupTokenRefreshTimer()
                        
                        print("✅ Token refreshed successfully")
                    } else {
                        print("❌ Invalid token refresh response format")
                        self?.handleTokenRefreshFailure()
                    }
                } catch {
                    print("❌ Failed to parse token refresh response: \(error)")
                    self?.handleTokenRefreshFailure()
                }
            }
        }.resume()
    }
    
    private func handleTokenRefreshFailure() {
        print("❌ Token refresh failed, checking remaining tokens...")
        
        // 남은 토큰 확인
        let remainingRefreshToken = userDefaults.string(forKey: "refreshToken")
        
        if remainingRefreshToken == nil || remainingRefreshToken?.isEmpty == true {
            print("❌ No refresh token available, logging out")
            logout()
        } else {
            print("⚠️ Refresh token exists but refresh failed, keeping current session")
            // 토큰은 유지하되 사용자에게 알림
            NotificationCenter.default.post(
                name: NSNotification.Name("TokenRefreshFailed"),
                object: nil
            )
        }
    }
    
    // MARK: - 로그인 상태 저장
    @MainActor
    func saveLoginState(userInfo: UserInfo) {
        guard !isInitializing else { return }
        print("[saveLoginState] 호출됨 - userId: \(userInfo.id), accessToken: \(userInfo.token), refreshToken: \(userInfo.refreshToken ?? "nil")")
        
        print("saveLoginState called, userInfo: \(userInfo)")
        
        // UserDefaults에 기본 정보 저장 (강제 동기화 포함)
        userDefaults.set(true, forKey: "isLoggedIn")
        userDefaults.set(userInfo.id, forKey: "userId")
        userDefaults.set(userInfo.email, forKey: "userEmail")
        userDefaults.set(userInfo.name, forKey: "userName")
        userDefaults.set(userInfo.token, forKey: "accessToken")
        
        // Keychain에 토큰 저장 (이중 보장)
        print("[saveLoginState] saveToKeychain(accessToken)")
        saveToKeychainWithRetry(key: "accessToken", value: userInfo.token)
        
        // refreshToken 저장 로직 강화
        if let refreshToken = userInfo.refreshToken {
            print("[saveLoginState] refreshToken 저장 시도: \(refreshToken)")
            userDefaults.set(refreshToken, forKey: "refreshToken")
            print("[saveLoginState] saveToKeychain(refreshToken)")
            saveToKeychainWithRetry(key: "refreshToken", value: refreshToken)
            
            // 저장 후 확인
            let check = loadFromKeychain(key: "refreshToken")
            print("[saveLoginState] 저장 후 Keychain에서 확인: \(check ?? "nil")")
        } else {
            print("[saveLoginState] refreshToken이 nil입니다.")
        }
        
        if let expiresAt = userInfo.expiresAt {
            userDefaults.set(expiresAt, forKey: "tokenExpiresAt")
        }
        
        // UserDefaults 강제 동기화 (앱 종료 시에도 저장 보장)
        userDefaults.synchronize()
        
        // @Published 프로퍼티 업데이트를 메인 스레드에서 안전하게 처리
        DispatchQueue.main.async {
            self.userInfo = userInfo
            self.isLoggedIn = true
            self.isLoading = false
        }
        
        // 토큰 자동 갱신 타이머 설정
        setupTokenRefreshTimer()
        
        // 토큰 저장 확인
        verifyTokenStorage()
        
        print("[saveLoginState] isLoggedIn:", isLoggedIn)
        print("[saveLoginState] userId:", userDefaults.string(forKey: "userId") ?? "nil")
        print("[saveLoginState] userEmail:", userDefaults.string(forKey: "userEmail") ?? "nil")
        print("[saveLoginState] userName:", userDefaults.string(forKey: "userName") ?? "nil")
        print("[saveLoginState] expiresAt:", userDefaults.object(forKey: "tokenExpiresAt") ?? "nil")
        print("[saveLoginState] accessToken:", loadFromKeychain(key: "accessToken") ?? "nil")
        print("[saveLoginState] refreshToken:", loadFromKeychain(key: "refreshToken") ?? "nil")
    }
    
    // MARK: - 로그인 상태 로드
    func loadLoginState() {
        print("=== loadLoginState called ===")
        
        // UserDefaults에서 기본 정보 로드
        let isLoggedIn = userDefaults.bool(forKey: "isLoggedIn")
        let userId = userDefaults.string(forKey: "userId") ?? ""
        let userEmail = userDefaults.string(forKey: "userEmail") ?? ""
        let userName = userDefaults.string(forKey: "userName") ?? ""
        let expiresAtString = userDefaults.string(forKey: "tokenExpiresAt")
        
        // Keychain에서 토큰 로드
        var accessToken = loadFromKeychain(key: "accessToken") ?? ""
        var refreshToken = loadFromKeychain(key: "refreshToken") ?? ""
        
        print("UserDefaults 상태:")
        print("- isLoggedIn: \(isLoggedIn)")
        print("- userId: \(userId)")
        print("- userEmail: \(userEmail)")
        print("- userName: \(userName)")
        print("- accessToken: \(accessToken)")
        print("- refreshToken: \(refreshToken)")
        
        // UserDefaults와 Keychain 간 토큰 동기화
        if accessToken.isEmpty {
            if let userDefaultsToken = userDefaults.string(forKey: "accessToken"), !userDefaultsToken.isEmpty {
                print("Keychain accessToken이 비어있어 UserDefaults 값으로 동기화")
                accessToken = userDefaultsToken
                // Keychain에도 저장
                saveToKeychain(key: "accessToken", value: userDefaultsToken)
            }
        } else {
            // Keychain에 토큰이 있으면 UserDefaults에도 저장
            userDefaults.set(accessToken, forKey: "accessToken")
        }
        
        if refreshToken.isEmpty {
            if let userDefaultsToken = userDefaults.string(forKey: "refreshToken"), !userDefaultsToken.isEmpty {
                print("Keychain refreshToken이 비어있어 UserDefaults 값으로 동기화")
                refreshToken = userDefaultsToken
                // Keychain에도 저장
                saveToKeychain(key: "refreshToken", value: userDefaultsToken)
            }
        } else {
            // Keychain에 토큰이 있으면 UserDefaults에도 저장
            userDefaults.set(refreshToken, forKey: "refreshToken")
        }
        
        userDefaults.synchronize()
        
        // 로그인 상태 확인 및 복원 (조건 강화)
        let hasValidToken = !accessToken.isEmpty || !refreshToken.isEmpty
        let shouldRestoreLogin = isLoggedIn || hasValidToken
        
        if shouldRestoreLogin {
            print("✅ 토큰 존재, 자동 로그인 상태로 시작")
            print("  - isLoggedIn: \(isLoggedIn)")
            print("  - accessToken 존재: \(!accessToken.isEmpty)")
            print("  - refreshToken 존재: \(!refreshToken.isEmpty)")
            
            // expiresAt 파싱
            var expiresAt: Date?
            if let expiresAtString = expiresAtString {
                expiresAt = ISO8601DateFormatter().date(from: expiresAtString)
            }
            
            // UserInfo 객체 생성 (refreshToken 포함)
            let userInfo = UserInfo(
                id: userId,
                email: userEmail,
                name: userName,
                token: accessToken,
                refreshToken: refreshToken.isEmpty ? nil : refreshToken,
                expiresAt: expiresAt
            )
            
            // UserDefaults에 로그인 상태 강제 저장
            userDefaults.set(true, forKey: "isLoggedIn")
            userDefaults.synchronize()
            
            // @Published 프로퍼티 업데이트를 메인 스레드에서 안전하게 처리
            DispatchQueue.main.async { [weak self] in
                self?.userInfo = userInfo
                self?.isLoggedIn = true
                self?.isLoading = false
            }
            
            print("✅ 로그인 상태 복원 완료")
            print("✅ UserInfo 생성됨 - refreshToken: \(userInfo.refreshToken ?? "nil")")
            
            // 토큰 자동 갱신 타이머 설정
            setupTokenRefreshTimer()
        } else {
            print("❌ 로그인 상태 복원 실패 - 토큰이 없거나 만료됨")
            print("  - isLoggedIn: \(isLoggedIn)")
            print("  - accessToken 존재: \(!accessToken.isEmpty)")
            print("  - refreshToken 존재: \(!refreshToken.isEmpty)")
            
            // 로그인 상태 초기화
            DispatchQueue.main.async { [weak self] in
                self?.userInfo = nil
                self?.isLoggedIn = false
                self?.isLoading = false
            }
        }
    }
    
    // MARK: - 토큰 갱신
    func refreshAccessToken() {
        guard let userInfo = userInfo, let refreshToken = userInfo.refreshToken else {
            print("❌ No refresh token available for token refresh")
            return
        }
        
        refreshAccessTokenInternal()
    }
    
    // MARK: - 로그아웃
    func logout() {
        print("[logout] 호출됨 - userId: \(userInfo?.id ?? "nil"), accessToken: \(loadFromKeychain(key: "accessToken") ?? "nil"), refreshToken: \(loadFromKeychain(key: "refreshToken") ?? "nil")")
        print("=== logout called ===")
        
        // 토큰 갱신 타이머 중지
        tokenRefreshTimer?.invalidate()
        tokenRefreshTimer = nil
        
        // UserDefaults에서 로그인 정보 제거
        userDefaults.removeObject(forKey: "isLoggedIn")
        userDefaults.removeObject(forKey: "userId")
        userDefaults.removeObject(forKey: "userEmail")
        userDefaults.removeObject(forKey: "userName")
        userDefaults.removeObject(forKey: "tokenExpiresAt")
        userDefaults.removeObject(forKey: "accessToken")
        userDefaults.removeObject(forKey: "refreshToken")
        // 자동 로그인 관련 설정 제거됨
        
        // Keychain에서 토큰 제거
        deleteFromKeychain(key: "accessToken")
        deleteFromKeychain(key: "refreshToken")
        
        // @Published 프로퍼티 업데이트를 메인 스레드에서 안전하게 처리
        Task { @MainActor in
            self.isLoggedIn = false
            self.userInfo = nil
        }
        
        // 웹뷰에 로그아웃 알림
        NotificationCenter.default.post(
            name: NSNotification.Name("LogoutRequested"),
            object: nil
        )
        
        print("✅ Logout completed")
    }
    
    // MARK: - 로그인 상태 유지 설정
    func setKeepLogin(enabled: Bool) {
        print("=== setKeepLogin called with enabled: \(enabled) ===")
        userDefaults.set(enabled, forKey: "keepLogin")
        userDefaults.synchronize()
        print("Keep login setting saved: \(enabled)")
    }
    
    // MARK: - 인스타그램 방식 로그인 상태 유지 기능
    
    /// 인스타그램 방식 로그인 상태 유지 설정 저장
    func saveKeepLoginSetting(_ keepLogin: Bool) {
        print("=== saveKeepLoginSetting called with keepLogin: \(keepLogin) ===")
        userDefaults.set(keepLogin, forKey: "keepLogin")
        userDefaults.synchronize()
        print("인스타그램 방식 로그인 상태 유지 설정 저장: \(keepLogin)")
    }
    
    /// 인스타그램 방식 로그인 상태 유지 설정 가져오기
    func getKeepLoginSetting() -> Bool {
        let setting = userDefaults.bool(forKey: "keepLogin")
        print("인스타그램 방식 로그인 상태 유지 설정 조회: \(setting)")
        return setting
    }
    
    /// 인스타그램 방식 로그인 상태 유지 설정 변경 시 웹뷰에 알림
    func updateKeepLoginSetting(_ keepLogin: Bool) {
        print("=== updateKeepLoginSetting called with keepLogin: \(keepLogin) ===")
        saveKeepLoginSetting(keepLogin)
        
        // 웹뷰에 설정 변경 알림
        NotificationCenter.default.post(
            name: NSNotification.Name("KeepLoginSettingChanged"),
            object: nil,
            userInfo: ["keepLogin": keepLogin]
        )
        
        print("인스타그램 방식 로그인 상태 유지 설정 변경 완료")
    }
    
    /// 인스타그램 방식 로그인 상태 유지 토큰 저장
    func saveTokensWithKeepLogin(accessToken: String, refreshToken: String? = nil, keepLogin: Bool = false) {
        print("[saveTokensWithKeepLogin] accessToken: \(accessToken), refreshToken: \(refreshToken ?? "nil"), keepLogin: \(keepLogin)")
        print("=== saveTokensWithKeepLogin called ===")
        print("keepLogin: \(keepLogin)")
        
        // 로그인 상태 유지 설정 저장
        saveKeepLoginSetting(keepLogin)
        
        if keepLogin {
            // 로그인 상태 유지: UserDefaults에 저장 (영구 보관)
            userDefaults.set(accessToken, forKey: "accessToken")
            print("[saveTokensWithKeepLogin] saveToKeychain(accessToken)")
            saveToKeychain(key: "accessToken", value: accessToken)
            if let refreshToken = refreshToken {
                userDefaults.set(refreshToken, forKey: "refreshToken")
                print("[saveTokensWithKeepLogin] saveToKeychain(refreshToken)")
                saveToKeychain(key: "refreshToken", value: refreshToken)
            }
            print("UserDefaults에 토큰 저장됨 (로그인 상태 유지)")
        } else {
            // 세션 유지: UserDefaults에 저장하되 앱 종료 시 삭제될 수 있음
            userDefaults.set(accessToken, forKey: "accessToken")
            print("[saveTokensWithKeepLogin] saveToKeychain(accessToken)")
            saveToKeychain(key: "accessToken", value: accessToken)
            if let refreshToken = refreshToken {
                userDefaults.set(refreshToken, forKey: "refreshToken")
                print("[saveTokensWithKeepLogin] saveToKeychain(refreshToken)")
                saveToKeychain(key: "refreshToken", value: refreshToken)
            }
            print("UserDefaults에 토큰 저장됨 (세션 유지)")
        }
        
        // Keychain에도 저장 (보안 강화)
        print("[saveTokensWithKeepLogin] saveToKeychain(accessToken)")
        saveToKeychain(key: "accessToken", value: accessToken)
        if let refreshToken = refreshToken {
            print("[saveTokensWithKeepLogin] saveToKeychain(refreshToken)")
            saveToKeychain(key: "refreshToken", value: refreshToken)
        }
        
        // 로그인 상태 설정
        userDefaults.set(true, forKey: "isLoggedIn")
        userDefaults.synchronize()
        
        print("인스타그램 방식 토큰 저장 완료")
    }
    
    /// 인스타그램 방식 로그인 상태 확인
    func checkInstagramLoginStatus() -> Bool {
        print("=== checkInstagramLoginStatus called ===")
        
        // UserDefaults에서 토큰 확인
        let accessToken = userDefaults.string(forKey: "accessToken")
        let isLoggedIn = userDefaults.bool(forKey: "isLoggedIn")
        
        print("UserDefaults 상태:")
        print("- isLoggedIn: \(isLoggedIn)")
        print("- accessToken: \(accessToken ?? "nil")")
        
        guard let token = accessToken, !token.isEmpty, isLoggedIn else {
            print("토큰이 없거나 로그인 상태가 아님")
            return false
        }
        
        // 토큰 유효성 검사 (JWT 토큰인 경우)
        if token.contains(".") {
            do {
                let parts = token.components(separatedBy: ".")
                if parts.count == 3 {
                    let payload = parts[1]
                    let data = Data(base64Encoded: payload + String(repeating: "=", count: (4 - payload.count % 4) % 4)) ?? Data()
                    let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                    
                    if let exp = json?["exp"] as? TimeInterval {
                        let currentTime = Date().timeIntervalSince1970
                        
                        if exp < currentTime {
                            print("토큰이 만료되어 로그인 상태 유지 불가")
                            logout()
                            return false
                        }
                        
                        print("토큰 유효성 확인 완료")
                    }
                }
            } catch {
                print("토큰 파싱 오류: \(error)")
                // 파싱 오류가 있어도 토큰이 있으면 유효하다고 간주
            }
        }
        
        print("인스타그램 방식 로그인 상태 유지 가능")
        return true
    }
    
    /// 인스타그램 방식 로그인 상태 유지 초기화
    func initializeInstagramLoginStatus() {
        print("=== initializeInstagramLoginStatus called ===")
        
        let isLoggedIn = checkInstagramLoginStatus()
        
        if isLoggedIn {
            // 로그인 상태 복원
            let userId = userDefaults.string(forKey: "userId") ?? ""
            let userEmail = userDefaults.string(forKey: "userEmail") ?? ""
            let userName = userDefaults.string(forKey: "userName") ?? ""
            let accessToken = userDefaults.string(forKey: "accessToken") ?? ""
            let refreshToken = userDefaults.string(forKey: "refreshToken")
            let expiresAt = userDefaults.object(forKey: "tokenExpiresAt") as? Date
            
            let userInfo = UserInfo(
                id: userId,
                email: userEmail,
                name: userName,
                token: accessToken,
                refreshToken: refreshToken,
                expiresAt: expiresAt
            )
            
            Task { @MainActor in
                self.userInfo = userInfo
                self.isLoggedIn = true
            }
            
            // 토큰 갱신 타이머 설정
            setupTokenRefreshTimer()
            
            print("인스타그램 방식 로그인 상태 복원 완료")
        } else {
            print("인스타그램 방식 로그인 상태 없음")
        }
    }
    
    // MARK: - 자동 로그인 설정 (비활성화됨)
    func setAutoLogin(enabled: Bool) {
        print("=== setAutoLogin called with enabled: \(enabled) ===")
        print("Auto login is disabled - setting ignored")
        // 자동 로그인 기능이 비활성화되어 있으므로 설정을 무시
    }
    
    // MARK: - 자동 로그인 설정 (제거됨)
    // 자동 로그인 기능이 완전히 제거되었습니다.
    
    // MARK: - Keychain 관리
    func saveToKeychain(key: String, value: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: key,
            kSecValueData as String: value.data(using: .utf8)!,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock // 영구 저장
        ]
        SecItemDelete(query as CFDictionary)
        let status = SecItemAdd(query as CFDictionary, nil)
        print("[saveToKeychain] key: \(key), value: \(value), status: \(status)")
        
        // 저장 실패 시 로그
        if status != errSecSuccess {
            print("❌ Keychain save failed for key: \(key), status: \(status)")
        }
    }
    
    // MARK: - 동기식 Keychain 저장 (앱 종료 시 사용)
    private func saveToKeychainSync(key: String, value: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: key,
            kSecValueData as String: value.data(using: .utf8)!,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock // 앱 종료 후에도 접근 가능
        ]
        
        // 기존 항목 삭제
        SecItemDelete(query as CFDictionary)
        
        // 새 항목 추가
        let status = SecItemAdd(query as CFDictionary, nil)
        print("[saveToKeychainSync] key: \(key), status: \(status)")
        
        if status != errSecSuccess {
            print("❌ Sync Keychain save failed for key: \(key), status: \(status)")
        } else {
            print("✅ Sync Keychain save successful for key: \(key)")
        }
    }
    
    // MARK: - Keychain 저장 재시도 로직
    func saveToKeychainWithRetry(key: String, value: String, maxRetries: Int = 3) {
        var retryCount = 0
        var success = false
        
        while retryCount < maxRetries && !success {
            let query: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrService as String: keychainService,
                kSecAttrAccount as String: key,
                kSecValueData as String: value.data(using: .utf8)!,
                kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
            ]
            
            // 기존 항목 삭제
            SecItemDelete(query as CFDictionary)
            
            // 새 항목 추가
            let status = SecItemAdd(query as CFDictionary, nil)
            
            if status == errSecSuccess {
                success = true
                print("✅ Keychain save successful for key: \(key) (attempt \(retryCount + 1))")
            } else {
                retryCount += 1
                print("⚠️ Keychain save failed for key: \(key), status: \(status), retry \(retryCount)/\(maxRetries)")
                
                if retryCount < maxRetries {
                    // 잠시 대기 후 재시도
                    Thread.sleep(forTimeInterval: 0.1)
                }
            }
        }
        
        if !success {
            print("❌ Keychain save failed after \(maxRetries) attempts for key: \(key)")
        }
    }
    
    func loadFromKeychain(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        if status == errSecSuccess, let data = dataTypeRef as? Data {
            let value = String(data: data, encoding: .utf8)
            print("[loadFromKeychain] key: \(key), value: \(value ?? "nil")")
            return value
        }
        print("[loadFromKeychain] key: \(key), status: \(status)")
            return nil
    }
    
    private func deleteFromKeychain(key: String) {
        print("[deleteFromKeychain] key: \(key)")
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: key
        ]
        
        SecItemDelete(query as CFDictionary)
    }
    
    // MARK: - 토큰 저장 확인 및 복구
    func verifyTokenStorage() {
        let accessTokenFromDefaults = userDefaults.string(forKey: "accessToken")
        let accessTokenFromKeychain = loadFromKeychain(key: "accessToken")
        let refreshTokenFromDefaults = userDefaults.string(forKey: "refreshToken")
        let refreshTokenFromKeychain = loadFromKeychain(key: "refreshToken")
        let isLoggedIn = userDefaults.bool(forKey: "isLoggedIn")
        
        print("🔍 Token storage verification:")
        print("  - isLoggedIn: \(isLoggedIn)")
        print("  - UserDefaults accessToken: \(accessTokenFromDefaults != nil ? "✅" : "❌")")
        print("  - Keychain accessToken: \(accessTokenFromKeychain != nil ? "✅" : "❌")")
        print("  - UserDefaults refreshToken: \(refreshTokenFromDefaults != nil ? "✅" : "❌")")
        print("  - Keychain refreshToken: \(refreshTokenFromKeychain != nil ? "✅" : "❌")")
        
        // 토큰 불일치 시 복구
        if accessTokenFromDefaults != accessTokenFromKeychain {
            print("⚠️ Access token mismatch detected, restoring from Keychain")
            if let keychainToken = accessTokenFromKeychain {
                userDefaults.set(keychainToken, forKey: "accessToken")
                userDefaults.synchronize()
            } else if let defaultsToken = accessTokenFromDefaults {
                saveToKeychain(key: "accessToken", value: defaultsToken)
            }
        }
        
        if refreshTokenFromDefaults != refreshTokenFromKeychain {
            print("⚠️ Refresh token mismatch detected, restoring from Keychain")
            if let keychainToken = refreshTokenFromKeychain {
                userDefaults.set(keychainToken, forKey: "refreshToken")
                userDefaults.synchronize()
            } else if let defaultsToken = refreshTokenFromDefaults {
                saveToKeychain(key: "refreshToken", value: defaultsToken)
            }
        }
        
        // 로그인 상태 복구 (토큰이 있지만 isLoggedIn이 false인 경우)
        let hasValidToken = (accessTokenFromDefaults != nil && !accessTokenFromDefaults!.isEmpty) || 
                           (accessTokenFromKeychain != nil && !accessTokenFromKeychain!.isEmpty) ||
                           (refreshTokenFromDefaults != nil && !refreshTokenFromDefaults!.isEmpty) ||
                           (refreshTokenFromKeychain != nil && !refreshTokenFromKeychain!.isEmpty)
        
        if hasValidToken && !isLoggedIn {
            print("⚠️ 토큰은 있지만 로그인 상태가 false - 복구 시도")
            userDefaults.set(true, forKey: "isLoggedIn")
            userDefaults.synchronize()
            print("✅ 로그인 상태 복구 완료")
        }
    }
    
    // MARK: - 생체 인증을 통한 로그인 (제거됨)
    // 생체 인증 기능이 완전히 제거되었습니다.
    
    // MARK: - 웹에서 받은 로그인 데이터 처리
    func saveLoginInfo(_ loginData: [String: Any]) {
        print("[saveLoginInfo] called with loginData: \(loginData)")
        
        // 토큰 저장 (재시도 로직 포함)
        if let token = loginData["token"] as? String {
            print("[saveLoginInfo] saveToKeychain(accessToken): \(token)")
            saveToKeychainWithRetry(key: "accessToken", value: token)
            userDefaults.set(token, forKey: "accessToken")
        }
        
        // refreshToken 저장 로직 강화
        var refreshToken: String? = nil
        
        // 1. loginData에서 직접 가져오기
        if let rt = loginData["refreshToken"] as? String {
            refreshToken = rt
            print("[saveLoginInfo] loginData에서 refreshToken 발견: \(rt)")
        }
        
        // 2. loginData에 없으면 빈 문자열이 아닌지 확인
        if refreshToken == nil, let rt = loginData["refreshToken"] as? String, !rt.isEmpty {
            refreshToken = rt
            print("[saveLoginInfo] loginData에서 빈 문자열이 아닌 refreshToken 발견: \(rt)")
        }
        
        // 3. refreshToken이 있으면 저장
        if let rt = refreshToken {
            print("[saveLoginInfo] saveToKeychain(refreshToken): \(rt)")
            saveToKeychainWithRetry(key: "refreshToken", value: rt)
            userDefaults.set(rt, forKey: "refreshToken")
            
            // 저장 후 확인
            let check = loadFromKeychain(key: "refreshToken")
            print("[saveLoginInfo] 저장 후 Keychain에서 확인: \(check ?? "nil")")
        } else {
            print("[saveLoginInfo] refreshToken이 nil이거나 비어있습니다.")
        }
        
        // 사용자 정보 저장
        if let id = loginData["id"] as? String {
            userDefaults.set(id, forKey: "userId")
        }
        if let email = loginData["email"] as? String {
            userDefaults.set(email, forKey: "userEmail")
        }
        if let name = loginData["name"] as? String {
            userDefaults.set(name, forKey: "userName")
        }
        if let expiresAt = loginData["expiresAt"] as? String {
            userDefaults.set(expiresAt, forKey: "tokenExpiresAt")
        }
        if let keepLogin = loginData["keepLogin"] as? Bool {
            userDefaults.set(keepLogin, forKey: "keepLogin")
        }
        
        userDefaults.set(true, forKey: "isLoggedIn")
        
        // UserDefaults 강제 동기화 (앱 종료 시에도 저장 보장)
        userDefaults.synchronize()
        
        // 토큰 저장 확인
        verifyTokenStorage()
        
        print("[saveLoginInfo] 모든 로그인 정보 저장 완료")
    }
    
    // MARK: - 로그인 상태 확인
    func checkLoginStatus(webView: WKWebView?) {
        print("=== checkLoginStatus called ===")
        
        let isLoggedIn = userDefaults.bool(forKey: "isLoggedIn")
        let userId = userDefaults.string(forKey: "userId")
        let userEmail = userDefaults.string(forKey: "userEmail")
        let userName = userDefaults.string(forKey: "userName")
        let accessToken = userDefaults.string(forKey: "accessToken")
        
        print("Current login status:")
        print("- isLoggedIn: \(isLoggedIn)")
        print("- userId: \(userId ?? "nil")")
        print("- userEmail: \(userEmail ?? "nil")")
        print("- userName: \(userName ?? "nil")")
        print("- accessToken: \(accessToken ?? "nil")")
        
        if isLoggedIn, let accessToken = accessToken {
            let userInfo = UserInfo(
                id: userId ?? "",
                email: userEmail ?? "",
                name: userName ?? "",
                token: accessToken,
                refreshToken: userDefaults.string(forKey: "refreshToken"),
                expiresAt: userDefaults.object(forKey: "tokenExpiresAt") as? Date
            )
            
            // UserInfo 업데이트를 메인 스레드에서 안전하게 처리
            Task { @MainActor in
                self.userInfo = userInfo
                self.isLoggedIn = true
            }
            
            // 웹뷰에 로그인 정보 전달
            if let webView = webView {
                sendLoginInfoToWeb(webView: webView)
            }
        } else {
            // 로그아웃 상태를 웹뷰에 전달
            let logoutScript = """
            (function() {
                try {
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
                    
                    // 쿠키 제거
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
                    
                    // 로그아웃 이벤트 발생
                    window.dispatchEvent(new CustomEvent('logoutSuccess'));
                    
                    console.log('Logout completed - all login data removed');
                    
                } catch (error) {
                    console.error('Error during logout:', error);
                }
            })();
            """
            
            webView?.evaluateJavaScript(logoutScript) { result, error in
                if let error = error {
                    print("웹뷰에 로그아웃 정보 전달 실패: \(error)")
                } else {
                    print("✅ 웹뷰에 로그아웃 정보 전달 완료")
                }
            }
        }
    }
    
    // MARK: - WebView 연동 (로그인 정보 전달)
    private var lastLoginInfoSentTime: Date = Date.distantPast
    
    // 웹에서 요청할 때만 로그인 정보 전달 (무한 렌더링 방지)
    func requestLoginInfoFromWeb(webView: WKWebView) {
        print("=== requestLoginInfoFromWeb called ===")
        sendLoginInfoToWeb(webView: webView)
    }
    
    func sendLoginInfoToWeb(webView: WKWebView) {
        // 중복 호출 방지 (1초 내에 다시 호출되면 무시)
        let now = Date()
        if now.timeIntervalSince(lastLoginInfoSentTime) < 1.0 {
            print("=== sendLoginInfoToWeb called too frequently, skipping ===")
            return
        }
        lastLoginInfoSentTime = now
        
        guard let userInfo = self.userInfo else {
            print("No userInfo to send to web")
            return
        }
        
        let accessToken = userInfo.token.replacingOccurrences(of: "'", with: "\\'")
        let userId = userInfo.id.replacingOccurrences(of: "'", with: "\\'")
        let userEmail = userInfo.email.replacingOccurrences(of: "'", with: "\\'")
        let userName = userInfo.name.replacingOccurrences(of: "'", with: "\\'")
        let refreshToken = (userInfo.refreshToken ?? "").replacingOccurrences(of: "'", with: "\\'")
        let expiresAt = userInfo.expiresAt?.timeIntervalSince1970 ?? 0
        let keepLogin = getKeepLoginSetting()
        
        print("=== sendLoginInfoToWeb called ===")
        print("keepLogin setting: \(keepLogin)")
        print("userInfo.refreshToken: \(userInfo.refreshToken ?? "nil")")
        print("processed refreshToken: \(refreshToken)")
        
        // 더 강력한 로그인 정보 전달 스크립트
        let js = """
        (function() {
            try {
                console.log('=== iOS에서 로그인 정보 수신 시작 ===');
                
                // 이미 로그인된 상태라면 중복 처리 방지
                if (localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('accessToken')) {
                    console.log('이미 로그인된 상태 - 중복 처리 방지');
                    return;
                }
                
                // localStorage에 저장
                localStorage.setItem('accessToken', '\(accessToken)');
                localStorage.setItem('userId', '\(userId)');
                localStorage.setItem('userEmail', '\(userEmail)');
                localStorage.setItem('userName', '\(userName)');
                localStorage.setItem('refreshToken', '\(refreshToken)');
                localStorage.setItem('tokenExpiresAt', '\(expiresAt)');
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('keepLoginSetting', '\(keepLogin)');
                
                // sessionStorage에도 저장 (세션 유지)
                sessionStorage.setItem('accessToken', '\(accessToken)');
                sessionStorage.setItem('userId', '\(userId)');
                sessionStorage.setItem('userEmail', '\(userEmail)');
                sessionStorage.setItem('userName', '\(userName)');
                sessionStorage.setItem('refreshToken', '\(refreshToken)');
                sessionStorage.setItem('tokenExpiresAt', '\(expiresAt)');
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('keepLoginSetting', '\(keepLogin)');
                
                // 쿠키에도 저장 (서버에서 인식)
                document.cookie = 'accessToken=\(accessToken); path=/; max-age=86400';
                document.cookie = 'userId=\(userId); path=/; max-age=86400';
                document.cookie = 'userEmail=\(userEmail); path=/; max-age=86400';
                document.cookie = 'isLoggedIn=true; path=/; max-age=86400';
                document.cookie = 'keepLoginSetting=\(keepLogin); path=/; max-age=86400';
                
                // 전역 변수로도 설정
                window.accessToken = '\(accessToken)';
                window.userId = '\(userId)';
                window.userEmail = '\(userEmail)';
                window.userName = '\(userName)';
                window.isLoggedIn = true;
                window.keepLogin = \(keepLogin);
                
                // 저장 확인
                console.log('=== 저장된 로그인 정보 확인 ===');
                console.log('localStorage accessToken:', localStorage.getItem('accessToken'));
                console.log('localStorage refreshToken:', localStorage.getItem('refreshToken'));
                console.log('localStorage isLoggedIn:', localStorage.getItem('isLoggedIn'));
                console.log('sessionStorage accessToken:', sessionStorage.getItem('accessToken'));
                console.log('sessionStorage refreshToken:', sessionStorage.getItem('refreshToken'));
                console.log('sessionStorage isLoggedIn:', sessionStorage.getItem('isLoggedIn'));
                
                // 로그인 이벤트 발생
                window.dispatchEvent(new CustomEvent('loginSuccess', {
                    detail: {
                        isLoggedIn: true,
                        keepLogin: \(keepLogin),
                        userInfo: {
                            id: '\(userId)',
                            email: '\(userEmail)',
                            name: '\(userName)',
                            token: '\(accessToken)',
                            refreshToken: '\(refreshToken)',
                            expiresAt: '\(expiresAt)'
                        }
                    }
                }));
                
                console.log('✅ iOS에서 전달받은 로그인 정보 저장 완료');
                console.log('Keep login setting: \(keepLogin)');
                console.log('RefreshToken: \(refreshToken)');
                
                // 페이지 새로고침 없이 로그인 상태 업데이트
                if (window.location.pathname === '/login' || window.location.pathname.includes('/login')) {
                    console.log('로그인 페이지에서 홈으로 리다이렉트');
                    // 무한 리다이렉트 방지
                    if (!window.redirectingToHome && !window.loginProcessed) {
                        window.redirectingToHome = true;
                        window.loginProcessed = true;
                        setTimeout(() => {
                            console.log('홈 페이지로 리다이렉트 실행');
                            window.location.href = '/';
                        }, 500);
                    } else {
                        console.log('이미 리다이렉트 처리 중이거나 로그인 처리됨');
                    }
                }
                
            } catch (error) {
                console.error('❌ iOS 로그인 정보 저장 중 오류:', error);
            }
        })();
        """
        
        webView.evaluateJavaScript(js) { result, error in
            if let error = error {
                print("Error sending login info to web: \(error)")
            } else {
                print("✅ Login info sent to web successfully")
                print("✅ Keep login setting sent: \(keepLogin)")
                print("✅ RefreshToken sent: \(refreshToken)")
            }
        }
    }
    
    // MARK: - 웹뷰에서 refreshToken 가져오기
    func syncRefreshTokenFromWebView(webView: WKWebView) {
        print("=== syncRefreshTokenFromWebView called ===")
        
        let script = """
        (function() {
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                console.log('WebView localStorage refreshToken:', refreshToken);
                return refreshToken || null;
            } catch (error) {
                console.error('Error getting refreshToken from localStorage:', error);
                return null;
            }
        })();
        """
        
        webView.evaluateJavaScript(script) { [weak self] result, error in
            if let error = error {
                print("Error getting refreshToken from webView: \(error)")
                return
            }
            
            if let refreshToken = result as? String, !refreshToken.isEmpty {
                print("✅ WebView에서 refreshToken 발견: \(refreshToken)")
                
                // iOS 앱에 저장
                self?.userDefaults.set(refreshToken, forKey: "refreshToken")
                self?.saveToKeychainWithRetry(key: "refreshToken", value: refreshToken)
                
                // 저장 확인
                let check = self?.loadFromKeychain(key: "refreshToken")
                print("✅ WebView에서 가져온 refreshToken 저장 완료: \(check ?? "nil")")
                
                // UserInfo 업데이트
                if let userInfo = self?.userInfo {
                    let updatedUserInfo = UserInfo(
                        id: userInfo.id,
                        email: userInfo.email,
                        name: userInfo.name,
                        token: userInfo.token,
                        refreshToken: refreshToken,
                        expiresAt: userInfo.expiresAt
                    )
                    self?.userInfo = updatedUserInfo
                    print("✅ UserInfo에 refreshToken 업데이트 완료")
                }
            } else {
                print("❌ WebView에서 refreshToken을 찾을 수 없습니다.")
            }
        }
    }
    
    // MARK: - 토큰 상태 확인 및 동기화
    func checkTokenStatus() {
        print("=== checkTokenStatus called ===")
        
        let accessToken = userDefaults.string(forKey: "accessToken") ?? ""
        let refreshToken = userDefaults.string(forKey: "refreshToken") ?? ""
        let expiresAt = userDefaults.object(forKey: "tokenExpiresAt") as? Date
        
        print("Current token status:")
        print("- accessToken exists: \(!accessToken.isEmpty)")
        print("- refreshToken exists: \(!refreshToken.isEmpty)")
        print("- expiresAt: \(expiresAt?.description ?? "nil")")
        
        if let expiresAt = expiresAt {
            let timeUntilExpiry = expiresAt.timeIntervalSinceNow
            print("- timeUntilExpiry: \(timeUntilExpiry) seconds")
            
            if timeUntilExpiry < 0 {
                print("❌ Token already expired")
                if !refreshToken.isEmpty {
                    print("🔄 Attempting token refresh...")
                    refreshAccessToken()
                } else {
                    print("❌ No refresh token available, logging out")
                    logout()
                }
            } else if timeUntilExpiry < 300 { // 5분 이내 만료
                print("⚠️ Token expires soon, refreshing...")
                refreshAccessToken()
            } else {
                print("✅ Token is still valid")
            }
        } else {
            print("⚠️ No expiresAt found")
            if !refreshToken.isEmpty {
                print("🔄 Attempting token refresh...")
                refreshAccessToken()
            }
        }
    }
    
    // MARK: - 웹뷰와 토큰 동기화 강화
    func syncTokenWithWebView(webView: WKWebView) {
        print("=== syncTokenWithWebView called ===")
        
        let accessToken = userDefaults.string(forKey: "accessToken") ?? ""
        let refreshToken = userDefaults.string(forKey: "refreshToken") ?? ""
        
        if !accessToken.isEmpty {
            let script = """
            if (typeof window !== 'undefined') {
                // 웹뷰에 토큰 동기화
                if (window.localStorage) {
                    window.localStorage.setItem('accessToken', '\(accessToken)');
                    window.sessionStorage.setItem('accessToken', '\(accessToken)');
                }
                if (window.document && window.document.cookie) {
                    document.cookie = 'accessToken=\(accessToken); path=/';
                }
                if ('\(refreshToken)' !== '') {
                    if (window.localStorage) {
                        window.localStorage.setItem('refreshToken', '\(refreshToken)');
                        window.sessionStorage.setItem('refreshToken', '\(refreshToken)');
                    }
                    if (window.document && window.document.cookie) {
                        document.cookie = 'refreshToken=\(refreshToken); path=/';
                    }
                }
                console.log('Token synchronized from native app');
            }
            """
            
            webView.evaluateJavaScript(script) { result, error in
                if let error = error {
                    print("❌ Failed to sync token with webview: \(error)")
                } else {
                    print("✅ Token synchronized with webview")
                }
            }
        }
    }
}

// MARK: - Date Extension
extension Date {
    func ISO8601String() -> String {
        let formatter = ISO8601DateFormatter()
        return formatter.string(from: self)
    }
}



// MARK: - WebView 연동 (카드 및 로그인 정보)
extension LoginManager {
    // 로그인 정보 JSON 반환 (웹뷰로 전달)
    func getLoginInfo() -> String {
        guard let userInfo = self.userInfo else {
            return "{\"isLoggedIn\": false}"
        }
        let expiresAt = userInfo.expiresAt?.ISO8601String() ?? ""
        let refreshToken = userInfo.refreshToken ?? ""
        let json = """
        {
            "isLoggedIn": true,
            "userInfo": {
                "id": "\(userInfo.id)",
                "email": "\(userInfo.email)",
                "name": "\(userInfo.name)",
                "token": "\(userInfo.token)",
                "refreshToken": "\(refreshToken)",
                "expiresAt": "\(expiresAt)"
            }
        }
        """
        return json
    }

    // 카드 추가 요청 처리 (예시: 1초 후 성공 콜백)
    func handleCardAddRequest(webView: WKWebView, completion: @escaping (Bool, String?) -> Void) {
        // 실제 카드 추가 로직 대신 1초 후 성공 처리
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            completion(true, nil) // 성공
        }
    }

    // 카드 추가 완료 알림 (웹뷰로 JS 이벤트 전달)
    func notifyCardAddComplete(webView: WKWebView, success: Bool, errorMessage: String? = nil) {
        let detail: String
        if success {
            detail = "{success: true}"
        } else {
            let error = errorMessage?.replacingOccurrences(of: "'", with: " ") ?? "Unknown error"
            detail = "{success: false, errorMessage: '\(error)'}"
        }
        let script = "window.dispatchEvent(new CustomEvent('cardAddComplete', { detail: \(detail) }));"
        webView.evaluateJavaScript(script) { result, error in
            if let error = error {
                print("Error notifying card add complete: \(error)")
            } else {
                print("Card add complete notified to webView")
            }
        }
    }
} 
