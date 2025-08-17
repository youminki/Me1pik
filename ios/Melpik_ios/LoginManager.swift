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
        
        // 기본 로그인 상태만 동기적으로 로드
        loadBasicLoginState()
        
        // 무거운 작업은 비동기로 처리
        Task { @MainActor in
            await loadFullLoginState()
            await initializeInstagramLoginStatus()
            isInitializing = false
            print("=== LoginManager 초기화 완료 ===")
        }
    }
    
    deinit {
        print("LoginManager deinit")
        tokenRefreshTimer?.invalidate()
        tokenRefreshTimer = nil
        
        // 모든 앱 생명주기 관찰자 제거
        NotificationCenter.default.removeObserver(self)
    }
    
    // MARK: - 앱 생명주기 관찰자 설정 (개선된 버전)
    private func setupAppLifecycleObserver() {
        print("🔄 === 앱 생명주기 관찰자 설정 ===")
        
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
        
        // 관찰자 저장 (deinit에서 제거하기 위해)
        appLifecycleObserver = willResignObserver
        
        print("✅ 앱 생명주기 관찰자 설정 완료")
        print("  - willResignActive: ✅")
        print("  - didEnterBackground: ✅")
        print("  - willTerminate: ✅")
        print("  - didBecomeActive: ✅")
    }
    
    // MARK: - 앱이 비활성화될 때 처리 (개선된 버전)
    private func handleAppWillResignActive() {
        print("🔄 === 앱이 비활성화됨 - 토큰 저장 보장 ===")
        
        // 1. 토큰 저장 안정성 확인
        let isValid = validateTokenStorage()
        
        if isValid {
            // 2. 토큰 저장 강화
            ensureTokenPersistence()
            
            // 3. UserDefaults 강제 동기화
            userDefaults.synchronize()
            
            // 4. 추가 안전장치: 토큰을 다시 한 번 저장
            if let userInfo = userInfo {
                saveToKeychainSync(key: "accessToken", value: userInfo.token)
                if let refreshToken = userInfo.refreshToken {
                    saveToKeychainSync(key: "refreshToken", value: refreshToken)
                }
                print("✅ 토큰 재저장 완료")
            }
        } else {
            print("⚠️ 토큰 저장 안정성 문제 - 자동 복구 시도")
            autoRecoverTokens()
        }
        
        print("🔄 === 앱 비활성화 처리 완료 ===")
    }
    
    // MARK: - 앱이 백그라운드로 갈 때 처리 (개선된 버전)
    private func handleAppDidEnterBackground() {
        print("🔄 === 앱이 백그라운드로 이동 - 긴급 토큰 저장 ===")
        
        // 1. 백그라운드 작업 시작
        var backgroundTaskID: UIBackgroundTaskIdentifier = .invalid
        backgroundTaskID = UIApplication.shared.beginBackgroundTask(withName: "TokenPersistence") {
            UIApplication.shared.endBackgroundTask(backgroundTaskID)
            backgroundTaskID = .invalid
        }
        
        // 2. 토큰 저장 안정성 확인 및 복구
        let isValid = validateTokenStorage()
        
        if !isValid {
            print("⚠️ 토큰 저장 문제 감지 - 복구 시도")
            autoRecoverTokens()
        }
        
        // 3. 토큰 저장 강화
        ensureTokenPersistence()
        
        // 4. 토큰 저장 완료 후 백그라운드 작업 종료
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 2_000_000_000) // 2초 대기
            if backgroundTaskID != .invalid {
                UIApplication.shared.endBackgroundTask(backgroundTaskID)
                backgroundTaskID = .invalid
            }
        }
        
        print("🔄 === 백그라운드 처리 완료 ===")
    }
    
    // MARK: - 앱이 종료될 때 처리 (개선된 버전)
    private func handleAppWillTerminate() {
        print("🔄 === 앱이 종료됨 - 최종 토큰 저장 ===")
        
        // 1. 긴급 토큰 저장
        ensureTokenPersistence()
        
        // 2. 토큰 저장 안정성 확인
        let isValid = validateTokenStorage()
        
        if !isValid {
            print("⚠️ 토큰 저장 문제 감지 - 복구 시도")
            autoRecoverTokens()
        }
        
        // 3. UserDefaults 강제 동기화
        userDefaults.synchronize()
        
        // 4. 추가 안전장치: 토큰을 다시 한 번 저장
        if let userInfo = userInfo {
            saveToKeychainSync(key: "accessToken", value: userInfo.token)
            if let refreshToken = userInfo.refreshToken {
                saveToKeychainSync(key: "refreshToken", value: refreshToken)
            }
        }
        
        print("🔄 === 앱 종료 처리 완료 ===")
    }
    
    // MARK: - 앱이 활성화될 때 처리 (개선된 버전)
    private func handleAppDidBecomeActive() {
        print("🔄 === 앱이 활성화됨 - 토큰 상태 확인 ===")
        
        // 1. 토큰 저장 확인 및 복구
        verifyTokenStorage()
        
        // 2. 지속 로그인 상태 복원 시도
        restorePersistentLogin()
        
        // 3. 토큰 상태 확인
        let accessToken = userDefaults.string(forKey: "accessToken")
        let refreshToken = userDefaults.string(forKey: "refreshToken")
        let isLoggedIn = userDefaults.bool(forKey: "isLoggedIn")
        let persistentLogin = userDefaults.bool(forKey: "persistentLogin")
        
        // 4. 지속 로그인이 활성화된 경우 자동 갱신 시도
        guard (isLoggedIn || persistentLogin) && (accessToken != nil || refreshToken != nil) else {
            print("ℹ️ 지속 로그인 상태가 아니거나 토큰이 없음 - 갱신 시도 안함")
            return
        }
        
        // 5. 만료 시간 확인
        let expiresAt = userDefaults.object(forKey: "tokenExpiresAt") as? Date
        
        if let expiresAt = expiresAt {
            let currentTime = Date()
            let timeUntilExpiry = expiresAt.timeIntervalSince(currentTime)
            
            print("⏰ 토큰 만료 시간 확인:")
            print("  - 만료 시간: \(expiresAt)")
            print("  - 현재 시간: \(currentTime)")
            print("  - 남은 시간: \(timeUntilExpiry)초")
            
            if timeUntilExpiry < 0 {
                print("⚠️ 토큰이 만료됨 - 갱신 시도")
                refreshAccessToken()
            } else if timeUntilExpiry < 300 { // 5분 이내 만료
                print("⚠️ 토큰이 곧 만료됨 - 갱신 시도")
                refreshAccessToken()
            } else {
                print("✅ 토큰이 유효함 - 갱신 불필요")
            }
        } else {
            print("⚠️ 만료 시간 정보가 없음 - 갱신 시도")
            refreshAccessToken()
        }
        
        print("🔄 === 앱 활성화 처리 완료 ===")
    }
    
    // MARK: - 지속 로그인 상태 복원
    private func restorePersistentLogin() {
        print("🔄 === 지속 로그인 상태 복원 시작 ===")
        
        let persistentLogin = userDefaults.bool(forKey: "persistentLogin")
        let autoLogin = userDefaults.bool(forKey: "autoLogin")
        
        guard persistentLogin || autoLogin else {
            print("ℹ️ 지속 로그인 설정이 비활성화됨")
            return
        }
        
        // Keychain에서 토큰 복원 시도
        let keychainAccessToken = loadFromKeychain(key: "accessToken")
        let keychainRefreshToken = loadFromKeychain(key: "refreshToken")
        
        if let keychainToken = keychainAccessToken, !keychainToken.isEmpty {
            // UserDefaults에 동기화
            userDefaults.set(keychainToken, forKey: "accessToken")
            print("✅ Keychain에서 accessToken 복원됨")
        }
        
        if let keychainRefresh = keychainRefreshToken, !keychainRefresh.isEmpty {
            // UserDefaults에 동기화
            userDefaults.set(keychainRefresh, forKey: "refreshToken")
            print("✅ Keychain에서 refreshToken 복원됨")
        }
        
        // 로그인 상태 강제 설정
        userDefaults.set(true, forKey: "isLoggedIn")
        userDefaults.set(true, forKey: "persistentLogin")
        userDefaults.set(true, forKey: "autoLogin")
        userDefaults.synchronize()
        
        print("✅ 지속 로그인 상태 복원 완료")
    }
    
    // MARK: - 토큰 저장 보장 시스템
    func ensureTokenPersistence() {
        print("🔐 === 토큰 저장 보장 시작 ===")
        
        guard let userInfo = userInfo else {
            print("⚠️ userInfo가 없어 토큰 저장 보장 불가")
            return
        }
        
        // 1. UserDefaults에 토큰 저장
        userDefaults.set(userInfo.token, forKey: "accessToken")
        if let refreshToken = userInfo.refreshToken {
            userDefaults.set(refreshToken, forKey: "refreshToken")
        }
        
        // 2. Keychain에 토큰 저장 (동기 방식)
        saveToKeychainSync(key: "accessToken", value: userInfo.token)
        if let refreshToken = userInfo.refreshToken {
            saveToKeychainSync(key: "refreshToken", value: refreshToken)
        }
        
        // 3. 만료 시간 저장
        if let expiresAt = userInfo.expiresAt {
            userDefaults.set(expiresAt, forKey: "tokenExpiresAt")
        }
        
        // 4. 로그인 상태 강제 저장
        userDefaults.set(true, forKey: "isLoggedIn")
        
        // 5. UserDefaults 강제 동기화
        userDefaults.synchronize()
        
        // 6. 지속 로그인 설정 활성화
        userDefaults.set(true, forKey: "persistentLogin")
        userDefaults.set(true, forKey: "autoLogin")
        
        // 7. 저장 확인
        let accessTokenSaved = loadFromKeychain(key: "accessToken") == userInfo.token
        let refreshTokenSaved = userInfo.refreshToken == nil || loadFromKeychain(key: "refreshToken") == userInfo.refreshToken
        
        print("📊 토큰 저장 보장 결과:")
        print("  - accessToken 저장: \(accessTokenSaved ? "✅" : "❌")")
        print("  - refreshToken 저장: \(refreshTokenSaved ? "✅" : "❌")")
        print("  - 로그인 상태 저장: ✅")
        
        if !accessTokenSaved || !refreshTokenSaved {
            print("⚠️ 토큰 저장 실패 - 재시도")
            saveToKeychainWithRetry(key: "accessToken", value: userInfo.token, maxRetries: 5)
            if let refreshToken = userInfo.refreshToken {
                saveToKeychainWithRetry(key: "refreshToken", value: refreshToken, maxRetries: 5)
            }
        }
        
        print("🔐 === 토큰 저장 보장 완료 ===")
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
    

    
    private func handleTokenRefreshFailure() {
        print("❌ Token refresh failed, checking remaining tokens...")
        
        // 남은 토큰 확인
        let remainingRefreshToken = userDefaults.string(forKey: "refreshToken")
        let remainingAccessToken = userDefaults.string(forKey: "accessToken")
        
        print("📊 토큰 갱신 실패 후 상태:")
        print("  - accessToken 존재: \(remainingAccessToken != nil && !remainingAccessToken!.isEmpty)")
        print("  - refreshToken 존재: \(remainingRefreshToken != nil && !remainingRefreshToken!.isEmpty)")
        
        if remainingRefreshToken == nil || remainingRefreshToken?.isEmpty == true {
            print("❌ No refresh token available, logging out")
            logout()
        } else {
            print("⚠️ Refresh token exists but refresh failed, keeping current session")
            print("ℹ️ 사용자가 수동으로 다시 로그인해야 할 수 있습니다.")
            
            // 토큰은 유지하되 사용자에게 알림
            NotificationCenter.default.post(
                name: NSNotification.Name("TokenRefreshFailed"),
                object: nil
            )
            
            // 웹뷰에도 토큰 갱신 실패 알림
            NotificationCenter.default.post(
                name: NSNotification.Name("TokenRefreshFailed"),
                object: nil,
                userInfo: ["message": "토큰 갱신에 실패했습니다. 다시 로그인해주세요."]
            )
        }
    }
    
    // MARK: - 로그인 상태 저장 (개선된 버전)
    @MainActor
    func saveLoginState(userInfo: UserInfo) {
        guard !isInitializing else { return }
        print("🔐 === saveLoginState 호출됨 ===")
        print("  - userId: \(userInfo.id)")
        print("  - email: \(userInfo.email)")
        print("  - accessToken: \(userInfo.token.isEmpty ? "❌ 비어있음" : "✅ 존재")")
        print("  - refreshToken: \(userInfo.refreshToken?.isEmpty == false ? "✅ 존재" : "❌ 없음")")
        
        // 1. UserDefaults에 기본 정보 저장
        userDefaults.set(true, forKey: "isLoggedIn")
        userDefaults.set(userInfo.id, forKey: "userId")
        userDefaults.set(userInfo.email, forKey: "userEmail")
        userDefaults.set(userInfo.name, forKey: "userName")
        userDefaults.set(userInfo.token, forKey: "accessToken")
        
        // 2. Keychain에 토큰 저장 (동기 방식으로 즉시 저장)
        print("🔐 Keychain에 accessToken 저장 중...")
        saveToKeychainSync(key: "accessToken", value: userInfo.token)
        
        // 3. refreshToken 저장 로직 강화
        if let refreshToken = userInfo.refreshToken, !refreshToken.isEmpty {
            print("🔐 Keychain에 refreshToken 저장 중...")
            userDefaults.set(refreshToken, forKey: "refreshToken")
            saveToKeychainSync(key: "refreshToken", value: refreshToken)
            
            // 저장 후 확인
            let savedRefreshToken = loadFromKeychain(key: "refreshToken")
            if savedRefreshToken == refreshToken {
                print("✅ refreshToken 저장 성공")
            } else {
                print("❌ refreshToken 저장 실패 - 재시도")
                saveToKeychainWithRetry(key: "refreshToken", value: refreshToken, maxRetries: 5)
            }
        } else {
            print("⚠️ refreshToken이 없거나 비어있음")
        }
        
        // 4. 만료 시간 저장
        if let expiresAt = userInfo.expiresAt {
            userDefaults.set(expiresAt, forKey: "tokenExpiresAt")
            print("⏰ 토큰 만료 시간 저장: \(expiresAt)")
        }
        
        // 5. UserDefaults 강제 동기화
        userDefaults.synchronize()
        
        // 6. 지속 로그인 설정 활성화
        userDefaults.set(true, forKey: "persistentLogin")
        userDefaults.set(true, forKey: "autoLogin")
        
        // 7. @Published 프로퍼티 업데이트
        Task { @MainActor in
            self.userInfo = userInfo
            self.isLoggedIn = true
            self.isLoading = false
        }
        
        // 8. 토큰 자동 갱신 타이머 설정
        setupTokenRefreshTimer()
        
        // 9. 토큰 저장 확인 및 복구
        verifyTokenStorage()
        
        // 10. 최종 상태 출력
        print("📊 === saveLoginState 완료 ===")
        print("  - isLoggedIn: \(isLoggedIn)")
        print("  - userId: \(userDefaults.string(forKey: "userId") ?? "nil")")
        print("  - userEmail: \(userDefaults.string(forKey: "userEmail") ?? "nil")")
        print("  - accessToken: \(loadFromKeychain(key: "accessToken") != nil ? "✅ 저장됨" : "❌ 저장실패")")
        print("  - refreshToken: \(loadFromKeychain(key: "refreshToken") != nil ? "✅ 저장됨" : "❌ 저장실패")")
    }
    
    // MARK: - 기본 로그인 상태 로드 (초기화용)
    private func loadBasicLoginState() {
        print("🔄 === loadBasicLoginState 호출됨 ===")
        
        // UserDefaults에서 기본 정보만 로드
        let isLoggedIn = userDefaults.bool(forKey: "isLoggedIn")
        let userId = userDefaults.string(forKey: "userId") ?? ""
        let userEmail = userDefaults.string(forKey: "userEmail") ?? ""
        let userName = userDefaults.string(forKey: "userName") ?? ""
        
        // 기본 상태만 설정
        if isLoggedIn && !userId.isEmpty {
            let userInfo = UserInfo(
                id: userId,
                email: userEmail,
                name: userName,
                token: "",
                refreshToken: nil,
                expiresAt: nil
            )
            self.userInfo = userInfo
            self.isLoggedIn = true
        }
        
        self.isLoading = false
        print("✅ 기본 로그인 상태 로드 완료")
    }
    
    // MARK: - 전체 로그인 상태 로드 (비동기)
    private func loadFullLoginState() async {
        print("🔄 === loadFullLoginState 호출됨 ===")
        
        // 1. UserDefaults에서 기본 정보 로드
        let isLoggedIn = userDefaults.bool(forKey: "isLoggedIn")
        let userId = userDefaults.string(forKey: "userId") ?? ""
        let userEmail = userDefaults.string(forKey: "userEmail") ?? ""
        let userName = userDefaults.string(forKey: "userName") ?? ""
        let expiresAtString = userDefaults.string(forKey: "tokenExpiresAt")
        
        // 2. Keychain에서 토큰 로드
        var accessToken = loadFromKeychain(key: "accessToken") ?? ""
        var refreshToken = loadFromKeychain(key: "refreshToken") ?? ""
        
        print("📱 UserDefaults 상태:")
        print("  - isLoggedIn: \(isLoggedIn)")
        print("  - userId: \(userId)")
        print("  - userEmail: \(userEmail)")
        print("  - userName: \(userName)")
        print("  - accessToken: \(accessToken.isEmpty ? "❌ 없음" : "✅ 존재")")
        print("  - refreshToken: \(refreshToken.isEmpty ? "❌ 없음" : "✅ 존재")")
        
        // 3. UserDefaults와 Keychain 간 토큰 동기화 강화
        if accessToken.isEmpty {
            if let userDefaultsToken = userDefaults.string(forKey: "accessToken"), !userDefaultsToken.isEmpty {
                print("🔄 Keychain accessToken이 비어있어 UserDefaults 값으로 동기화")
                accessToken = userDefaultsToken
                saveToKeychainSync(key: "accessToken", value: userDefaultsToken)
            }
        } else {
            // Keychain에 토큰이 있으면 UserDefaults에도 저장
            userDefaults.set(accessToken, forKey: "accessToken")
        }
        
        if refreshToken.isEmpty {
            if let userDefaultsToken = userDefaults.string(forKey: "refreshToken"), !userDefaultsToken.isEmpty {
                print("🔄 Keychain refreshToken이 비어있어 UserDefaults 값으로 동기화")
                refreshToken = userDefaultsToken
                saveToKeychainSync(key: "refreshToken", value: userDefaultsToken)
            }
        } else {
            // Keychain에 토큰이 있으면 UserDefaults에도 저장
            userDefaults.set(refreshToken, forKey: "refreshToken")
        }
        
        userDefaults.synchronize()
        
        // 4. 로그인 상태 확인 및 복원 (조건 강화)
        let hasValidToken = !accessToken.isEmpty || !refreshToken.isEmpty
        let shouldRestoreLogin = isLoggedIn || hasValidToken
        
        if shouldRestoreLogin {
            print("✅ 토큰 존재, 자동 로그인 상태로 시작")
            print("  - isLoggedIn: \(isLoggedIn)")
            print("  - accessToken 존재: \(!accessToken.isEmpty)")
            print("  - refreshToken 존재: \(!refreshToken.isEmpty)")
            
            // 5. expiresAt 파싱
            var expiresAt: Date?
            if let expiresAtString = expiresAtString {
                expiresAt = ISO8601DateFormatter().date(from: expiresAtString)
            }
            
            // 6. UserInfo 객체 생성
            let userInfo = UserInfo(
                id: userId,
                email: userEmail,
                name: userName,
                token: accessToken,
                refreshToken: refreshToken.isEmpty ? nil : refreshToken,
                expiresAt: expiresAt
            )
            
            // 7. UserDefaults에 로그인 상태 강제 저장
            userDefaults.set(true, forKey: "isLoggedIn")
            userDefaults.synchronize()
            
            // 8. @Published 프로퍼티 업데이트
            self.userInfo = userInfo
            self.isLoggedIn = true
            self.isLoading = false
            
            print("✅ 로그인 상태 복원 완료")
            print("✅ UserInfo 생성됨 - refreshToken: \(userInfo.refreshToken ?? "nil")")
            
            // 9. 토큰 자동 갱신 타이머 설정
            setupTokenRefreshTimer()
        } else {
            print("❌ 로그인 상태 복원 실패 - 토큰이 없거나 만료됨")
            print("  - isLoggedIn: \(isLoggedIn)")
            print("  - accessToken 존재: \(!accessToken.isEmpty)")
            print("  - refreshToken 존재: \(!refreshToken.isEmpty)")
            
            // 로그아웃 상태로 설정
            self.isLoggedIn = false
            self.userInfo = nil
            self.isLoading = false
            
            // UserDefaults 정리
            userDefaults.set(false, forKey: "isLoggedIn")
            userDefaults.synchronize()
        }
    }
    
    // MARK: - 로그인 상태 로드 (기존 메서드 - 호환성 유지)
    func loadLoginState() {
        print("🔄 === loadLoginState 호출됨 ===")
        
        // 1. UserDefaults에서 기본 정보 로드
        let isLoggedIn = userDefaults.bool(forKey: "isLoggedIn")
        let userId = userDefaults.string(forKey: "userId") ?? ""
        let userEmail = userDefaults.string(forKey: "userEmail") ?? ""
        let userName = userDefaults.string(forKey: "userName") ?? ""
        let expiresAtString = userDefaults.string(forKey: "tokenExpiresAt")
        
        // 2. Keychain에서 토큰 로드
        var accessToken = loadFromKeychain(key: "accessToken") ?? ""
        var refreshToken = loadFromKeychain(key: "refreshToken") ?? ""
        
        print("📱 UserDefaults 상태:")
        print("  - isLoggedIn: \(isLoggedIn)")
        print("  - userId: \(userId)")
        print("  - userEmail: \(userEmail)")
        print("  - userName: \(userName)")
        print("  - accessToken: \(accessToken.isEmpty ? "❌ 없음" : "✅ 존재")")
        print("  - refreshToken: \(refreshToken.isEmpty ? "❌ 없음" : "✅ 존재")")
        
        // 3. UserDefaults와 Keychain 간 토큰 동기화 강화
        if accessToken.isEmpty {
            if let userDefaultsToken = userDefaults.string(forKey: "accessToken"), !userDefaultsToken.isEmpty {
                print("🔄 Keychain accessToken이 비어있어 UserDefaults 값으로 동기화")
                accessToken = userDefaultsToken
                saveToKeychainSync(key: "accessToken", value: userDefaultsToken)
            }
        } else {
            // Keychain에 토큰이 있으면 UserDefaults에도 저장
            userDefaults.set(accessToken, forKey: "accessToken")
        }
        
        if refreshToken.isEmpty {
            if let userDefaultsToken = userDefaults.string(forKey: "refreshToken"), !userDefaultsToken.isEmpty {
                print("🔄 Keychain refreshToken이 비어있어 UserDefaults 값으로 동기화")
                refreshToken = userDefaultsToken
                saveToKeychainSync(key: "refreshToken", value: userDefaultsToken)
            }
        } else {
            // Keychain에 토큰이 있으면 UserDefaults에도 저장
            userDefaults.set(refreshToken, forKey: "refreshToken")
        }
        
        userDefaults.synchronize()
        
        // 4. 로그인 상태 확인 및 복원 (조건 강화)
        let hasValidToken = !accessToken.isEmpty || !refreshToken.isEmpty
        let shouldRestoreLogin = isLoggedIn || hasValidToken
        
        if shouldRestoreLogin {
            print("✅ 토큰 존재, 자동 로그인 상태로 시작")
            print("  - isLoggedIn: \(isLoggedIn)")
            print("  - accessToken 존재: \(!accessToken.isEmpty)")
            print("  - refreshToken 존재: \(!refreshToken.isEmpty)")
            
            // 5. expiresAt 파싱
            var expiresAt: Date?
            if let expiresAtString = expiresAtString {
                expiresAt = ISO8601DateFormatter().date(from: expiresAtString)
            }
            
            // 6. UserInfo 객체 생성
            let userInfo = UserInfo(
                id: userId,
                email: userEmail,
                name: userName,
                token: accessToken,
                refreshToken: refreshToken.isEmpty ? nil : refreshToken,
                expiresAt: expiresAt
            )
            
            // 7. UserDefaults에 로그인 상태 강제 저장
            userDefaults.set(true, forKey: "isLoggedIn")
            userDefaults.synchronize()
            
            // 8. @Published 프로퍼티 업데이트
            Task { @MainActor in
                self.userInfo = userInfo
                self.isLoggedIn = true
                self.isLoading = false
            }
            
            print("✅ 로그인 상태 복원 완료")
            print("✅ UserInfo 생성됨 - refreshToken: \(userInfo.refreshToken ?? "nil")")
            
            // 9. 토큰 자동 갱신 타이머 설정
            setupTokenRefreshTimer()
        } else {
            print("❌ 로그인 상태 복원 실패 - 토큰이 없거나 만료됨")
            print("  - isLoggedIn: \(isLoggedIn)")
            print("  - accessToken 존재: \(!accessToken.isEmpty)")
            print("  - refreshToken 존재: \(!refreshToken.isEmpty)")
            
            // 10. 로그인 상태 초기화
            Task { @MainActor in
                self.userInfo = nil
                self.isLoggedIn = false
                self.isLoading = false
            }
        }
    }
    
    // MARK: - 토큰 갱신 (개선된 버전)
    func refreshAccessToken() {
        print("🔄 === 토큰 갱신 시작 ===")
        
        // 1. UserDefaults에서 refreshToken 확인
        let refreshTokenFromDefaults = userDefaults.string(forKey: "refreshToken")
        let refreshTokenFromKeychain = loadFromKeychain(key: "refreshToken")
        
        // 2. refreshToken 우선순위: Keychain > UserDefaults
        let refreshToken = refreshTokenFromKeychain ?? refreshTokenFromDefaults
        
        guard let refreshToken = refreshToken, !refreshToken.isEmpty else {
            print("❌ 토큰 갱신 실패 - refreshToken이 없음")
            print("  - UserDefaults: \(refreshTokenFromDefaults ?? "nil")")
            print("  - Keychain: \(refreshTokenFromKeychain ?? "nil")")
            print("ℹ️ 로그인을 다시 해주세요.")
            return
        }
        
        print("✅ refreshToken 발견 - 갱신 시도")
        print("  - refreshToken: \(refreshToken)")
        
        refreshAccessTokenInternal()
    }
    
    // MARK: - 토큰 갱신 내부 로직 (개선된 버전)
    private func refreshAccessTokenInternal() {
        // 1. refreshToken 확인
        let refreshTokenFromDefaults = userDefaults.string(forKey: "refreshToken")
        let refreshTokenFromKeychain = loadFromKeychain(key: "refreshToken")
        let refreshToken = refreshTokenFromKeychain ?? refreshTokenFromDefaults
        
        guard let refreshToken = refreshToken, !refreshToken.isEmpty else {
            print("❌ 토큰 갱신 실패 - refreshToken이 없음")
            return
        }
        
        print("🔄 토큰 갱신 요청 중...")
        print("  - refreshToken: \(refreshToken)")
        print("  - refreshToken 길이: \(refreshToken.count)")
        print("  - 현재 accessToken: \(userDefaults.string(forKey: "accessToken") ?? "nil")")
        print("  - 현재 userInfo: \(userInfo != nil ? "존재" : "nil")")
        
        // 2. 토큰 갱신 API 호출
        guard let url = URL(string: "https://api.stylewh.com/auth/refresh") else {
            print("❌ 토큰 갱신 URL 생성 실패")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Melpik-iOS/1.0", forHTTPHeaderField: "User-Agent")
        
        // 쿠키 설정 (웹 애플리케이션과 동일하게)
        request.setValue("true", forHTTPHeaderField: "withCredentials")
        
        // 3. 요청 본문에 refreshToken 포함 (웹 애플리케이션과 동일한 형식)
        let requestBody: [String: Any] = [
            "refreshToken": refreshToken,
            "autoLogin": false
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
        } catch {
            print("❌ 요청 본문 생성 실패: \(error)")
            return
        }
        
        print("🔄 API 요청 전송:")
        print("  - URL: \(url)")
        print("  - Method: POST")
        print("  - Body: \(requestBody)")
        
        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            Task { @MainActor in
                guard let self = self else { return }
                
                if let error = error {
                    print("❌ 토큰 갱신 네트워크 오류: \(error)")
                    self.handleTokenRefreshFailure()
                    return
                }
                
                guard let data = data else {
                    print("❌ 토큰 갱신 응답 데이터 없음")
                    self.handleTokenRefreshFailure()
                    return
                }
                
                // 4. 응답 상태 코드 확인
                if let httpResponse = response as? HTTPURLResponse {
                    print("📡 HTTP 응답 상태: \(httpResponse.statusCode)")
                    print("📡 HTTP 응답 헤더: \(httpResponse.allHeaderFields)")
                    
                    if httpResponse.statusCode != 200 {
                        print("❌ 토큰 갱신 실패 - HTTP \(httpResponse.statusCode)")
                        
                        // 응답 본문에서 오류 정보 추출 시도
                        do {
                            let errorJson = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                            print("❌ 서버 오류 응답: \(errorJson ?? [:])")
                        } catch {
                            let errorString = String(data: data, encoding: .utf8)
                            print("❌ 서버 오류 응답 (텍스트): \(errorString ?? "nil")")
                        }
                        
                        self.handleTokenRefreshFailure()
                        return
                    }
                }
                
                do {
                    let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                    print("✅ 토큰 갱신 응답 수신")
                    print("  - 응답 데이터: \(json ?? [:])")
                    
                    if let accessToken = json?["accessToken"] as? String,
                       let expiresIn = json?["expiresIn"] as? Int {
                        
                        print("✅ 새로운 토큰 발급 성공")
                        print("  - accessToken: \(accessToken)")
                        print("  - expiresIn: \(expiresIn)초")
                        
                        // 5. expiresIn을 Date로 변환 (현재 시간 + expiresIn 초)
                        let expiresAt = Date().addingTimeInterval(TimeInterval(expiresIn))
                        
                        // 6. 토큰 업데이트 (refreshToken은 그대로 유지)
                        self.userDefaults.set(accessToken, forKey: "accessToken")
                        self.userDefaults.set(expiresAt, forKey: "tokenExpiresAt")
                        
                        // 7. UserInfo 업데이트 (refreshToken은 기존 것 유지)
                        if let userInfo = self.userInfo {
                            let updatedUserInfo = UserInfo(
                                id: userInfo.id,
                                email: userInfo.email,
                                name: userInfo.name,
                                token: accessToken,
                                refreshToken: userInfo.refreshToken, // 기존 refreshToken 유지
                                expiresAt: expiresAt
                            )
                            self.userInfo = updatedUserInfo
                        }
                        
                        // 8. Keychain에 저장 (동기 방식) - refreshToken은 기존 것 유지
                        self.saveToKeychainSync(key: "accessToken", value: accessToken)
                        
                        // 9. UserDefaults 강제 동기화
                        self.userDefaults.synchronize()
                        
                        // 10. 웹뷰에 새로운 토큰 전달 (API 응답 형식에 맞게 수정)
                        let tokenDataForWeb: [String: Any] = [
                            "token": accessToken,
                            "expiresAt": ISO8601DateFormatter().string(from: expiresAt)
                        ]
                        NotificationCenter.default.post(
                            name: NSNotification.Name("TokenRefreshed"),
                            object: nil,
                            userInfo: ["tokenData": tokenDataForWeb]
                        )
                        
                        // 11. 다음 갱신 타이머 설정
                        self.setupTokenRefreshTimer()
                        
                        print("✅ 토큰 갱신 성공")
                    } else {
                        print("❌ 토큰 갱신 응답 형식 오류")
                        print("  - accessToken: \(json?["accessToken"] ?? "nil")")
                        print("  - expiresIn: \(json?["expiresIn"] ?? "nil")")
                        self.handleTokenRefreshFailure()
                    }
                } catch {
                    print("❌ 토큰 갱신 응답 파싱 실패: \(error)")
                    self.handleTokenRefreshFailure()
                }
            }
        }.resume()
    }
    
    // MARK: - 로그아웃
    func logout() {
        print("=== logout called ===")
        
        // 1. 모든 토큰 제거
        removeToken()
        
        // 2. 지속 로그인 설정 제거
        userDefaults.set(false, forKey: "isLoggedIn")
        userDefaults.set(false, forKey: "persistentLogin")
        userDefaults.set(false, forKey: "autoLogin")
        userDefaults.removeObject(forKey: "userId")
        userDefaults.removeObject(forKey: "userEmail")
        userDefaults.removeObject(forKey: "userName")
        userDefaults.removeObject(forKey: "tokenExpiresAt")
        
        // 3. UserDefaults 동기화
        userDefaults.synchronize()
        
        // 4. @Published 프로퍼티 업데이트
        Task { @MainActor in
            self.userInfo = nil
            self.isLoggedIn = false
            self.isLoading = false
        }
        
        // 5. 자동 갱신 타이머 정리
        tokenRefreshTimer?.invalidate()
        tokenRefreshTimer = nil
        
        print("✅ 로그아웃 완료 - 모든 토큰과 지속 로그인 설정 제거됨")
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
            print("[saveTokensWithKeepLogin] saveToKeychainSync(accessToken)")
            saveToKeychainSync(key: "accessToken", value: accessToken)
            if let refreshToken = refreshToken {
                userDefaults.set(refreshToken, forKey: "refreshToken")
                print("[saveTokensWithKeepLogin] saveToKeychainSync(refreshToken)")
                saveToKeychainSync(key: "refreshToken", value: refreshToken)
            }
            print("UserDefaults에 토큰 저장됨 (로그인 상태 유지)")
        } else {
            // 세션 유지: UserDefaults에 저장하되 앱 종료 시 삭제될 수 있음
            userDefaults.set(accessToken, forKey: "accessToken")
            print("[saveTokensWithKeepLogin] saveToKeychainSync(accessToken)")
            saveToKeychainSync(key: "accessToken", value: accessToken)
            if let refreshToken = refreshToken {
                userDefaults.set(refreshToken, forKey: "refreshToken")
                print("[saveTokensWithKeepLogin] saveToKeychainSync(refreshToken)")
                saveToKeychainSync(key: "refreshToken", value: refreshToken)
            }
            print("UserDefaults에 토큰 저장됨 (세션 유지)")
        }
        
        // Keychain에도 저장 (보안 강화) - 동기 방식으로 즉시 저장
        print("[saveTokensWithKeepLogin] saveToKeychainSync(accessToken)")
        saveToKeychainSync(key: "accessToken", value: accessToken)
        if let refreshToken = refreshToken {
            print("[saveTokensWithKeepLogin] saveToKeychainSync(refreshToken)")
            saveToKeychainSync(key: "refreshToken", value: refreshToken)
        }
        
        // 로그인 상태 설정
        userDefaults.set(true, forKey: "isLoggedIn")
        userDefaults.set(true, forKey: "persistentLogin")
        userDefaults.set(true, forKey: "autoLogin")
        userDefaults.synchronize()
        
        print("인스타그램 방식 토큰 저장 완료")
    }
    
    /// 인스타그램 방식 로그인 상태 확인
    func checkInstagramLoginStatus() -> Bool {
        print("=== checkInstagramLoginStatus called ===")
        
        // UserDefaults에서 토큰 확인
        let accessToken = userDefaults.string(forKey: "accessToken")
        let refreshToken = userDefaults.string(forKey: "refreshToken")
        let isLoggedIn = userDefaults.bool(forKey: "isLoggedIn")
        
        print("UserDefaults 상태:")
        print("- isLoggedIn: \(isLoggedIn)")
        print("- accessToken: \(accessToken ?? "nil")")
        print("- refreshToken: \(refreshToken ?? "nil")")
        
        // 로그인 상태가 아니거나 토큰이 없는 경우
        guard isLoggedIn && (accessToken != nil || refreshToken != nil) else {
            print("ℹ️ 로그인 상태가 아니거나 토큰이 없음")
            return false
        }
        
        // accessToken이 없어도 refreshToken이 있으면 갱신 시도
        if let refreshToken = refreshToken, !refreshToken.isEmpty {
            print("✅ refreshToken이 존재함 - 토큰 갱신 시도")
            refreshAccessToken()
            return true
        }
        
        guard let token = accessToken, !token.isEmpty else {
            print("❌ accessToken이 없음")
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
                        let timeUntilExpiry = exp - currentTime
                        
                        print("토큰 만료 시간 확인:")
                        print("- 만료 시간: \(Date(timeIntervalSince1970: exp))")
                        print("- 현재 시간: \(Date(timeIntervalSince1970: currentTime))")
                        print("- 남은 시간: \(timeUntilExpiry)초")
                        
                        if exp < currentTime {
                            print("⚠️ accessToken이 만료됨 - refreshToken으로 갱신 시도")
                            if let refreshToken = refreshToken, !refreshToken.isEmpty {
                                print("✅ refreshToken이 존재함 - 갱신 시도")
                                refreshAccessToken()
                                return true
                            } else {
                                print("❌ refreshToken이 없어 로그아웃")
                                logout()
                                return false
                            }
                        } else if timeUntilExpiry < 300 { // 5분 이내 만료
                            print("⚠️ accessToken이 곧 만료됨 - 갱신 시도")
                            refreshAccessToken()
                        }
                        
                        print("✅ 토큰 유효성 확인 완료")
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
    
    /// 인스타그램 방식 로그인 상태 유지 초기화 (비동기)
    func initializeInstagramLoginStatus() async {
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
            
            self.userInfo = userInfo
            self.isLoggedIn = true
            
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
    
    // MARK: - 토큰 저장 확인 및 복구 (개선된 버전)
    func verifyTokenStorage() {
        print("🔍 === 토큰 저장 확인 및 복구 시작 ===")
        
        let accessTokenFromDefaults = userDefaults.string(forKey: "accessToken")
        let accessTokenFromKeychain = loadFromKeychain(key: "accessToken")
        let refreshTokenFromDefaults = userDefaults.string(forKey: "refreshToken")
        let refreshTokenFromKeychain = loadFromKeychain(key: "refreshToken")
        let isLoggedIn = userDefaults.bool(forKey: "isLoggedIn")
        
        print("📊 토큰 저장 상태:")
        print("  - isLoggedIn: \(isLoggedIn)")
        print("  - UserDefaults accessToken: \(accessTokenFromDefaults != nil ? "✅" : "❌")")
        print("  - Keychain accessToken: \(accessTokenFromKeychain != nil ? "✅" : "❌")")
        print("  - UserDefaults refreshToken: \(refreshTokenFromDefaults != nil ? "✅" : "❌")")
        print("  - Keychain refreshToken: \(refreshTokenFromKeychain != nil ? "✅" : "❌")")
        
        // 1. accessToken 불일치 시 복구
        if accessTokenFromDefaults != accessTokenFromKeychain {
            print("⚠️ Access token 불일치 감지, 복구 시도")
            if let keychainToken = accessTokenFromKeychain {
                userDefaults.set(keychainToken, forKey: "accessToken")
                userDefaults.synchronize()
                print("✅ Keychain에서 UserDefaults로 accessToken 복구 완료")
            } else if let defaultsToken = accessTokenFromDefaults {
                saveToKeychainSync(key: "accessToken", value: defaultsToken)
                print("✅ UserDefaults에서 Keychain으로 accessToken 복구 완료")
            }
        }
        
        // 2. refreshToken 불일치 시 복구
        if refreshTokenFromDefaults != refreshTokenFromKeychain {
            print("⚠️ Refresh token 불일치 감지, 복구 시도")
            if let keychainToken = refreshTokenFromKeychain {
                userDefaults.set(keychainToken, forKey: "refreshToken")
                userDefaults.synchronize()
                print("✅ Keychain에서 UserDefaults로 refreshToken 복구 완료")
            } else if let defaultsToken = refreshTokenFromDefaults {
                saveToKeychainSync(key: "refreshToken", value: defaultsToken)
                print("✅ UserDefaults에서 Keychain으로 refreshToken 복구 완료")
            }
        }
        
        // 3. 로그인 상태 복구 (토큰이 있지만 isLoggedIn이 false인 경우)
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
        
        // 4. 토큰 유효성 검사
        if let expiresAt = userDefaults.object(forKey: "tokenExpiresAt") as? Date {
            let timeUntilExpiry = expiresAt.timeIntervalSinceNow
            print("⏰ 토큰 만료 시간 확인:")
            print("  - 만료 시간: \(expiresAt)")
            print("  - 남은 시간: \(timeUntilExpiry)초")
            
            if timeUntilExpiry < 0 {
                print("❌ 토큰이 만료됨 - 갱신 시도")
                refreshAccessToken()
            } else if timeUntilExpiry < 300 { // 5분 이내 만료
                print("⚠️ 토큰이 곧 만료됨 - 갱신 시도")
                refreshAccessToken()
            }
        }
        
        print("🔍 === 토큰 저장 확인 및 복구 완료 ===")
    }
    
    // MARK: - 자동 토큰 복구 시스템
    func autoRecoverTokens() {
        print("🔄 === 자동 토큰 복구 시작 ===")
        
        // 1. 현재 토큰 상태 확인
        let accessTokenFromDefaults = userDefaults.string(forKey: "accessToken")
        let accessTokenFromKeychain = loadFromKeychain(key: "accessToken")
        let refreshTokenFromDefaults = userDefaults.string(forKey: "refreshToken")
        let refreshTokenFromKeychain = loadFromKeychain(key: "refreshToken")
        
        // 2. 토큰 복구 시도
        var recovered = false
        
        // accessToken 복구
        if let keychainToken = accessTokenFromKeychain, keychainToken != accessTokenFromDefaults {
            userDefaults.set(keychainToken, forKey: "accessToken")
            userDefaults.synchronize()
            print("✅ accessToken 복구 완료")
            recovered = true
        }
        
        // refreshToken 복구
        if let keychainToken = refreshTokenFromKeychain, keychainToken != refreshTokenFromDefaults {
            userDefaults.set(keychainToken, forKey: "refreshToken")
            userDefaults.synchronize()
            print("✅ refreshToken 복구 완료")
            recovered = true
        }
        
        // 3. UserDefaults에서 Keychain으로 복구
        if accessTokenFromDefaults != nil && accessTokenFromKeychain == nil {
            saveToKeychainSync(key: "accessToken", value: accessTokenFromDefaults!)
            print("✅ UserDefaults에서 Keychain으로 accessToken 복구")
            recovered = true
        }
        
        if refreshTokenFromDefaults != nil && refreshTokenFromKeychain == nil {
            saveToKeychainSync(key: "refreshToken", value: refreshTokenFromDefaults!)
            print("✅ UserDefaults에서 Keychain으로 refreshToken 복구")
            recovered = true
        }
        
        if recovered {
            print("🔄 토큰 복구 후 로그인 상태 재확인")
            loadLoginState()
        } else {
            print("ℹ️ 복구할 토큰이 없음")
        }
        
        print("🔄 === 자동 토큰 복구 완료 ===")
    }
    
    // MARK: - 토큰 저장 안정성 검증
    func validateTokenStorage() -> Bool {
        print("🔍 === 토큰 저장 안정성 검증 시작 ===")
        
        let accessTokenFromDefaults = userDefaults.string(forKey: "accessToken")
        let accessTokenFromKeychain = loadFromKeychain(key: "accessToken")
        let refreshTokenFromDefaults = userDefaults.string(forKey: "refreshToken")
        let refreshTokenFromKeychain = loadFromKeychain(key: "refreshToken")
        
        let hasAccessToken = (accessTokenFromDefaults != nil && !accessTokenFromDefaults!.isEmpty) ||
                           (accessTokenFromKeychain != nil && !accessTokenFromKeychain!.isEmpty)
        
        let hasRefreshToken = (refreshTokenFromDefaults != nil && !refreshTokenFromDefaults!.isEmpty) ||
                            (refreshTokenFromKeychain != nil && !refreshTokenFromKeychain!.isEmpty)
        
        let isConsistent = (accessTokenFromDefaults == accessTokenFromKeychain) &&
                          (refreshTokenFromDefaults == refreshTokenFromKeychain)
        
        print("📊 토큰 저장 안정성:")
        print("  - accessToken 존재: \(hasAccessToken ? "✅" : "❌")")
        print("  - refreshToken 존재: \(hasRefreshToken ? "✅" : "❌")")
        print("  - 저장소 일관성: \(isConsistent ? "✅" : "❌")")
        
        let isValid = hasAccessToken || hasRefreshToken
        
        print("🔍 === 토큰 저장 안정성 검증 완료: \(isValid ? "✅ 유효" : "❌ 무효") ===")
        
        return isValid
    }
    
    // MARK: - 생체 인증을 통한 로그인 (제거됨)
    // 생체 인증 기능이 완전히 제거되었습니다.
    
    // MARK: - 웹에서 받은 로그인 데이터 처리
    func saveLoginInfo(_ loginData: [String: Any]) {
        print("[saveLoginInfo] called with loginData: \(loginData)")
        
        // 토큰 저장 (동기 방식으로 즉시 저장)
        if let token = loginData["token"] as? String {
            print("[saveLoginInfo] saveToKeychainSync(accessToken): \(token)")
            saveToKeychainSync(key: "accessToken", value: token)
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
        
        // 3. refreshToken이 있으면 저장 (동기 방식으로 즉시 저장)
        if let rt = refreshToken {
            print("[saveLoginInfo] saveToKeychainSync(refreshToken): \(rt)")
            saveToKeychainSync(key: "refreshToken", value: rt)
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
                
                // iOS 앱에 저장 (동기 방식으로 즉시 저장)
                self?.userDefaults.set(refreshToken, forKey: "refreshToken")
                self?.saveToKeychainSync(key: "refreshToken", value: refreshToken)
                
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
    
    // MARK: - 로그인 상태 점검 및 디버그
    func checkLoginPersistence() -> Bool {
        print("🔍 === 로그인 상태 유지 점검 시작 ===")
        
        // 1. UserDefaults 상태 확인
        let isLoggedIn = userDefaults.bool(forKey: "isLoggedIn")
        let userId = userDefaults.string(forKey: "userId")
        let userEmail = userDefaults.string(forKey: "userEmail")
        let userName = userDefaults.string(forKey: "userName")
        let accessTokenFromDefaults = userDefaults.string(forKey: "accessToken")
        let refreshTokenFromDefaults = userDefaults.string(forKey: "refreshToken")
        let expiresAtFromDefaults = userDefaults.object(forKey: "tokenExpiresAt") as? Date
        
        print("📱 UserDefaults 상태:")
        print("  - isLoggedIn: \(isLoggedIn)")
        print("  - userId: \(userId ?? "nil")")
        print("  - userEmail: \(userEmail ?? "nil")")
        print("  - userName: \(userName ?? "nil")")
        print("  - accessToken: \(accessTokenFromDefaults != nil ? "✅ 존재" : "❌ 없음")")
        print("  - refreshToken: \(refreshTokenFromDefaults != nil ? "✅ 존재" : "❌ 없음")")
        print("  - expiresAt: \(expiresAtFromDefaults?.description ?? "nil")")
        
        // 2. Keychain 상태 확인
        let accessTokenFromKeychain = loadFromKeychain(key: "accessToken")
        let refreshTokenFromKeychain = loadFromKeychain(key: "refreshToken")
        
        print("🔐 Keychain 상태:")
        print("  - accessToken: \(accessTokenFromKeychain != nil ? "✅ 존재" : "❌ 없음")")
        print("  - refreshToken: \(refreshTokenFromKeychain != nil ? "✅ 존재" : "❌ 없음")")
        
        // 3. 현재 LoginManager 상태 확인
        print("🏗️ LoginManager 상태:")
        print("  - isLoggedIn: \(self.isLoggedIn)")
        print("  - isLoading: \(self.isLoading)")
        print("  - userInfo: \(self.userInfo != nil ? "✅ 존재" : "❌ 없음")")
        if let userInfo = self.userInfo {
            print("    - id: \(userInfo.id)")
            print("    - email: \(userInfo.email)")
            print("    - name: \(userInfo.name)")
            print("    - token: \(userInfo.token.isEmpty ? "❌ 비어있음" : "✅ 존재")")
            print("    - refreshToken: \(userInfo.refreshToken != nil ? "✅ 존재" : "❌ 없음")")
            print("    - expiresAt: \(userInfo.expiresAt?.description ?? "nil")")
        }
        
        // 4. 토큰 유효성 검사
        if let expiresAt = expiresAtFromDefaults {
            let timeUntilExpiry = expiresAt.timeIntervalSinceNow
            print("⏰ 토큰 만료 시간:")
            print("  - 만료 시간: \(expiresAt)")
            print("  - 남은 시간: \(timeUntilExpiry)초")
            print("  - 상태: \(timeUntilExpiry > 0 ? "✅ 유효" : "❌ 만료")")
        }
        
        // 5. 동기화 상태 확인
        let accessTokenSync = accessTokenFromDefaults == accessTokenFromKeychain
        let refreshTokenSync = refreshTokenFromDefaults == refreshTokenFromKeychain
        
        print("🔄 동기화 상태:")
        print("  - accessToken 동기화: \(accessTokenSync ? "✅" : "❌")")
        print("  - refreshToken 동기화: \(refreshTokenSync ? "✅" : "❌")")
        
        // 6. 로그인 상태 유지 가능성 판단
        let hasValidToken = (accessTokenFromDefaults != nil && !accessTokenFromDefaults!.isEmpty) || 
                           (accessTokenFromKeychain != nil && !accessTokenFromKeychain!.isEmpty) ||
                           (refreshTokenFromDefaults != nil && !refreshTokenFromDefaults!.isEmpty) ||
                           (refreshTokenFromKeychain != nil && !refreshTokenFromKeychain!.isEmpty)
        
        let canMaintainLogin = hasValidToken && (isLoggedIn || self.isLoggedIn)
        
        print("🎯 로그인 상태 유지 가능성:")
        print("  - 유효한 토큰 존재: \(hasValidToken ? "✅" : "❌")")
        print("  - 로그인 상태 플래그: \(isLoggedIn || self.isLoggedIn ? "✅" : "❌")")
        print("  - 로그인 유지 가능: \(canMaintainLogin ? "✅ 가능" : "❌ 불가능")")
        
        print("🔍 === 로그인 상태 유지 점검 완료 ===")
        
        return canMaintainLogin
    }
    
    // MARK: - 강제 로그인 상태 복구
    func forceRestoreLoginState() {
        print("🔄 === 강제 로그인 상태 복구 시작 ===")
        
        // 토큰 저장 확인 및 복구
        verifyTokenStorage()
        
        // 로그인 상태 다시 로드
        loadLoginState()
        
        // 최종 상태 확인
        let restored = checkLoginPersistence()
        
        if restored {
            print("✅ 강제 로그인 상태 복구 성공")
        } else {
            print("❌ 강제 로그인 상태 복구 실패")
        }
        
        print("🔄 === 강제 로그인 상태 복구 완료 ===")
    }
    
    // MARK: - 토큰 저장 테스트
    func testTokenStorage() {
        print("🧪 === 토큰 저장 테스트 시작 ===")
        
        let testToken = "test_access_token_\(Date().timeIntervalSince1970)"
        let testRefreshToken = "test_refresh_token_\(Date().timeIntervalSince1970)"
        
        // 1. Keychain에 저장
        print("1. Keychain에 테스트 토큰 저장...")
        saveToKeychainSync(key: "testAccessToken", value: testToken)
        saveToKeychainSync(key: "testRefreshToken", value: testRefreshToken)
        
        // 2. 저장된 토큰 확인
        print("2. 저장된 토큰 확인...")
        let loadedAccessToken = loadFromKeychain(key: "testAccessToken")
        let loadedRefreshToken = loadFromKeychain(key: "testRefreshToken")
        
        let accessTokenSuccess = loadedAccessToken == testToken
        let refreshTokenSuccess = loadedRefreshToken == testRefreshToken
        
        print("  - accessToken 저장: \(accessTokenSuccess ? "✅ 성공" : "❌ 실패")")
        print("  - refreshToken 저장: \(refreshTokenSuccess ? "✅ 성공" : "❌ 실패")")
        
        // 3. 테스트 토큰 정리
        print("3. 테스트 토큰 정리...")
        deleteFromKeychain(key: "testAccessToken")
        deleteFromKeychain(key: "testRefreshToken")
        
        let overallSuccess = accessTokenSuccess && refreshTokenSuccess
        print("🧪 === 토큰 저장 테스트 결과: \(overallSuccess ? "✅ 성공" : "❌ 실패") ===")
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
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 1_000_000_000) // 1초 대기
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
