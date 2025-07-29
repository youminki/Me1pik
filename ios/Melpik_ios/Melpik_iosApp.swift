//
//  Melpik_iosApp.swift
//  Melpik_ios
//
//  Created by 유민기 on 6/30/25.
//

import SwiftUI
import UserNotifications

@main
struct Melpik_iosApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

// MARK: - AppDelegate
class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    // LoginManager를 전역 프로퍼티로 추가
    let loginManager = LoginManager()
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        print("앱이실행되었습니다") // 앱 실행 확인용 로그

        // 앱 시작 시 로그인 상태 복원 (강화)
        print("=== 앱 시작 - 로그인 상태 복원 시작 ===")
        
        // 로그인 상태 복원
        LoginManager.shared.loadLoginState()
        
        // 토큰 저장 상태 확인 및 복구
        LoginManager.shared.verifyTokenStorage()
        
        // 로그인 상태 재확인 (이중 보장)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            print("=== 앱 시작 - 로그인 상태 재확인 ===")
            LoginManager.shared.loadLoginState()
        }
        
        // 푸시 알림 델리게이트 설정
        UNUserNotificationCenter.current().delegate = self
        
        // 푸시 알림 권한 요청
        requestNotificationPermission()
        
        // 원격 알림 등록
        application.registerForRemoteNotifications()
        
        // 상태바 스타일 설정은 SwiftUI에서 처리
        
        print("=== 앱 시작 - 로그인 상태 복원 완료 ===")
        return true
    }
    
    // MARK: - 푸시 알림 권한 요청
    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            DispatchQueue.main.async {
                if granted {
                    print("푸시 알림 권한이 허용되었습니다.")
                } else {
                    print("푸시 알림 권한이 거부되었습니다.")
                }
                
                if let error = error {
                    print("푸시 알림 권한 요청 중 오류: \(error)")
                }
            }
        }
    }
    
    // MARK: - 푸시 알림 토큰 등록
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
        let token = tokenParts.joined()
        print("Device Token: \(token)")
        
        // 토큰을 서버에 전송
        sendTokenToServer(token: token)
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Failed to register for remote notifications: \(error)")
    }
    
    // MARK: - 서버에 토큰 전송
    private func sendTokenToServer(token: String) {
        // 서버 URL 설정 (실제 서버 URL로 변경)
        guard let url = URL(string: "https://api.stylewh.com/api/push-token") else {
            print("잘못된 서버 URL")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = [
            "deviceToken": token,
            "platform": "iOS",
            "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        } catch {
            print("토큰 데이터 직렬화 오류: \(error)")
            return
        }
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("토큰 전송 오류: \(error)")
                return
            }
            
            if let httpResponse = response as? HTTPURLResponse {
                print("토큰 전송 응답: \(httpResponse.statusCode)")
            }
        }.resume()
    }
    
    // MARK: - 앱 생명주기 처리
    func applicationWillResignActive(_ application: UIApplication) {
        print("=== AppDelegate: applicationWillResignActive ===")
        LoginManager.shared.ensureTokenPersistence()
    }
    
    func applicationDidEnterBackground(_ application: UIApplication) {
        print("=== AppDelegate: applicationDidEnterBackground ===")
        LoginManager.shared.ensureTokenPersistence()
    }
    
    func applicationWillEnterForeground(_ application: UIApplication) {
        print("=== AppDelegate: applicationWillEnterForeground ===")
        LoginManager.shared.verifyTokenStorage()
    }
    
    func applicationDidBecomeActive(_ application: UIApplication) {
        print("=== AppDelegate: applicationDidBecomeActive ===")
        LoginManager.shared.verifyTokenStorage()
    }
    
    func applicationWillTerminate(_ application: UIApplication) {
        print("=== AppDelegate: applicationWillTerminate ===")
        LoginManager.shared.ensureTokenPersistence()
    }
    
    // MARK: - UNUserNotificationCenterDelegate
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        // 앱이 포그라운드에 있을 때 알림 표시
        completionHandler([.banner, .badge, .sound])
    }
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        // 알림을 탭했을 때의 처리
        let userInfo = response.notification.request.content.userInfo
        print("Notification tapped: \(userInfo)")
        
        // 웹뷰에 알림 데이터 전달
        NotificationCenter.default.post(name: .didReceiveNotification, object: nil, userInfo: userInfo)
        
        completionHandler()
    }
}

// MARK: - Notification Names
extension Notification.Name {
    static let didReceiveNotification = Notification.Name("didReceiveNotification")
}
