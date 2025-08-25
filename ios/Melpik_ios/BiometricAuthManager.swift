import Foundation
import LocalAuthentication
import Combine

/**
 * 🧬 iOS Biometric 인증 관리자
 * 지문/FaceID 기반 로그인 및 자동로그인 연동
 */
@MainActor
class BiometricAuthManager: ObservableObject {
    
    // MARK: - Published Properties
    @Published var isBiometricAvailable = false
    @Published var biometricType: LABiometryType = .none
    @Published var isAuthenticating = false
    @Published var lastAuthResult: BiometricAuthResult?
    
    // MARK: - Private Properties
    private let context = LAContext()
    private let keychainService = "com.melpik.biometric"
    private let biometricKey = "biometric_auth_key"
    
    // MARK: - Initialization
    init() {
        checkBiometricAvailability()
    }
    
    // MARK: - Biometric Availability Check
    func checkBiometricAvailability() {
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            isBiometricAvailable = true
            biometricType = context.biometryType
            print("🧬 Biometric 인증 사용 가능:", biometricType.description)
        } else {
            isBiometricAvailable = false
            biometricType = .none
            if let error = error {
                print("❌ Biometric 인증 사용 불가:", error.localizedDescription)
            }
        }
    }
    
    // MARK: - Biometric Authentication
    func authenticateWithBiometrics(reason: String = "로그인을 위해 생체 인증이 필요합니다") async -> BiometricAuthResult {
        guard isBiometricAvailable else {
            return BiometricAuthResult(success: false, error: .biometricNotAvailable)
        }
        
        isAuthenticating = true
        defer { isAuthenticating = false }
        
        do {
            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: reason
            )
            
            if success {
                print("✅ Biometric 인증 성공")
                let result = BiometricAuthResult(success: true, error: nil)
                lastAuthResult = result
                return result
            } else {
                print("❌ Biometric 인증 실패")
                let result = BiometricAuthResult(success: false, error: .authenticationFailed)
                lastAuthResult = result
                return result
            }
            
        } catch {
            print("❌ Biometric 인증 에러:", error.localizedDescription)
            let authError = BiometricAuthError.fromLAError(error as! LAError)
            let result = BiometricAuthResult(success: false, error: authError)
            lastAuthResult = result
            return result
        }
    }
    
    // MARK: - Biometric Auto Login
    func authenticateForAutoLogin() async -> BiometricAuthResult {
        return await authenticateWithBiometrics(reason: "자동 로그인을 위해 생체 인증이 필요합니다")
    }
    
    // MARK: - Biometric Settings
    func enableBiometricAuth() async -> Bool {
        let result = await authenticateWithBiometrics(reason: "생체 인증 설정을 위해 인증이 필요합니다")
        return result.success
    }
    
    func disableBiometricAuth() {
        // 생체 인증 비활성화 (사용자 설정에서 관리)
        print("🧬 Biometric 인증 비활성화됨")
    }
    
    // MARK: - Biometric Status
    var biometricTypeDescription: String {
        switch biometricType {
        case .faceID:
            return "Face ID"
        case .touchID:
            return "Touch ID"
        case .none:
            return "사용 불가"
        @unknown default:
            return "알 수 없음"
        }
    }
    
    var isFaceIDAvailable: Bool {
        return biometricType == .faceID
    }
    
    var isTouchIDAvailable: Bool {
        return biometricType == .touchID
    }
}

// MARK: - Biometric Auth Result
struct BiometricAuthResult {
    let success: Bool
    let error: BiometricAuthError?
    
    var isSuccess: Bool { success }
    var hasError: Bool { error != nil }
}

// MARK: - Biometric Auth Error
enum BiometricAuthError: Error, LocalizedError {
    case biometricNotAvailable
    case authenticationFailed
    case userCancel
    case userFallback
    case systemCancel
    case passcodeNotSet
    case biometryNotEnrolled
    case biometryLockout
    case appCancel
    case invalidContext
    case notInteractive
    case watchNotAvailable
    case unknown
    
    var errorDescription: String? {
        switch self {
        case .biometricNotAvailable:
            return "생체 인증을 사용할 수 없습니다"
        case .authenticationFailed:
            return "생체 인증에 실패했습니다"
        case .userCancel:
            return "사용자가 인증을 취소했습니다"
        case .userFallback:
            return "사용자가 대체 인증 방식을 선택했습니다"
        case .systemCancel:
            return "시스템이 인증을 취소했습니다"
        case .passcodeNotSet:
            return "기기 잠금 암호가 설정되지 않았습니다"
        case .biometryNotEnrolled:
            return "생체 인증이 등록되지 않았습니다"
        case .biometryLockout:
            return "생체 인증이 잠겨있습니다. 기기 잠금 암호를 입력해주세요"
        case .appCancel:
            return "앱이 인증을 취소했습니다"
        case .invalidContext:
            return "잘못된 인증 컨텍스트입니다"
        case .notInteractive:
            return "인터랙티브하지 않은 인증 요청입니다"
        case .watchNotAvailable:
            return "Apple Watch 인증을 사용할 수 없습니다"
        case .unknown:
            return "알 수 없는 오류가 발생했습니다"
        }
    }
    
    static func fromLAError(_ error: LAError) -> BiometricAuthError {
        switch error.code {
        case .biometryNotAvailable:
            return .biometricNotAvailable
        case .authenticationFailed:
            return .authenticationFailed
        case .userCancel:
            return .userCancel
        case .userFallback:
            return .userFallback
        case .systemCancel:
            return .systemCancel
        case .passcodeNotSet:
            return .passcodeNotSet
        case .biometryNotEnrolled:
            return .biometryNotEnrolled
        case .biometryLockout:
            return .biometryLockout
        case .appCancel:
            return .appCancel
        case .invalidContext:
            return .invalidContext
        case .notInteractive:
            return .notInteractive
        case .watchNotAvailable:
            return .watchNotAvailable
        default:
            return .unknown
        }
    }
}

// MARK: - LABiometryType Extension
extension LABiometryType {
    var description: String {
        switch self {
        case .faceID:
            return "Face ID"
        case .touchID:
            return "Touch ID"
        case .none:
            return "None"
        @unknown default:
            return "Unknown"
        }
    }
}
