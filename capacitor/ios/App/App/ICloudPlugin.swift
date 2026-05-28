import Foundation
import Capacitor

@objc(ICloudPlugin)
public class ICloudPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ICloudPlugin"
    public let jsName = "ICloud"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getUbiquityContainer", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startDownload", returnType: CAPPluginReturnPromise)
    ]

    @objc func getUbiquityContainer(_ call: CAPPluginCall) {
        // forUbiquityContainerIdentifier: nil → use the first container declared
        // in the entitlement (iCloud.org.tagspaces.mobileapp). Returns nil if
        // iCloud Drive is disabled, the user isn't signed in, or the container
        // hasn't been provisioned yet on Apple's side.
        DispatchQueue.global(qos: .userInitiated).async {
            guard let containerURL = FileManager.default.url(forUbiquityContainerIdentifier: nil) else {
                call.resolve(["available": false])
                return
            }
            let documentsURL = containerURL.appendingPathComponent("Documents", isDirectory: true)
            try? FileManager.default.createDirectory(at: documentsURL,
                                                    withIntermediateDirectories: true)
            call.resolve([
                "available": true,
                "containerPath": containerURL.path,
                "documentsPath": documentsURL.path
            ])
        }
    }

    @objc func startDownload(_ call: CAPPluginCall) {
        guard let path = call.getString("path") else {
            call.reject("path is required")
            return
        }
        let url = URL(fileURLWithPath: path)
        do {
            try FileManager.default.startDownloadingUbiquitousItem(at: url)
            call.resolve(["started": true])
        } catch {
            call.reject("startDownloadingUbiquitousItem failed: \(error.localizedDescription)")
        }
    }
}
